# @imtbl/audience-web-sdk

Track player activity on your website — page views, purchases, sign-ups — and tie it to player identity when they log in.

## Install

```bash
npm install @imtbl/audience-web-sdk
```

## Quick Start

```typescript
import { ImmutableWebSDK } from '@imtbl/audience-web-sdk';

const sdk = ImmutableWebSDK.init({
  publishableKey: 'pk_imtbl_...',
  environment: 'production',
  consent: 'anonymous',
});

sdk.track('purchase', { currency: 'USD', value: 9.99, itemId: 'sword_01' });
sdk.page();
```

## Initialisation

```typescript
const sdk = ImmutableWebSDK.init({
  publishableKey: 'pk_imtbl_...',   // Required — from Immutable Hub
  environment: 'production',         // 'dev' | 'sandbox' | 'production'
  consent: 'none',                   // 'none' | 'anonymous' | 'full' (default: 'none')
  consentSource: 'CookieBannerV2',   // Identifies the consent source (default: 'WebSDK')
  debug: false,                      // Log all events to console (default: false)
  cookieDomain: '.studio.com',       // Cross-subdomain cookie sharing (optional)
  flushInterval: 5000,               // Queue flush interval in ms (default: 5000)
  flushSize: 20,                     // Queue flush size threshold (default: 20)
});
```

## Consent

The SDK defaults to `none` — no events are collected until consent is explicitly set.

```typescript
sdk.setConsent('anonymous');  // Anonymous tracking (no PII)
sdk.setConsent('full');       // Full tracking (PII via identify)
sdk.setConsent('none');       // Stop tracking, purge queue, clear cookies
```

Update consent whenever your consent management platform reports a change. Every call syncs the new level to the server via `PUT /v1/audience/tracking-consent`.

| Level | Behaviour |
|-------|-----------|
| `none` | SDK is inert. No events collected. Queue purged on downgrade. |
| `anonymous` | Events collected with anonymous ID only. `identify()` calls are discarded. |
| `full` | Full collection. `identify()` sends. `userId` included on events. |

**On downgrade to `none`:** queue purged, `imtbl_anon_id` and `_imtbl_sid` cookies cleared.
**On downgrade from `full` to `anonymous`:** identify messages purged, `userId` stripped from queued events.

## Auto-Tracked Events

The SDK automatically fires these events. Studios do not call them.

| Event | When | Properties |
|-------|------|------------|
| `session_start` | SDK init with no active session cookie | `sessionId`, plus attribution (UTMs, click IDs, referrer) |
| `session_end` | `shutdown()` called | `sessionId`, `duration` (seconds) |

`session_end` only fires on explicit `shutdown()` calls — not on tab close or navigation. Compute session duration from timestamp gaps between the last event and `session_start`, not from `session_end` alone.

## Event Tracking

```typescript
sdk.track('sign_up', { method: 'google' });
sdk.track('purchase', { currency: 'USD', value: 9.99 });
sdk.track('wishlist_add', { gameId: 'game_123', source: 'landing_page' });
sdk.track('beta_key_redeemed', { source: 'influencer' });
```

## Page Tracking

Call `sdk.page()` on route changes. Attribution context (UTMs, click IDs, referrer, landing page) is automatically attached to the first page view.

```typescript
sdk.page();
sdk.page({ section: 'shop', category: 'weapons' });
```

## Identity

```typescript
// Identify a known user (requires full consent)
sdk.identify('user@example.com', 'email');
sdk.identify('76561198012345', 'steam');
sdk.identify('passport_sub_abc', 'passport', {
  email: 'user@example.com',
  name: 'Player One',
});

// Identify with traits only (anonymous, no userId)
sdk.identify({ source: 'steam', steamId: '76561198012345' });

// Link two identities (same player, different providers)
sdk.alias(
  { uid: '76561198012345', provider: 'steam' },
  { uid: 'user@example.com', provider: 'email' },
);

// Reset on logout (new anonymous ID, clears userId)
sdk.reset();
```

## Queue & Lifecycle

```typescript
await sdk.flush();     // Force flush all queued events
sdk.shutdown();        // Flush remaining events, stop the SDK
```

Events are batched and flushed every 5 seconds or when 20 messages accumulate. On page unload (`visibilitychange` / `pagehide`), remaining events are flushed via `fetch` with `keepalive: true`.

## CDN Usage

For sites without a bundler:

```html
<script src="https://cdn.immutable.com/web-sdk/v1/imtbl-web.global.js"></script>
<script>
  var sdk = window.ImmutableWebSDK.init({
    publishableKey: 'pk_imtbl_...',
    environment: 'production',
    consent: 'anonymous',
  });

  sdk.track('signup_started');
  sdk.identify('user@example.com', 'email');
</script>
```

## Cookies

All cookies are first-party, `SameSite=Lax`, `Secure` on HTTPS, and shared with the pixel:

| Cookie | Lifetime | Purpose |
|--------|----------|---------|
| `imtbl_anon_id` | 2 years | Anonymous device ID |
| `_imtbl_sid` | 30 min (rolling) | Session continuity |

## Wire Format

Events are sent to `POST /v1/audience/messages` with the `x-immutable-publishable-key` header. All messages include `surface: 'web'` and follow the backend OpenAPI spec.
