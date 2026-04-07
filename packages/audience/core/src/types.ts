export type Environment = 'dev' | 'sandbox' | 'production';

export type Surface = 'web' | 'pixel' | 'unity' | 'unreal';

export type MessageType = 'track' | 'page' | 'screen' | 'identify' | 'alias';

export interface EventContext {
  library: string;
  libraryVersion: string;
  userAgent?: string;
  locale?: string;
  timezone?: string;
  screen?: string;
  pageUrl?: string;
  pagePath?: string;
  pageReferrer?: string;
  pageTitle?: string;
}

export interface UserTraits {
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}

interface BaseMessage {
  type: MessageType;
  messageId: string;
  eventTimestamp: string;
  anonymousId: string;
  surface: Surface;
  context: EventContext;
}

export interface TrackMessage extends BaseMessage {
  type: 'track';
  eventName: string;
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface PageMessage extends BaseMessage {
  type: 'page';
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface ScreenMessage extends BaseMessage {
  type: 'screen';
  eventName?: string;
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface IdentifyMessage extends BaseMessage {
  type: 'identify';
  userId?: string;
  identityType?: string;
  traits?: UserTraits;
}

export interface AliasMessage extends BaseMessage {
  type: 'alias';
  fromId: string;
  fromType?: string;
  toId: string;
  toType?: string;
}

export type Message =
  | TrackMessage
  | PageMessage
  | ScreenMessage
  | IdentifyMessage
  | AliasMessage;

export interface BatchPayload {
  messages: Message[];
}

/**
 * The consent level a studio sets via setConsent().
 *
 * - `'none'` — No tracking. SDK does nothing.
 * - `'anonymous'` — Track activity but not who the user is.
 * - `'full'` — Track everything including user identity.
 */
export type ConsentLevel = 'none' | 'anonymous' | 'full';

/**
 * The consent status the backend stores and returns.
 * Includes `'not_set'` for users who haven't been asked yet.
 *
 * - `'not_set'` — No consent decision recorded yet.
 * - `'none'` — User declined tracking.
 * - `'anonymous'` — User accepted anonymous tracking.
 * - `'full'` — User accepted full tracking.
 */
export type ConsentStatus = 'not_set' | 'none' | 'anonymous' | 'full';

/**
 * PUT body for `/v1/audience/tracking-consent`.
 */
export interface ConsentUpdatePayload {
  anonymousId: string;
  status: ConsentLevel;
  source: string;
}
