# @imtbl/audience

Consent-aware event tracking and identity resolution for Immutable
studios. Ships as an ESM/CJS package for bundled apps and as a single-file
CDN IIFE for `<script>`-tag loading.

> **Pre-release.** This package is at version `0.0.0`. The API is
> stabilising but breaking changes may still land before the first
> published release.

## Install

```sh
npm install @imtbl/audience
# or
pnpm add @imtbl/audience
# or
yarn add @imtbl/audience
```

For the CDN build, drop one `<script>` tag into your HTML and call
`ImmutableAudience.Audience.init({...})` — no bundler, no `npm install`.
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
  const { Audience, AudienceError, IdentityType } = window.ImmutableAudience;
  const audience = Audience.init({
    publishableKey: 'pk_imapik-test-...',
    consent: 'anonymous',
    onError: (err) => console.error(err.code, err.message),
  });
  audience.page();
</script>
```

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
real sandbox backend, see
[`packages/audience/sdk-sample-app`](../sdk-sample-app/README.md).

## License

See [LICENSE.md](../../../LICENSE.md) at the repo root.
