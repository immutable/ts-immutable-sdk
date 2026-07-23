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
  BUTTON_CLICKED: 'button_clicked',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
} as const;

export interface SignUpProperties {
  method?: string;
}

export interface SignInProperties {
  method?: string;
}

export interface WishlistAddProperties {
  game_id: string;
  source?: string;
  platform?: string;
}

export interface WishlistRemoveProperties {
  game_id: string;
}

export interface PurchaseProperties {
  currency: string;
  value: number;
  item_id?: string;
  item_name?: string;
  quantity?: number;
  transaction_id?: string;
}

export interface GameLaunchProperties {
  platform?: string;
  version?: string;
  build_id?: string;
}

export type ProgressionStatus = 'start' | 'complete' | 'fail';

export interface ProgressionProperties {
  status: ProgressionStatus;
  world?: string;
  level?: string;
  stage?: string;
  score?: number;
  duration_sec?: number;
}

export type ResourceFlow = 'sink' | 'source';

export interface ResourceProperties {
  flow: ResourceFlow;
  currency: string;
  amount: number;
  item_type?: string;
  item_id?: string;
}

export interface EmailAcquiredProperties {
  source?: string;
}

export interface GamePageViewedProperties {
  game_id: string;
  game_name?: string;
  slug?: string;
}

export interface LinkClickedProperties {
  url: string;
  label?: string;
  source?: string;
  game_id?: string;
}

export interface ButtonClickedProperties {
  button_text?: string;
  element_id?: string;
  element_type?: string;
}

export type AchievementType = 'onboarding' | 'progression' | 'mastery' | 'social' | 'collection';

export interface AchievementUnlockedProperties {
  achievement_id: string;
  achievement_name: string;
  achievement_type?: AchievementType;
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
  button_clicked: ButtonClickedProperties;
  achievement_unlocked: AchievementUnlockedProperties;
}

export type AudienceEventName = keyof EventPropsMap;

/**
 * Required property names per reserved event, enforced at runtime by
 * `Audience.track()`. `PropsFor`'s required/optional distinction only exists
 * at compile time; a caller can still bypass it (raw JS, an `any` cast, a
 * dynamically-built properties object), so this is checked again at the
 * call site. `Record`, not `Partial`: every event must have an entry (`[]`
 * if it has no required properties), so adding a new event to
 * `EventPropsMap` without deciding what to list here fails to compile.
 */
export const REQUIRED_EVENT_PROPS: Record<AudienceEventName, readonly string[]> = {
  sign_up: [],
  sign_in: [],
  wishlist_add: ['game_id'],
  wishlist_remove: ['game_id'],
  purchase: ['currency', 'value'],
  game_launch: [],
  progression: ['status'],
  resource: ['flow', 'currency', 'amount'],
  email_acquired: [],
  game_page_viewed: ['game_id'],
  // Not enforced: auto-capture's own link_clicked calls (autocapture.ts)
  // send link_url/link_text, not url/label, so `url` isn't actually
  // guaranteed present. Pre-existing mismatch between LinkClickedProperties
  // and auto-capture's payload shape, tracked separately.
  link_clicked: [],
  button_clicked: [],
  achievement_unlocked: ['achievement_id', 'achievement_name'],
};

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
