export const CHEKIN_ROOT_IFRAME_ID = 'chekin-inbox-sdk-iframe';
export const CHEKIN_IFRAME_TITLE = 'Chekin Host SDK';
export const CHEKIN_IFRAME_NAME = 'chekin-inbox-sdk-frame';

export const CHEKIN_EVENTS = {
  HANDSHAKE: 'chekin:handshake',
  HEIGHT_CHANGED: 'chekin:height-changed',
  ERROR: 'chekin:error',
  CONNECTION_ERROR: 'chekin:connection-error',
  CONFIG_UPDATE: 'chekin:config-update',
  ROUTE_CHANGED: 'chekin:route-changed',
  INIT_ROUTE: 'chekin:init-route',
  READY: 'chekin:ready',
} as const;

export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
