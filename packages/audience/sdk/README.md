# @imtbl/audience

Consent-aware event tracking and player identity for Immutable studios.
Ships as an ESM/CJS package for bundled apps and as a single-file CDN
IIFE for `<script>`-tag loading.

> **Pre-release.** This package is at version `0.0.0`. The API is
> stabilising but breaking changes may still land before the first
> published release.

## Which Immutable event-tracking product is this?

Immutable ships two complementary event-tracking products in this
monorepo. Pick based on your integration shape:

- **`@imtbl/audience`** (this package) — the programmatic SDK. You call
  `Audience.init()` from your app code and explicitly track events
  (`track('purchase', {...})`, `identify()`, `setConsent()`, etc.).
  Pick this when you need fine-grained control, typed events, player
  identity, or explicit consent state machines.
- **`@imtbl/pixel`** ([sibling package](../pixel/README.md)) — a drop-in
  `<script>` snippet that captures page views, device signals, and
  attribution data passively. Zero configuration beyond a publishable
  key. Pick this for marketing sites, landing pages, and web shops
  where you want to measure campaign performance without writing
  tracking code.

The two share the same backend pipeline, the same anonymous-id cookie
(`imtbl_anon_id`), and the same publishable-key format — they're
designed to coexist on a single site if you need both at once.

## Install

```sh
npm install @imtbl/audience
# or
pnpm add @imtbl/audience
# or
yarn add @imtbl/audience
```

For the CDN build, drop one `<script>` tag into your HTML and call
`ImmutableAudience.init({...})` — no bundler, no `npm install`.
Once `@imtbl/audience` is published, the bundle URL will be
`https://cdn.jsdelivr.net/npm/@imtbl/audience@<version>/dist/cdn/imtbl-audience.global.js`
(replace `<version>` with a specific release tag).

## Quickstart — ESM

```ts
import { Audience } from '@imtbl/audience';

const audience = Audience.init({
  publishableKey: 'pk_imapik-test-...',
  consent: 'anonymous',
  onError: (err) => console.error(err.code, err.message),
});

audience.page();
audience.track('purchase', { currency: 'USD', value: 9.99 });
audience.identify('user@example.com', 'email', { name: 'Jane' });
audience.setConsent('full');

// when the app unmounts
audience.shutdown();
```

## Quickstart — CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@imtbl/audience@<version>/dist/cdn/imtbl-audience.global.js"></script>
<script>
  const {
    init, AudienceError, AudienceEvents,
    IdentityType, canTrack, canIdentify,
  } = window.ImmutableAudience;
  const audience = init({
    publishableKey: 'pk_imapik-test-...',
    consent: 'anonymous',
    onError: (err) => console.error(err.code, err.message),
  });
  audience.page();
  audience.track(AudienceEvents.PURCHASE, { currency: 'USD', value: 9.99 });
</script>
```

The CDN bundle attaches `init` (the same static factory ESM consumers
call as `Audience.init({...})`) alongside `AudienceError`,
`AudienceEvents`, `IdentityType`, `canTrack`, `canIdentify`, and
`version`, so every runtime helper an ESM consumer needs is reachable
from the CDN global too.

## Error handling

`AudienceError.code` is a closed union — `'FLUSH_FAILED'`,
`'CONSENT_SYNC_FAILED'`, `'NETWORK_ERROR'`, `'VALIDATION_REJECTED'` —
so you can branch on the failure mode:

```ts
Audience.init({
  publishableKey: 'pk_imapik-test-...',
  onError: (err) => {
    switch (err.code) {
      case 'VALIDATION_REJECTED':
        // Terminal: messages were dropped. Inspect err.responseBody
        // for per-message detail when the backend provides it.
        break;
      default:
        // Transient: the queue will retry automatically.
        break;
    }
    telemetry.captureException(err);
  },
});
```

Exceptions thrown from `onError` are swallowed by the SDK so a
bad handler can't wedge the queue.

## Interactive sample app

For a live harness that exercises every public method, every typed
`track()` event, and every reachable `AudienceErrorCode` against the
real sandbox backend, see [`packages/audience/sdk-sample-app`](https://github.com/immutable/ts-immutable-sdk/tree/main/packages/audience/sdk-sample-app)
in the `ts-immutable-sdk` monorepo.

## License

See [LICENSE.md](../../../LICENSE.md) at the repo root.
