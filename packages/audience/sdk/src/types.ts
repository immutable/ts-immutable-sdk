// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export type Environment = 'dev' | 'sandbox' | 'production';

export interface AudienceConfig {
  /** Publishable API key from Immutable Hub. */
  publishableKey: string;
  /** Target Immutable environment. */
  environment: Environment;
}

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

export interface UserTraits {
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}

// ---------------------------------------------------------------------------
// Context – automatically collected per-message
// ---------------------------------------------------------------------------

export interface MessageContext {
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

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

interface BaseMessage {
  timestamp: string;
  messageId: string;
  context: MessageContext;
  anonymousId: string;
}

export interface TrackMessage extends BaseMessage {
  type: 'track';
  event: string;
  properties: Record<string, unknown>;
  /** Formatted as `provider:uid` when identified. */
  userId?: string;
}

export interface IdentifyMessage extends BaseMessage {
  type: 'identify';
  /** Formatted as `provider:uid`. */
  userId: string;
  provider: string;
  traits?: UserTraits;
}

export interface AliasMessage extends BaseMessage {
  type: 'alias';
  /** Formatted as `provider:uid`. */
  previousId: string;
  previousProvider: string;
  /** Formatted as `provider:uid`. */
  userId: string;
  provider: string;
}

export type Message = TrackMessage | IdentifyMessage | AliasMessage;

// ---------------------------------------------------------------------------
// Transport payload
// ---------------------------------------------------------------------------

export interface BatchPayload {
  messages: Message[];
}
