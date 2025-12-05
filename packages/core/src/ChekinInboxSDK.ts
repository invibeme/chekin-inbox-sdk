import {ChekinInboxSDKConfig, ChekinEventCallback} from './types';
import {ChekinCommunicator} from './communication/ChekinCommunicator.js';
import {formatChekinUrl} from './utils/formatChekinUrl.js';
import {ChekinLogger, type ChekinLoggerConfig} from './utils/ChekinLogger.js';
import {ChekinSDKValidator, type ValidationResult} from './utils/validation.js';
import {
  CHEKIN_ROOT_IFRAME_ID,
  CHEKIN_EVENTS,
  CHEKIN_IFRAME_TITLE,
  CHEKIN_IFRAME_NAME,
} from './constants';

export class ChekinInboxSDK {
  private iframe: HTMLIFrameElement | null = null;
  private communicator: ChekinCommunicator | null = null;
  private config: ChekinInboxSDKConfig;
  private observer: MutationObserver | null = null;
  private readonly logger: ChekinLogger;
  private pendingPostMessageConfig?: Partial<ChekinInboxSDKConfig>;
  private readonly validator: ChekinSDKValidator;

  constructor(
    config: ChekinInboxSDKConfig & {
      logger?: ChekinLoggerConfig;
    } = {} as ChekinInboxSDKConfig,
  ) {
    this.config = config;

    const loggerConfig: ChekinLoggerConfig = {
      enabled: !!config.enableLogging,
      ...config.logger,
    };

    this.logger = new ChekinLogger(loggerConfig);
    this.validator = new ChekinSDKValidator();

    const validationResult = this.validateConfig();
    this.logger.info('ChekinSDK instance created', {
      apiKey: config.apiKey ? '[REDACTED]' : 'missing',
      loggingEnabled: !!config.enableLogging,
      validationErrors: validationResult.errors.length,
      validationWarnings: validationResult.warnings.length,
    });
  }

  private validateConfig(): ValidationResult {
    const validationResult = this.validator.validateConfig(this.config);

    if (validationResult.errors.length > 0) {
      validationResult.errors.forEach(error => {
        this.logger.error(`Validation error in ${error.field}: ${error.message}`, {
          value: error.value,
        });
      });

      throw new Error(
        `SDK configuration validation failed: ${validationResult.errors
          .map(e => e.message)
          .join(', ')}`,
      );
    }

    if (validationResult.warnings.length > 0) {
      validationResult.warnings.forEach(warning => {
        this.logger.warn(`Validation warning in ${warning.field}: ${warning.message}`, {
          value: warning.value,
        });
      });
    }

    if (validationResult.isValid) {
      this.logger.debug('SDK configuration validated successfully');
    }

    return validationResult;
  }

  // Initialize SDK (similar to your original initialize method)
  public initialize(config: ChekinInboxSDKConfig): void {
    this.logger.info('Initializing SDK with new configuration');
    this.config = {...this.config, ...config};
    this.validateConfig();
    this.logger.logConfigUpdate(config);
  }

  public initAndRender(
    config: ChekinInboxSDKConfig & {targetNode: string},
  ): Promise<HTMLIFrameElement> {
    const {targetNode, ...sdkConfig} = config;
    this.initialize(sdkConfig);
    return this.render(targetNode);
  }

  // Framework-agnostic render method (similar to your renderApp)
  public render(container: string | HTMLElement): Promise<HTMLIFrameElement> {
    const containerId =
      typeof container === 'string' ? container : container.id || 'unknown';
    this.logger.info(`Starting render process for container: ${containerId}`);

    const targetElement =
      typeof container === 'string' ? document.getElementById(container) : container;

    if (!targetElement) {
      const error = new Error(`Container element not found: ${container}`);
      this.logger.error('Container element not found', {container});
      throw error;
    }

    if (!this.config.apiKey) {
      const error = new Error('SDK must be initialized with apiKey before rendering');
      this.logger.error('Render failed: SDK not initialized with apiKey');
      throw error;
    }

    return this.createIframe(targetElement);
  }

