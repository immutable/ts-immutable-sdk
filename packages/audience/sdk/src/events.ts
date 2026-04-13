import { SESSION_START, SESSION_END } from '@imtbl/audience-core';

/**
 * Standard event names for the Immutable Audience SDK.
 *
 * Session events (`SESSION_START`, `SESSION_END`) are fired automatically
 * by the SDK — do not fire them manually. The remaining events are the
 * recommended vocabulary for studio-fired tracking. Using these constants
 * instead of raw strings gives you autocomplete, typo protection, and a
 * consistent schema across all Immutable-powered apps.
 */
export const AudienceEvents = {
  // --- SDK-managed (fired automatically) ---

  /** Fired automatically on init and reset. Do not call `track()` with this. */
  SESSION_START,
  /** Fired automatically on shutdown. Do not call `track()` with this. */
  SESSION_END,

  // --- Recommended studio events ---

  /** A player connects an external account (Steam, Epic, Discord, Telegram) or opts into marketing emails. */
  EMAIL_ACQUIRED: 'email_acquired',
  /** A player opens a game or content page (dedupe per page per session). */
  GAME_PAGE_VIEWED: 'game_page_viewed',
  /** A player clicks an outbound link (Play Now, store, social). */
  LINK_CLICKED: 'link_clicked',
  /** A player logs in via Passport or another provider. */
  SIGN_IN: 'sign_in',
  /** A player follows / wishlists a game. */
  WISHLIST_ADD: 'wishlist_add',
  /** A player unfollows / un-wishlists a game. */
  WISHLIST_REMOVE: 'wishlist_remove',
} as const;

// --- Property interfaces for each event ---

export interface EmailAcquiredProperties {
  isLoggedIn: boolean;
  source: string;
}

export interface GamePageViewedProperties {
  gameId: string;
  gameName: string;
  slug: string;
  isLoggedIn: boolean;
}

export interface LinkClickedProperties {
  url: string;
  label: string;
  source: string;
  isLoggedIn: boolean;
  gameId?: string;
}

export interface SignInProperties {
  method?: string;
}

export interface WishlistAddProperties {
  gameId: string;
  source?: string;
  platform?: string;
}

export interface WishlistRemoveProperties {
  gameId: string;
}
