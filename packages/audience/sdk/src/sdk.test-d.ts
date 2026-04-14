import { Audience, AudienceEvents } from './index';

declare const sdk: Audience;

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

sdk.track(AudienceEvents.SIGN_UP, { method: 'email' });
sdk.track(AudienceEvents.PURCHASE, { currency: 'USD', value: 9.99 });
sdk.track(AudienceEvents.PROGRESSION, { status: 'complete' });

// @ts-expect-error — missing required 'value'
sdk.track('purchase', { currency: 'USD' });

// @ts-expect-error — missing required 'gameId'
sdk.track('wishlist_add', {});

// @ts-expect-error — missing required 'status'
sdk.track('progression', { world: 'tutorial' });

// @ts-expect-error — missing required 'flow', 'currency', 'amount'
sdk.track('resource', { itemType: 'iap' });

// @ts-expect-error — missing required 'url'
sdk.track('link_clicked', { label: 'Play Now' });

// @ts-expect-error — missing required 'gameId'
sdk.track('game_page_viewed', {});

// @ts-expect-error — purchase requires properties
sdk.track('purchase');

// @ts-expect-error — wishlist_add requires properties
sdk.track('wishlist_add');

// @ts-expect-error — wishlist_remove requires properties
sdk.track('wishlist_remove');

// @ts-expect-error — progression requires properties
sdk.track('progression');

// @ts-expect-error — resource requires properties
sdk.track('resource');

// @ts-expect-error — game_page_viewed requires properties
sdk.track('game_page_viewed');

// @ts-expect-error — link_clicked requires properties
sdk.track('link_clicked');

// @ts-expect-error — unknown property 'currenyc'
sdk.track('purchase', { currenyc: 'USD', value: 9.99 });

// @ts-expect-error — unknown property 'extra'
sdk.track('purchase', { currency: 'USD', value: 9.99, extra: 1 });

// @ts-expect-error — unknown property 'isLoggedIn'
sdk.track('link_clicked', { url: 'x', isLoggedIn: true });

// @ts-expect-error — 'value' must be number
sdk.track('purchase', { currency: 'USD', value: '9.99' });

// @ts-expect-error — 'status' must be a ProgressionStatus
sdk.track('progression', { status: 'done' });

// @ts-expect-error — 'flow' must be a ResourceFlow
sdk.track('resource', { flow: 'both', currency: 'gold', amount: 1 });

sdk.track('beta_key_redeemed', { source: 'influencer' });
sdk.track('discord_joined');
sdk.track('trailer_watched', { duration: 45, platform: 'youtube' });

declare const dynamicName: string;
sdk.track(dynamicName, { anything: 'goes' });
sdk.track(dynamicName);
