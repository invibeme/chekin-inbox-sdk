import {ChekinMessage, ChekinEventCallback, ChekinHostSDKConfig} from '../types';
import {ChekinLogger} from '../utils/ChekinLogger.js';
import {CHEKIN_EVENTS} from '../constants';
import {PACKAGE_INFO} from '../utils/packageInfo.js';

export class ChekinCommunicator {
  private iframe: HTMLIFrameElement;
  private eventListeners: Map<string, ChekinEventCallback[]> = new Map();
  private config: ChekinHostSDKConfig;
  private logger: ChekinLogger;
  private currentRoute: string = '#/';
  private routeSyncEnabled: boolean = true;
  private hashPrefix: string = 'chekin';

  constructor(
    iframe: HTMLIFrameElement,
    config: ChekinHostSDKConfig,
    logger: ChekinLogger,
  ) {
    this.iframe = iframe;
    this.config = config;
    this.logger = logger;
    window.addEventListener('message', this.handleMessage.bind(this));

    if (config.routeSync !== false) {
      this.enableRouteSync({hashPrefix: 'chekin'});
      this.logger.debug(
        'ChekinCommunicator initialized with automatic route sync',
        undefined,
        'COMMUNICATION',
      );
    } else {
      this.routeSyncEnabled = false;
      this.logger.debug(
        'ChekinCommunicator initialized with route sync disabled',
        undefined,
        'COMMUNICATION',
      );
    }
  }

  private handleMessage(event: MessageEvent<ChekinMessage>) {
    // Security check: ensure message is from our iframe
    if (event.source !== this.iframe.contentWindow) return;

    this.logger.logCommunicationEvent(event.data.type, event.data.payload);

    if (event.data.type === CHEKIN_EVENTS.ROUTE_CHANGED && this.routeSyncEnabled) {
      const payload = event.data.payload as {
        path: string;
        hash: string;
        title: string;
        fullUrl: string;
      };
      this.handleIframeRouteChange(payload?.hash || payload?.fullUrl);
    }

    const listeners = this.eventListeners.get(event.data.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event.data.payload);
      } catch (error) {
        this.logger.error(
          'Error in Chekin event listener',
          {error, eventType: event.data.type},
          'COMMUNICATION',
        );
      }
    });
  }

  public on<T>(type: string, callback: ChekinEventCallback<T>): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(callback as ChekinEventCallback);
    this.logger.debug(`Event listener added for: ${type}`, undefined, 'COMMUNICATION');
  }

  public off(type: string, callback: ChekinEventCallback): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
        this.logger.debug(
          `Event listener removed for: ${type}`,
          undefined,
          'COMMUNICATION',
        );
      }
    }
  }

  public send(message: ChekinMessage): void {
    if (this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage(message, '*');
      this.logger.debug(
        `Message sent to iframe: ${message.type}`,
        message.payload,
        'COMMUNICATION',
      );
    } else {
      this.logger.warn(
        'Cannot send message: iframe contentWindow is not available',
        {messageType: message.type},
        'COMMUNICATION',
      );
    }
  }

  public enableRouteSync(options: {hashPrefix?: string} = {}): void {
    this.routeSyncEnabled = true;
    this.hashPrefix = options.hashPrefix || 'chekin';

    // Listen for hash changes in parent window
    window.addEventListener('hashchange', this.handleParentHashChange.bind(this));

    this.logger.debug(
      'Route synchronization enabled',
      {hashPrefix: this.hashPrefix},
      'COMMUNICATION',
    );
  }

  public disableRouteSync(): void {
    this.routeSyncEnabled = false;
    window.removeEventListener('hashchange', this.handleParentHashChange.bind(this));
    this.logger.debug('Route synchronization disabled', undefined, 'COMMUNICATION');
  }

  private handleParentHashChange(): void {
    if (!this.routeSyncEnabled) return;

    const hash = window.location.hash.slice(1);
    const routeMatch = hash.match(new RegExp(`^${this.hashPrefix}=(.+)`));

    if (routeMatch) {
      const route = decodeURIComponent(routeMatch[1]);
      if (route !== this.currentRoute) {
        this.syncRouteToIframe(route);
      }
    }
  }

  private handleIframeRouteChange(route: string): void {
    const hashRoute = route.startsWith('#') ? route : `#${route}`;

    if (hashRoute !== this.currentRoute) {
      this.currentRoute = hashRoute;
      this.updateParentHash(hashRoute);
      this.logger.debug(
        'Route synchronized from iframe to parent',
        {route: hashRoute},
        'COMMUNICATION',
      );
    }
  }

  private syncRouteToIframe(route: string): void {
    const hashRoute = route.startsWith('#') ? route : `#${route}`;
    this.currentRoute = hashRoute;
    this.send({
      type: 'route-sync',
      payload: {route: hashRoute},
    });
    this.logger.debug(
      'Route synchronized from parent to iframe',
      {route: hashRoute},
      'COMMUNICATION',
    );
  }

  private updateParentHash(route: string): void {
    const cleanRoute = route.startsWith('#') ? route.slice(1) : route;
    const encodedRoute = encodeURIComponent(cleanRoute);
    const newHash = `#${this.hashPrefix}=${encodedRoute}`;

    // Update hash without triggering hashchange event
    if (window.history.replaceState) {
      window.history.replaceState(null, '', newHash);
    } else {
      window.location.hash = newHash;
    }
  }

  public navigateToRoute(route: string): void {
    if (this.routeSyncEnabled) {
      this.syncRouteToIframe(route);
      this.updateParentHash(route);
    } else {
      this.send({
        type: 'navigate',
        payload: {path: route},
      });
    }
    this.logger.debug('Programmatic navigation initiated', {route}, 'COMMUNICATION');
  }

  public getCurrentRoute(): string {
    return this.currentRoute;
  }

  public sendHandshake(): void {
    const handshakePayload = {
      type: CHEKIN_EVENTS.HANDSHAKE,
      payload: {
        timestamp: Date.now(),
        sdk: PACKAGE_INFO.name,
        version: PACKAGE_INFO.version,
        origin: window.location.origin,
      },
    };

    this.send(handshakePayload);
    this.logger.debug(
      'Handshake sent to iframe',
      handshakePayload.payload,
      'COMMUNICATION',
    );

    if (this.routeSyncEnabled) {
      this.sendInitialRoute();
    }
  }

  public sendInitialRoute(): void {
    const hash = window.location.hash.slice(1);
    const routeMatch = hash.match(new RegExp(`^${this.hashPrefix}=(.+)`));

    if (routeMatch) {
      const route = decodeURIComponent(routeMatch[1]);
      const hashRoute = route.startsWith('#') ? route : `#${route}`;
      this.currentRoute = hashRoute;

      this.send({
        type: CHEKIN_EVENTS.INIT_ROUTE,
        payload: {route: hashRoute},
      });

      this.logger.debug(
        'Initial route sent to iframe',
        {route: hashRoute},
        'COMMUNICATION',
      );
    }
  }

  public destroy(): void {
    window.removeEventListener('message', this.handleMessage.bind(this));
    if (this.routeSyncEnabled) {
      window.removeEventListener('hashchange', this.handleParentHashChange.bind(this));
    }
    this.eventListeners.clear();
    this.logger.debug('ChekinCommunicator destroyed', undefined, 'COMMUNICATION');
  }
}