  private createIframe(container: HTMLElement): Promise<HTMLIFrameElement> {
    return new Promise((resolve, reject) => {
      if (this.iframe) {
        container.appendChild(this.iframe);
        resolve(this.iframe);
        return;
      }

      this.iframe = document.createElement('iframe');

      // Use new URL formatting to handle length limits
      const urlResult = formatChekinUrl(this.config);
      this.iframe.src = urlResult.url;
      this.pendingPostMessageConfig = urlResult.postMessageConfig;

      if (urlResult.isLengthLimited) {
        this.logger.warn(
          'URL length exceeded safe limits, some config will be sent via postMessage',
          {
            urlLength: urlResult.url.length,
            hasPostMessageConfig: !!urlResult.postMessageConfig,
          },
        );
      }

      this.iframe.style.cssText = `
        width: 100%; 
        height: 100%;
        min-height: 600px;
        border: none; 
        transition: height 0.35s, opacity 0.4s 0.1s;
        overflow: ${this.config.autoHeight ? 'hidden' : 'initial'};
      `;
      this.iframe.title = CHEKIN_IFRAME_TITLE;
      this.iframe.name = CHEKIN_IFRAME_NAME;
      this.iframe.role = 'application';
      this.iframe.id = CHEKIN_ROOT_IFRAME_ID;

      this.iframe.setAttribute(
        'sandbox',
        'allow-forms allow-popups allow-scripts allow-same-origin',
      );

      this.iframe.onload = () => {
        if (this.iframe) {
          this.logger.logIframeLoad(this.iframe.src);
          this.communicator = new ChekinCommunicator(
            this.iframe,
            this.config,
            this.logger,
          );
          this.setupEventListeners();

          // Send handshake as soon as the iframe loads
          this.communicator.sendHandshake();

          if (this.pendingPostMessageConfig) {
            this.sendPostMessageConfig();
          }

          this.logger.logMount(container.id || 'unknown', this.config);
          resolve(this.iframe);
        }
      };

      this.iframe.onerror = error => {
        this.logger.logIframeError(error, this.iframe?.src);
        reject(error);
      };
      container.appendChild(this.iframe);
      this.observeContainerRemoval(container);
    });
  }

  private observeContainerRemoval(container: HTMLElement): void {
    this.observer?.disconnect();
    this.observer = new MutationObserver(() => {
      if (!document.body.contains(container)) {
        this.destroy();
      }
    });

    this.observer.observe(container.ownerDocument || document, {
      childList: true,
      subtree: true,
    });
  }

  private sendPostMessageConfig(): void {
    if (!this.communicator || !this.pendingPostMessageConfig) return;

    this.logger.debug(
      'Sending additional config via postMessage',
      this.pendingPostMessageConfig,
    );

    this.communicator.send({
      type: CHEKIN_EVENTS.CONFIG_UPDATE,
      payload: this.pendingPostMessageConfig,
    });

    this.pendingPostMessageConfig = undefined;
  }

  private updateIframeHeight(height: number): void {
    if (!this.iframe) return;

    this.iframe.style.height = `${height}px`;
    this.logger.debug(`Iframe height updated to ${height}px`);
  }

  private setupEventListeners(): void {
    if (!this.communicator) return;

    // Set up dynamic height handling
    this.communicator.on(CHEKIN_EVENTS.HEIGHT_CHANGED, (height: number) => {
      this.updateIframeHeight(height);

      // Also call user's callback if provided
      if (this.config.onHeightChanged) {
        this.config.onHeightChanged(height);
      }
    });

    // Set up other event callbacks from config
    if (this.config.onError) {
      this.communicator.on(CHEKIN_EVENTS.ERROR, this.config.onError);
    }
    if (this.config.onConnectionError) {
      this.communicator.on(CHEKIN_EVENTS.CONNECTION_ERROR, this.config.onConnectionError);
    }
  }

  public destroy(): void {
    this.logger.info('Destroying SDK instance');
    if (this.iframe?.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }
    this.communicator?.destroy();
    this.observer?.disconnect();
    this.iframe = null;
    this.communicator = null;
    this.observer = null;
    this.logger.logUnmount('SDK destroyed');
  }

  // Event handling
  public on(event: string, callback: ChekinEventCallback): void {
    this.communicator?.on(event, callback);
  }

  public off(event: string, callback: ChekinEventCallback): void {
    this.communicator?.off(event, callback);
  }

  // Update configuration
  public updateConfig(newConfig: Partial<ChekinInboxSDKConfig>): void {
    this.logger.info('Updating SDK configuration', newConfig);
    this.config = {...this.config, ...newConfig};
    this.communicator?.send({
      type: CHEKIN_EVENTS.CONFIG_UPDATE,
      payload: this.config,
    });
    this.logger.logConfigUpdate(newConfig);
  }

  public navigate(path: string): void {
    this.logger.info(`Navigating to path: ${path}`);
    this.communicator?.navigateToRoute(path);
  }

  public enableRouteSync(options: {hashPrefix?: string} = {}): void {
    this.logger.info('Enabling route synchronization', options);
    this.communicator?.enableRouteSync(options);
  }

  public disableRouteSync(): void {
    this.logger.info('Disabling route synchronization');
    this.communicator?.disableRouteSync();
  }

  public getCurrentRoute(): string {
    return this.communicator?.getCurrentRoute() || '/';
  }

  public getLogger(): ChekinLogger {
    return this.logger;
  }

  public async sendLogs(endpoint?: string): Promise<void> {
    await this.logger.sendLogs(endpoint);
  }

  public static validateConfig(config: ChekinInboxSDKConfig): ValidationResult {
    const validator = new ChekinSDKValidator();
    return validator.validateConfig(config);
  }

  public getValidationResult(): ValidationResult {
    return this.validator.validateConfig(this.config);
  }
}
