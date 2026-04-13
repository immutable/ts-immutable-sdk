export const AudienceEvents = {
  SIGN_UP: 'sign_up',
  SIGN_IN: 'sign_in',
  WISHLIST_ADD: 'wishlist_add',
  WISHLIST_REMOVE: 'wishlist_remove',
  PURCHASE: 'purchase',

  GAME_LAUNCH: 'game_launch',
  PROGRESSION: 'progression',
  RESOURCE: 'resource',

  EMAIL_ACQUIRED: 'email_acquired',
  GAME_PAGE_VIEWED: 'game_page_viewed',
  LINK_CLICKED: 'link_clicked',
} as const;

export interface SignUpProperties {
  /** Optional. */
  method?: string;
}

export interface SignInProperties {
  /** Optional. */
  method?: string;
}

export interface WishlistAddProperties {
  /** Required. */
  gameId: string;
  /** Optional. */
  source?: string;
  /** Optional. */
  platform?: string;
}

export interface WishlistRemoveProperties {
  /** Required. */
  gameId: string;
}

export interface PurchaseProperties {
  /** Required. */
  currency: string;
  /** Required. */
  value: number;
  /** Optional. */
  itemId?: string;
  /** Optional. */
  itemName?: string;
  /** Optional. */
  quantity?: number;
  /** Optional. */
  transactionId?: string;
}

export interface GameLaunchProperties {
  /** Optional. */
  platform?: string;
  /** Optional. */
  version?: string;
  /** Optional. */
  buildId?: string;
}

export type ProgressionStatus = 'start' | 'complete' | 'fail';

export interface ProgressionProperties {
  /** Required. */
  status: ProgressionStatus;
  /** Optional. */
  world?: string;
  /** Optional. */
  level?: string;
  /** Optional. */
  stage?: string;
  /** Optional. */
  score?: number;
  /** Optional. */
  durationSec?: number;
}

export type ResourceFlow = 'sink' | 'source';

export interface ResourceProperties {
  /** Required. */
  flow: ResourceFlow;
  /** Required. */
  currency: string;
  /** Required. */
  amount: number;
  /** Optional. */
  itemType?: string;
  /** Optional. */
  itemId?: string;
}

export interface EmailAcquiredProperties {
  /** Optional. */
  source?: string;
}

export interface GamePageViewedProperties {
  /** Required. */
  gameId: string;
  /** Optional. */
  gameName?: string;
  /** Optional. */
  slug?: string;
}

export interface LinkClickedProperties {
  /** Required. */
  url: string;
  /** Optional. */
  label?: string;
  /** Optional. */
  source?: string;
  /** Optional. */
  gameId?: string;
}

interface EventPropsMap {
  sign_up: SignUpProperties;
  sign_in: SignInProperties;
  wishlist_add: WishlistAddProperties;
  wishlist_remove: WishlistRemoveProperties;
  purchase: PurchaseProperties;
  game_launch: GameLaunchProperties;
  progression: ProgressionProperties;
  resource: ResourceProperties;
  email_acquired: EmailAcquiredProperties;
  game_page_viewed: GamePageViewedProperties;
  link_clicked: LinkClickedProperties;
}

/**
 * Event name → property type. Falls back to `Record<string, unknown>` for
 * unknown names. Used by `sdk.track()` to type-check property shapes at the
 * call site. Invariants pinned by `sdk.test-d.ts` — run it before simplifying.
 * For example, `sdk.track('purchase', { currency: 'USD' })` fails to compile
 * because `PurchaseProperties.value` is missing.
 *
 * If you change `PropsFor` (e.g. remove `Record<string, unknown>`), run
 * `pnpm typecheck` after any edit. `sdk.test-d.ts` has deliberately-wrong
 * `sdk.track()` calls that should fail to compile. If your edit makes any
 * of them start compiling, the build breaks.
 */
export type PropsFor<E extends string> =
  E extends keyof EventPropsMap ? EventPropsMap[E] : Record<string, unknown>;
