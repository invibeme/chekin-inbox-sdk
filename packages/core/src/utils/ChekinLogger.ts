import {LOG_LEVELS, type LogLevel} from '../constants';
import {ChekinInboxSDKConfig} from '../types';

export type {LogLevel};

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: unknown;
  context?: string;
}

export interface ChekinLoggerConfig {
  level?: LogLevel;
  prefix?: string;
  enabled?: boolean;
  onLog?: (entry: LogEntry) => void;
  buffer?: boolean;
  bufferSize?: number;
}

export class ChekinLogger {
  private config: ChekinLoggerConfig;
  private logBuffer: LogEntry[] = [];

  constructor(config: ChekinLoggerConfig = {}) {
    this.config = {
      level: LOG_LEVELS.INFO,
      prefix: '[Inbox SDK]',
      enabled: true,
      buffer: true,
      bufferSize: 100,
      ...config,
    };
  }

  private shouldLog(): boolean {
    return !!this.config.enabled;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: unknown,
    context?: string,
  ): LogEntry {
    return {
      timestamp: Date.now(),
      level,
      message,
      data,
      context,
    };
  }

  private addToBuffer(entry: LogEntry): void {
    if (!this.config.buffer) return;

    this.logBuffer.push(entry);
    if (this.logBuffer.length > (this.config.bufferSize || 100)) {
      this.logBuffer.shift();
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    return `${
      this.config.prefix
    } ${timestamp} ${entry.level.toUpperCase()} ${context} ${entry.message}`;
  }

  private logToConsole(entry: LogEntry): void {
    const message = this.formatMessage(entry);

    switch (entry.level) {
      case LOG_LEVELS.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LOG_LEVELS.INFO:
        console.info(message, entry.data || '');
        break;
      case LOG_LEVELS.WARN:
        console.warn(message, entry.data || '');
        break;
      case LOG_LEVELS.ERROR:
        console.error(message, entry.data || '');
        break;
    }
  }

  debug(message: string, data?: unknown, context?: string): void {
    this.log(LOG_LEVELS.DEBUG, message, data, context);
  }

  info(message: string, data?: unknown, context?: string): void {
    this.log(LOG_LEVELS.INFO, message, data, context);
  }

  warn(message: string, data?: unknown, context?: string): void {
    this.log(LOG_LEVELS.WARN, message, data, context);
  }

  error(message: string, data?: unknown, context?: string): void {
    this.log(LOG_LEVELS.ERROR, message, data, context);
  }

  log(level: LogLevel, message: string, data?: unknown, context?: string): void {
    if (!this.shouldLog()) return;

    const entry = this.createLogEntry(level, message, data, context);
    this.addToBuffer(entry);
    this.logToConsole(entry);

    this.config.onLog?.(entry);
  }

  // SDK Lifecycle logging methods
  logMount(containerId: string, config?: ChekinInboxSDKConfig): void {
    this.info(`SDK mounted to container: ${containerId}`, {config}, 'LIFECYCLE');
  }

  logUnmount(reason?: string): void {
    this.info(`SDK unmounted${reason ? `: ${reason}` : ''}`, undefined, 'LIFECYCLE');
  }

  logIframeLoad(src: string): void {
    this.info(`Iframe loaded successfully`, {src}, 'IFRAME');
  }

  logIframeError(error: unknown, src?: string): void {
    this.error(`Iframe failed to load`, {error, src}, 'IFRAME');
  }

  logCommunicationEvent(eventType: string, payload?: unknown): void {
    this.debug(`Communication event: ${eventType}`, payload, 'COMMUNICATION');
  }

  logConfigUpdate(newConfig: Partial<ChekinInboxSDKConfig>): void {
    this.info(`Configuration updated`, newConfig, 'CONFIG');
  }

  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  clearLogBuffer(): void {
    this.logBuffer = [];
  }

  // Send logs to external service (e.g., on unmount)
  async sendLogs(endpoint?: string): Promise<void> {
    if (!endpoint || this.logBuffer.length === 0) return;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: this.logBuffer,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      });
      this.clearLogBuffer();
    } catch (error) {
      console.error('Failed to send logs:', error);
    }
  }

  // Update logger configuration
  updateConfig(newConfig: Partial<ChekinLoggerConfig>): void {
    this.config = {...this.config, ...newConfig};
    this.info('Logger configuration updated', newConfig, 'LOGGER');
  }
}
