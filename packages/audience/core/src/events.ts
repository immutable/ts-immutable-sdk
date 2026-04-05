/**
 * Typed events and identity providers shared across all Audience surfaces.
 *
 * Updated to match the Web SDK Event Reference (v1) and Tracking Pixel
 * Event Reference (v1), April 2026.
 */

// ---------------------------------------------------------------------------
// Identity providers — matches backend IdentityType enum exactly
// ---------------------------------------------------------------------------

export enum IdentityProvider {
  Passport = 'passport',
  Steam = 'steam',
  Epic = 'epic',
  Google = 'google',
  Apple = 'apple',
  Discord = 'discord',
  Email = 'email',
  Custom = 'custom',
}

export interface Identity {
  provider: IdentityProvider;
  uid: string;
}

// ---------------------------------------------------------------------------
// Predefined events
//
// Every event has a typed parameter interface so callers get compile-time
// checks on the properties they pass to `track()`.
// ---------------------------------------------------------------------------

export enum AudienceEvent {
  // Web / Distribution
  SignUp = 'sign_up',
  SignIn = 'sign_in',
  WishlistAdd = 'wishlist_add',
  WishlistRemove = 'wishlist_remove',
  Purchase = 'purchase',

  // Gameplay (shared schema across web, Unity, Unreal)
  GameLaunch = 'game_launch',
  Progression = 'progression',
  Resource = 'resource',

  // Session lifecycle (auto-tracked by surfaces)
  SessionStart = 'session_start',
  SessionEnd = 'session_end',
}

// ---------------------------------------------------------------------------
// Per-event parameter types
// ---------------------------------------------------------------------------

// Web / Distribution --------------------------------------------------------

export interface SignUpParams {
  method?: string;
}

export interface SignInParams {
  method?: string;
}

export interface WishlistAddParams {
  gameId: string;
  source?: string;
  platform?: string;
}

export interface WishlistRemoveParams {
  gameId: string;
}

export interface PurchaseParams {
  currency: string;
  value: number;
  itemId?: string;
  itemName?: string;
  quantity?: number;
  transactionId?: string;
}

// Gameplay ------------------------------------------------------------------

export interface GameLaunchParams {
  platform?: string;
  version?: string;
  buildId?: string;
}

export type ProgressionStatus = 'start' | 'complete' | 'fail';

export interface ProgressionParams {
  status: ProgressionStatus;
  world?: string;
  level?: string | number;
  stage?: string | number;
  score?: number;
  durationSec?: number;
}

export type ResourceFlow = 'sink' | 'source';

export interface ResourceParams {
  flow: ResourceFlow;
  currency: string;
  amount: number;
  itemType?: string;
  itemId?: string;
}

// Session lifecycle ---------------------------------------------------------

export interface SessionStartParams {
  sessionId: string;
}

export interface SessionEndParams {
  sessionId: string;
  duration: number;
}

// ---------------------------------------------------------------------------
// Map event -> params for type-safe `track<E>(event, params)`
// ---------------------------------------------------------------------------

export interface EventParamMap {
  [AudienceEvent.SignUp]: SignUpParams;
  [AudienceEvent.SignIn]: SignInParams;
  [AudienceEvent.WishlistAdd]: WishlistAddParams;
  [AudienceEvent.WishlistRemove]: WishlistRemoveParams;
  [AudienceEvent.Purchase]: PurchaseParams;
  [AudienceEvent.GameLaunch]: GameLaunchParams;
  [AudienceEvent.Progression]: ProgressionParams;
  [AudienceEvent.Resource]: ResourceParams;
  [AudienceEvent.SessionStart]: SessionStartParams;
  [AudienceEvent.SessionEnd]: SessionEndParams;
}
