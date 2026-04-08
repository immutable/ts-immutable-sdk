# @imtbl/audience

Consent-aware event tracking and identity resolution for Immutable studios.

> **Pre-release.** This package is at version `0.0.0`. The API is stabilizing but breaking changes may still land before the first npm publish.

## Install

```sh
npm install @imtbl/audience
# or
pnpm add @imtbl/audience
# or
yarn add @imtbl/audience
```

Once published to npm, you'll be able to load the package via CDN (no bundler required):

```html
<!-- Replace <version> with a specific release tag once @imtbl/audience is published. -->
<script src="https://cdn.jsdelivr.net/npm/@imtbl/audience@<version>/dist/cdn/imtbl-audience.global.js"></script>
<script>
  const audience = ImmutableAudience.Audience.init({
    publishableKey: 'pk_imapik-...',
    environment: 'sandbox',
    consent: 'anonymous',
  });
</script>
```

Until the first npm release, you can build the CDN bundle locally from this repo: `cd packages/audience/sdk && pnpm build`. The output is at `dist/cdn/imtbl-audience.global.js`. See `demo/README.md` for the interactive demo that loads it.

## Quickstart

```ts
import { Audience, IdentityType } from '@imtbl/audience';

const audience = Audience.init({
  publishableKey: 'pk_imapik-...',
  environment: 'sandbox',
  consent: 'anonymous', // or 'none' until the user opts in
  debug: true,
  onError: (err) => {
    console.error('[audience]', err.code, err.status, err.responseBody);
  },
});

// Track a page view
audience.page({ section: 'marketplace' });

// Track a custom event
audience.track('purchase_completed', { sku: 'pack-1', usd: 9.99 });

// Upgrade consent and identify the user
audience.setConsent('full');
audience.identify('player-7721', IdentityType.Passport, { plan: 'premium' });

// Link a previous identity
audience.alias(
  { id: '76561198012345', identityType: IdentityType.Steam },
  { id: 'player-7721', identityType: IdentityType.Passport },
);

// On logout
audience.reset();

// On app unmount
audience.shutdown();
```

## API

### `Audience.init(config): Audience`

Creates and starts the SDK. `config` is an `AudienceConfig`:

| Field | Type | Required | Description |
|---|---|---|---|
| `publishableKey` | `string` | yes | Publishable API key from Immutable Hub (prefix: `pk_imapik-`). |
| `environment` | `'dev' \| 'sandbox' \| 'production'` | yes | Backend to target. |
| `consent` | `'none' \| 'anonymous' \| 'full'` | no | Initial consent level. Defaults to `'none'`. |
| `debug` | `boolean` | no | Log every SDK call and flush to the browser console. |
| `cookieDomain` | `string` | no | Cookie domain for cross-subdomain sharing (e.g. `.studio.com`). |
| `flushInterval` | `number` | no | Queue flush interval in ms. Defaults to `5000`. |
| `flushSize` | `number` | no | Batch size that triggers an automatic flush. Defaults to `20`. |
| `onError` | `(err: AudienceError) => void` | no | Called when a flush or consent sync fails. |

### Methods

- **`page(properties?)`** — record a page view. Call on every route change.
- **`track(eventName, properties?)`** — record a custom event.
- **`identify(id, identityType, traits?)`** — tell the SDK who this player is. Requires `full` consent.
- **`identify(traits)`** — traits-only overload for anonymous profile updates.
- **`alias({id, identityType}, {id, identityType})`** — link two identities that belong to the same player.
- **`setConsent(status)`** — update the consent level in response to a banner.
- **`reset()`** — call on logout; rotates the anonymous ID and clears state.
- **`flush()`** — force-send queued events.
- **`shutdown()`** — stop the SDK and drain the queue.

## Identity types

The `identityType` argument to `identify()` and `alias()` must be one of:

| Value | Description |
|---|---|
| `passport` | Immutable Passport ID |
| `steam` | Steam ID (64-bit) |
| `epic` | Epic Games account ID |
| `google` | Google account ID |
| `apple` | Apple ID |
| `discord` | Discord user ID |
| `email` | Email address |
| `custom` | Studio-defined custom ID |

Import the `IdentityType` enum to reference these at runtime:

```ts
import { IdentityType } from '@imtbl/audience';

IdentityType.Passport; // 'passport'
```

## Error handling

`AudienceConfig.onError` receives an `AudienceError` with these fields:

```ts
class AudienceError extends Error {
  readonly code: 'FLUSH_FAILED' | 'CONSENT_SYNC_FAILED' | 'NETWORK_ERROR' | 'VALIDATION_REJECTED';
  readonly status: number;          // HTTP status, 0 for network failure
  readonly endpoint: string;        // full URL that failed
  readonly responseBody?: unknown;  // parsed JSON body from the backend
  readonly cause?: unknown;         // original fetch error on network failure
}
```

Errors are delivered asynchronously (after the failing flush completes). Throwing from `onError` is safe — the SDK catches and suppresses callback exceptions.

## Demo

There's an interactive demo under `demo/` that exercises every public method against the real backend. See `demo/README.md` for instructions.

## License

Apache-2.0
