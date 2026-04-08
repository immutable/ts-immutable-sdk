export type {
  Environment,
  Surface,
  MessageType,
  EventContext,
  UserTraits,
  TrackMessage,
  PageMessage,
  ScreenMessage,
  IdentifyMessage,
  AliasMessage,
  Message,
  BatchPayload,
  ConsentLevel,
  ConsentStatus,
  ConsentUpdatePayload,
} from './types';

export {
  getOrCreateAnonymousId,
  getAnonymousId,
  getCookie,
  setCookie,
  deleteCookie,
} from './cookie';
export * as storage from './storage';

export {
  getBaseUrl,
  INGEST_PATH,
  CONSENT_PATH,
  FLUSH_INTERVAL_MS,
  FLUSH_SIZE,
  COOKIE_NAME,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from './config';

export { generateId, getTimestamp, isBrowser } from './utils';

export type { Transport, TransportOptions } from './transport';
export { httpTransport, httpSend } from './transport';
export { MessageQueue } from './queue';
export { collectContext } from './context';
export {
  isTimestampValid,
  isAliasValid,
  truncate,
  truncateSource,
} from './validation';

export { getOrCreateSession, getOrCreateSessionId, getSessionId } from './session';
export type { SessionResult } from './session';

export { collectAttribution, clearAttribution } from './attribution';
export type { Attribution } from './attribution';

export { createConsentManager, detectDoNotTrack } from './consent';
export type { ConsentManager } from './consent';
