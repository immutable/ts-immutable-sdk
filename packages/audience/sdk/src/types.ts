// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export type Environment = 'dev' | 'sandbox' | 'production';

export interface AudienceConfig {
  /** Publishable API key from Immutable Hub. */
  publishableKey: string;
  /** Target Immutable environment. */
  environment: Environment;
  /** Surface discriminator sent on every message (e.g. 'web', 'pixel', 'unity'). */
  surface?: Surface;
}

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

/**
 * Identity types matching the backend IdentityType enum.
 * Source of truth: platform-services/services/audience/src/openapi/oas.yml
 */
export type IdentityType =
  | 'passport'
  | 'steam'
  | 'epic'
  | 'google'
  | 'apple'
  | 'discord'
  | 'email'
  | 'custom';

export type Surface = 'web' | 'pixel' | 'unity' | 'unreal';

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
// Messages – wire format matching backend OpenAPI spec
//
// Divergences fixed from original implementation:
//   timestamp      → eventTimestamp
//   event          → eventName
//   previousId     → fromId
//   previousProvider → fromType
//   userId/provider on alias → toId/toType
//   provider on identify → identityType
//   Added: surface, PageMessage
// ---------------------------------------------------------------------------

interface BaseMessage {
  eventTimestamp: string;
  messageId: string;
  context: MessageContext;
  anonymousId: string;
  surface?: Surface;
}

export interface TrackMessage extends BaseMessage {
  type: 'track';
  eventName: string;
  properties: Record<string, unknown>;
  userId?: string;
}

export interface PageMessage extends BaseMessage {
  type: 'page';
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface IdentifyMessage extends BaseMessage {
  type: 'identify';
  userId: string;
  identityType: IdentityType;
  traits?: UserTraits;
}

export interface AliasMessage extends BaseMessage {
  type: 'alias';
  fromId: string;
  fromType: IdentityType;
  toId: string;
  toType: IdentityType;
}

export type Message = TrackMessage | PageMessage | IdentifyMessage | AliasMessage;

// ---------------------------------------------------------------------------
// Transport payload
// ---------------------------------------------------------------------------

export interface BatchPayload {
  messages: Message[];
}
