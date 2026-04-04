// ---------------------------------------------------------------------------
// Identity providers
// ---------------------------------------------------------------------------

export enum IdentityProvider {
  Passport = 'passport',
  Steam = 'steam',
  Epic = 'epic',
  PlayStation = 'playstation',
  Xbox = 'xbox',
  Nintendo = 'nintendo',
  Google = 'google',
  Apple = 'apple',
  Discord = 'discord',
  Email = 'email',
  /** Use for proprietary account systems not covered by the above providers. */
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

  // In-Game
  SessionStart = 'session_start',
  SessionEnd = 'session_end',
  LevelReached = 'level_reached',
  Spend = 'spend',
  TutorialComplete = 'tutorial_complete',
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
}

// In-Game -------------------------------------------------------------------

export interface SessionStartParams {
  sessionId?: string;
}

export interface SessionEndParams {
  sessionId?: string;
  /** Duration in seconds. */
  duration?: number;
}

export interface LevelReachedParams {
  level: number;
  characterClass?: string;
}

export interface SpendParams {
  currency: string;
  value: number;
  itemId?: string;
  itemName?: string;
}

export interface TutorialCompleteParams {
  stepNumber?: number;
}

// ---------------------------------------------------------------------------
// Map event → params for type-safe `track<E>(event, params)`
// ---------------------------------------------------------------------------

export interface EventParamMap {
  [AudienceEvent.SignUp]: SignUpParams;
  [AudienceEvent.SignIn]: SignInParams;
  [AudienceEvent.WishlistAdd]: WishlistAddParams;
  [AudienceEvent.WishlistRemove]: WishlistRemoveParams;
  [AudienceEvent.Purchase]: PurchaseParams;
  [AudienceEvent.SessionStart]: SessionStartParams;
  [AudienceEvent.SessionEnd]: SessionEndParams;
  [AudienceEvent.LevelReached]: LevelReachedParams;
  [AudienceEvent.Spend]: SpendParams;
  [AudienceEvent.TutorialComplete]: TutorialCompleteParams;
}
