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
  method?: string;
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

export interface PurchaseProperties {
  currency: string;
  value: number;
  itemId?: string;
  itemName?: string;
  quantity?: number;
  transactionId?: string;
}

export interface GameLaunchProperties {
  platform?: string;
  version?: string;
  buildId?: string;
}

export type ProgressionStatus = 'start' | 'complete' | 'fail';

export interface ProgressionProperties {
  status: ProgressionStatus;
  world?: string;
  level?: string;
  stage?: string;
  score?: number;
  durationSec?: number;
}

export type ResourceFlow = 'sink' | 'source';

export interface ResourceProperties {
  flow: ResourceFlow;
  currency: string;
  amount: number;
  itemType?: string;
  itemId?: string;
}

export interface EmailAcquiredProperties {
  source?: string;
}

export interface GamePageViewedProperties {
  gameId: string;
  gameName?: string;
  slug?: string;
}

export interface LinkClickedProperties {
  url: string;
  label?: string;
  source?: string;
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

export type PropsFor<E extends string> =
  E extends keyof EventPropsMap ? EventPropsMap[E] : Record<string, unknown>;
