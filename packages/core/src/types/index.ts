import {CHEKIN_EVENTS} from '../constants';

export interface ChekinHostSDKConfig {
  apiKey: string;
  baseUrl?: string;
  version?: string;
  defaultLanguage?: string;
  styles?: string;
  stylesLink?: string;
  autoHeight?: boolean;
  enableLogging?: boolean; // Disabled by default
  routeSync?: boolean; // Route synchronization enabled by default
  onHeightChanged?: (height: number) => void;
  onError?: (error: {message: string; code?: string}) => void;
  onConnectionError?: (error: unknown) => void;
}

export interface ChekinMessage {
  type: keyof typeof CHEKIN_EVENTS | string;
  payload: unknown;
}

export interface ChekinEventType {
  [CHEKIN_EVENTS.HEIGHT_CHANGED]: number;
  [CHEKIN_EVENTS.ERROR]: {message: string; code?: string};
  [CHEKIN_EVENTS.CONNECTION_ERROR]: unknown;
}

export type ChekinEventCallback<T = unknown> = (payload: T) => void;
