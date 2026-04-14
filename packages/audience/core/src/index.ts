export type {
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
} from './types';
export { IdentityType } from './types';

export {
  getOrCreateAnonymousId,
  getCookie,
  deleteCookie,
} from './cookie';

export {
  COOKIE_NAME,
  SESSION_COOKIE,
  SESSION_START,
  SESSION_END,
} from './config';

export { generateId, getTimestamp, isBrowser } from './utils';

export type { HttpSend, TransportOptions } from './transport';
export { httpSend } from './transport';
export type { TransportResult, AudienceErrorCode } from './errors';
export { TransportError, AudienceError } from './errors';
export { MessageQueue } from './queue';
export { collectContext } from './context';
export { isTimestampValid, isAliasValid, truncate } from './validation';

export { getOrCreateSession } from './session';
export type { SessionResult } from './session';

export { collectAttribution } from './attribution';
export type { Attribution } from './attribution';

export {
  createConsentManager, detectDoNotTrack,
  canTrack, canIdentify,
} from './consent';
export type { ConsentManager } from './consent';

export { detectCmp, startCmpDetection } from './cmp';
export type { CmpSource, ConsentCallback, CmpDetector } from './cmp';
