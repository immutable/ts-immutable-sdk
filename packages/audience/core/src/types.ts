/**
 * Wire-format types matching the backend OpenAPI spec.
 * Source of truth: platform-services/services/audience/src/openapi/oas.yml
 *
 * This is the shared contract between all Audience surfaces (web SDK, pixel,
 * Unity, Unreal) and the backend. Each surface imports these types and
 * implements its own runtime (transport, queue, storage, etc.).
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

export type MessageType = 'track' | 'page' | 'screen' | 'identify' | 'alias';

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

// --- Traits ---

export interface UserTraits {
  email?: string;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}

// --- Messages (discriminated union matching backend flat Message schema) ---

interface BaseMessage {
  type: MessageType;
  messageId: string;
  eventTimestamp: string;
  anonymousId?: string;
  surface?: Surface;
  context: EventContext;
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

export interface ScreenMessage extends BaseMessage {
  type: 'screen';
  eventName?: string;
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

export type Message =
  | TrackMessage
  | PageMessage
  | ScreenMessage
  | IdentifyMessage
  | AliasMessage;

// --- Request / Response ---

export interface BatchPayload {
  messages: Message[];
}

export interface BatchResponse {
  success: boolean;
  accepted: number;
  rejected: number;
}

export interface UpdateConsentRequest {
  anonymousId: string;
  status: ConsentLevel;
  source: string;
}

export interface ConsentResponse {
  status: ConsentStatus;
}
