// Wire-format types
export type {
  Environment,
  IdentityType,
  Surface,
  ConsentLevel,
  ConsentStatus,
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
  BatchResponse,
  UpdateConsentRequest,
  ConsentResponse,
} from './types';

// Configuration constants
export {
  INGEST_PATH,
  CONSENT_PATH,
  ANON_ID_COOKIE,
  SESSION_COOKIE,
  CONSENT_COOKIE,
  DEFAULT_FLUSH_INTERVAL_MS,
  DEFAULT_FLUSH_SIZE,
  getBaseUrl,
} from './config';

// Typed events and identity
export {
  AudienceEvent,
  IdentityProvider,
} from './events';

export type {
  SignUpParams,
  SignInParams,
  WishlistAddParams,
  WishlistRemoveParams,
  PurchaseParams,
  GameLaunchParams,
  ProgressionStatus,
  ProgressionParams,
  ResourceFlow,
  ResourceParams,
  SessionStartParams,
  SessionEndParams,
  EventParamMap,
  Identity,
} from './events';
