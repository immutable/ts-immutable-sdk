import { Audience, AudienceEvents } from './index';
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  EmailAcquiredProperties,
  GameLaunchProperties,
  GamePageViewedProperties,
  LinkClickedProperties,
  ProgressionProperties,
  ProgressionStatus,
  PurchaseProperties,
  ResourceFlow,
  ResourceProperties,
  SignInProperties,
  SignUpProperties,
  WishlistAddProperties,
  WishlistRemoveProperties,
} from './events';
/* eslint-enable @typescript-eslint/no-unused-vars */

declare const sdk: Audience;

// ---- Happy path ----

sdk.track('sign_up');
sdk.track('sign_up', { method: 'email' });
sdk.track('sign_in');
sdk.track('sign_in', { method: 'passport' });
sdk.track('wishlist_add', { gameId: 'abc' });
sdk.track('wishlist_add', { gameId: 'abc', source: 'game_page', platform: 'steam' });
sdk.track('wishlist_remove', { gameId: 'abc' });
sdk.track('purchase', { currency: 'USD', value: 9.99 });
sdk.track('purchase', {
  currency: 'USD',
  value: 9.99,
  itemId: 'sku_1',
  itemName: 'Gold Pack',
  quantity: 2,
  transactionId: 'txn_42',
});
sdk.track('game_launch');
sdk.track('game_launch', { platform: 'webgl', version: '1.2.0', buildId: 'ci-42' });
sdk.track('progression', { status: 'start' });
sdk.track('progression', { status: 'complete', world: 'tutorial' });
sdk.track('progression', {
  status: 'fail',
  world: 'forest',
  level: '5',
  stage: 'boss',
  score: 420,
  durationSec: 87,
});
sdk.track('resource', { flow: 'sink', currency: 'gold', amount: 50 });
sdk.track('resource', {
  flow: 'source',
  currency: 'USD',
  amount: 9.99,
  itemType: 'iap',
  itemId: 'sku_1',
});
sdk.track('email_acquired');
sdk.track('email_acquired', { source: 'linked_account_steam' });
sdk.track('game_page_viewed', { gameId: 'abc' });
sdk.track('game_page_viewed', { gameId: 'abc', gameName: 'Devilfish', slug: 'devilfish' });
sdk.track('link_clicked', { url: 'https://example.com' });
sdk.track('link_clicked', {
  url: 'https://example.com',
  label: 'Play Now',
  source: 'game_page',
  gameId: 'abc',
});

// ---- AudienceEvents constants ----

sdk.track(AudienceEvents.SIGN_UP, { method: 'email' });
sdk.track(AudienceEvents.PURCHASE, { currency: 'USD', value: 9.99 });
sdk.track(AudienceEvents.PROGRESSION, { status: 'complete' });

// ---- Missing required property ----

// @ts-expect-error — 'value' is required on PurchaseProperties
sdk.track('purchase', { currency: 'USD' });

// @ts-expect-error — 'gameId' is required on WishlistAddProperties
sdk.track('wishlist_add', {});

// @ts-expect-error — 'status' is required on ProgressionProperties
sdk.track('progression', { world: 'tutorial' });

// @ts-expect-error — 'flow', 'currency', 'amount' all required
sdk.track('resource', { itemType: 'iap' });

// @ts-expect-error — 'url' is required on LinkClickedProperties
sdk.track('link_clicked', { label: 'Play Now' });

// @ts-expect-error — 'gameId' is required on GamePageViewedProperties
sdk.track('game_page_viewed', {});

// ---- Zero-argument form on events with required properties ----

// @ts-expect-error — 'purchase' requires properties (currency + value)
sdk.track('purchase');

// @ts-expect-error — 'wishlist_add' requires properties (gameId)
sdk.track('wishlist_add');

// @ts-expect-error — 'wishlist_remove' requires properties (gameId)
sdk.track('wishlist_remove');

// @ts-expect-error — 'progression' requires properties (status)
sdk.track('progression');

// @ts-expect-error — 'resource' requires properties (flow, currency, amount)
sdk.track('resource');

// @ts-expect-error — 'game_page_viewed' requires properties (gameId)
sdk.track('game_page_viewed');

// @ts-expect-error — 'link_clicked' requires properties (url)
sdk.track('link_clicked');

// ---- Unknown property ----

// @ts-expect-error — 'currenyc' is not a property of PurchaseProperties
sdk.track('purchase', { currenyc: 'USD', value: 9.99 });

// @ts-expect-error — 'extra' is not a property of PurchaseProperties (all required fields present)
sdk.track('purchase', { currency: 'USD', value: 9.99, extra: 1 });

// @ts-expect-error — 'isLoggedIn' is not a property of LinkClickedProperties
sdk.track('link_clicked', { url: 'x', isLoggedIn: true });

// ---- Wrong value type ----

// @ts-expect-error — 'value' must be number
sdk.track('purchase', { currency: 'USD', value: '9.99' });

// @ts-expect-error — 'status' must be 'start' | 'complete' | 'fail'
sdk.track('progression', { status: 'done' });

// @ts-expect-error — 'flow' must be 'sink' | 'source'
sdk.track('resource', { flow: 'both', currency: 'gold', amount: 1 });

// ---- Custom events and dynamic names ----

sdk.track('beta_key_redeemed', { source: 'influencer' });
sdk.track('discord_joined');
sdk.track('trailer_watched', { duration: 45, platform: 'youtube' });

declare const dynamicName: string;
sdk.track(dynamicName, { anything: 'goes' });
sdk.track(dynamicName);
