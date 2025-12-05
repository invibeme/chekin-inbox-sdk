// Main SDK export
export {ChekinInboxSDK} from './ChekinInboxSDK';

// Communication utilities
export {ChekinCommunicator} from './communication/ChekinCommunicator.js';

// Utility functions
export {formatChekinUrl} from './utils/formatChekinUrl.js';
export {ChekinLogger} from './utils/ChekinLogger.js';
export {ChekinSDKValidator} from './utils/validation.js';

// Constants
export {
  CHEKIN_ROOT_IFRAME_ID,
  CHEKIN_EVENTS,
  LOG_LEVELS,
  CHEKIN_IFRAME_TITLE,
  CHEKIN_IFRAME_NAME,
} from './constants/index.js';

// Type definitions
export type {
  ChekinInboxSDKConfig,
  ChekinMessage,
  ChekinEventType,
  ChekinEventCallback,
} from './types/index.js';

export type {LogEntry, ChekinLoggerConfig, LogLevel} from './utils/ChekinLogger.js';

export type {UrlConfigResult} from './utils/formatChekinUrl.js';

export type {ValidationError, ValidationResult} from './utils/validation.js';
