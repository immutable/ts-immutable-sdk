# @imtbl/audience-web-sdk — Audience Web SDK

Explicit, typed, consent-aware event tracking and identity management for web surfaces. Part of the Immutable Audience platform.

## Install

```bash
npm install @imtbl/audience-web-sdk
```

## Quick Start

```typescript
import { ImmutableWebSDK, AudienceEvent, IdentityProvider } from '@imtbl/audience-web-sdk';

const sdk = ImmutableWebSDK.init({
  publishableKey: 'pk_imtbl_...',
  environment: 'production',
  consent: 'anonymous',
});

// Track a typed event
sdk.track(AudienceEvent.Purchase, {
  currency: 'USD',
  value: 9.99,
  itemId: 'sword_01',
});

// Track a custom event
sdk.track('beta_key_redeemed', { source: 'influencer' });

// Page view (call on route change in SPAs)
sdk.page();
```

## Initialisation

```typescript
const sdk = ImmutableWebSDK.init({
  publishableKey: 'pk_imtbl_...',   // Required — from Immutable Hub
  environment: 'production',         // 'dev' | 'sandbox' | 'production'
  consent: 'none',                   // 'none' | 'anonymous' | 'full' (default: 'none')
  consentSource: 'CookieBannerV2',   // Identifies the consent source (default: 'WebSDK')
  trackPageViews: false,             // Auto-fire page() on SPA route changes (default: false)
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

Consent is:
- **Persisted locally** via `_imtbl_consent` cookie (shared with the pixel)
- **Synced server-side** via `PUT /v1/audience/tracking-consent`

| Level | Behaviour |
|-------|-----------|
| `none` | SDK is inert. No events collected. Queue purged on downgrade. |
| `anonymous` | Events collected with anonymous ID only. `identify()` calls are discarded. |
| `full` | Full collection. `identify()` sends. `userId` included on events. |

**On downgrade to `none`:** queue purged, `imtbl_anon_id` and `_imtbl_sid` cookies cleared.
**On downgrade from `full` to `anonymous`:** identify messages purged, `userId` stripped from queued events.

## Event Tracking

### Typed Events

```typescript
sdk.track(AudienceEvent.SignUp, { method: 'google' });
sdk.track(AudienceEvent.SignIn, { method: 'passport' });
sdk.track(AudienceEvent.Purchase, { currency: 'USD', value: 9.99 });
sdk.track(AudienceEvent.WishlistAdd, { gameId: 'game_123', source: 'landing_page' });
sdk.track(AudienceEvent.WishlistRemove, { gameId: 'game_123' });
sdk.track(AudienceEvent.SessionStart, {});
sdk.track(AudienceEvent.SessionEnd, { duration: 1800 });
sdk.track(AudienceEvent.LevelReached, { level: 5, characterClass: 'warrior' });
sdk.track(AudienceEvent.Spend, { currency: 'gold', value: 100 });
sdk.track(AudienceEvent.TutorialComplete, { stepNumber: 3 });
```

### Custom Events

```typescript
sdk.track('checkout_started', { cartValue: 49.99, itemCount: 3 });
sdk.track('discord_joined');
```

## Page Tracking

```typescript
// Explicit page view
sdk.page();
sdk.page({ section: 'shop', category: 'weapons' });
```

For SPAs, enable auto-tracking to fire `page()` on every route change:

```typescript
const sdk = ImmutableWebSDK.init({
  publishableKey: 'pk_imtbl_...',
  environment: 'production',
  consent: 'anonymous',
  trackPageViews: true,  // Detects pushState, replaceState, popstate
});
```

Attribution context (UTMs, click IDs, referrer, landing page) is automatically attached to the first page view.

## Identity

```typescript
// Identify a known user (requires full consent)
sdk.identify('user@example.com', IdentityProvider.Email);
sdk.identify('76561198012345', IdentityProvider.Steam);
sdk.identify('passport_sub_abc', IdentityProvider.Passport, {
  email: 'user@example.com',
  name: 'Player One',
});

// Link two identities (same player, different providers)
sdk.alias(
  { uid: '76561198012345', provider: IdentityProvider.Steam },
  { uid: 'user@example.com', provider: IdentityProvider.Email },
);

// Reset on logout (new anonymous ID, clears userId)
sdk.reset();
```

**Providers:** `Passport`, `Steam`, `Epic`, `Google`, `Apple`, `Discord`, `Email`, `Custom`

## Queue & Lifecycle

```typescript
// Force flush all queued events
await sdk.flush();

// Stop the SDK (flushes remaining events, tears down listeners)
sdk.shutdown();
```

Events are batched and flushed every 5 seconds or when 20 messages accumulate. On page unload (`visibilitychange` / `pagehide`), remaining events are flushed via `fetch` with `keepalive: true`.

## CDN Usage

For sites without a bundler:

```html
<script src="https://cdn.immutable.com/web-sdk/v1/imtbl-web.js"></script>
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
| `_imtbl_consent` | 1 year | Consent state |

## Wire Format

Events are sent to `POST /v1/audience/messages` with the `x-immutable-publishable-key` header. All messages include `surface: 'web'` and follow the backend OpenAPI spec.

## Bundle Size

| Bundle | Size (gzipped) |
|--------|---------------|
| npm (ESM, tree-shaken) | ~3.6 KB |
| CDN (IIFE, self-contained) | ~4.0 KB |
