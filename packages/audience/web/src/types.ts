/**
 * Wire-format types matching the backend OpenAPI spec exactly.
 * Source of truth: platform-services/services/audience/src/openapi/oas.yml
 *
 * Divergences from the implementation plan (backend wins):
 * - Endpoint: /v1/audience/messages (plan said /events)
 * - Alias fields: fromId/fromType/toId/toType (plan said previousId/previousProvider/userId/provider)
 * - Identity field: identityType (plan said provider)
 * - Timestamp field: eventTimestamp (plan said timestamp)
 * - Event name field: eventName (plan said event)
 * - Consent: server-side sync via PUT/GET with required `source` field
 */

// --- Enums matching backend schemas ---

export type Environment = 'local' | 'dev' | 'sandbox' | 'production';

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

export type ConsentLevel = 'none' | 'anonymous' | 'full';

export type ConsentStatus = 'not_set' | 'none' | 'anonymous' | 'full';

// --- EventContext ---

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

// --- Messages (discriminated union matching backend flat Message schema) ---

export type MessageType = 'track' | 'page' | 'screen' | 'identify' | 'alias';

interface BaseMessage {
  type: MessageType;
  messageId: string;
  eventTimestamp: string;
  anonymousId?: string;
  context: EventContext;
  surface?: Surface;
}

export interface TrackMessage extends BaseMessage {
  type: 'track';
  eventName?: string;
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface PageMessage extends BaseMessage {
  type: 'page';
  properties?: Record<string, unknown>;
  userId?: string;
}

export interface IdentifyMessage extends BaseMessage {
  type: 'identify';
  userId?: string;
  identityType?: IdentityType;
  traits?: Record<string, unknown>;
}

export interface AliasMessage extends BaseMessage {
  type: 'alias';
  fromId?: string;
  fromType?: IdentityType;
  toId?: string;
  toType?: IdentityType;
}

export type Message = TrackMessage | PageMessage | IdentifyMessage | AliasMessage;

// --- Request/Response ---

export interface MessagesRequest {
  messages: Message[];
}

export interface MessagesResponse {
  success: boolean;
  accepted: number;
  rejected: number;
}

export interface UpdateTrackingConsentRequest {
  anonymousId: string;
  status: ConsentLevel;
  source: string;
}

export interface TrackingConsentResponse {
  status: ConsentStatus;
}

// --- SDK Configuration ---

export interface UserTraits {
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface WebSDKConfig {
  publishableKey: string;
  environment: Environment;
  consent?: ConsentLevel;
  consentSource?: string;
  trackPageViews?: boolean;
  debug?: boolean;
  cookieDomain?: string;
  flushInterval?: number;
  flushSize?: number;
}
