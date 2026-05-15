# @imtbl/audience

Consent-aware event tracking and player identity for Immutable studios.
Ships as an ESM/CJS package for bundled apps and as a single-file CDN
IIFE for `<script>`-tag loading.

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
`ImmutableAudience.init({...})` — no bundler, no `npm install`.
The bundle URL is `https://cdn.immutable.com/audience/v1/imtbl.js`.

## Quickstart — ESM

```ts
import { Audience } from '@imtbl/audience';

const audience = Audience.init({
  publishableKey: 'YOUR_PUBLISHABLE_KEY',
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
<script src="https://cdn.immutable.com/audience/v1/imtbl.js"></script>
<script>
  const {
    init, AudienceError, AudienceEvents,
    IdentityType, canTrack, canIdentify,
  } = window.ImmutableAudience;
  const audience = init({
    publishableKey: 'YOUR_PUBLISHABLE_KEY',
    consent: 'anonymous',
    onError: (err) => console.error(err.code, err.message),
  });
  audience.page();
  audience.track(AudienceEvents.PURCHASE, { currency: 'USD', value: 9.99 });
</script>
```

Pass `testMode: true` in the config to mark all events with `test: true`, which lets you filter test traffic from production analytics.

## Documentation

- [Web SDK](https://docs.immutable.com/docs/products/audience/web-sdk) — API reference, usage, integration walkthrough
- [Tracking Pixel](https://docs.immutable.com/docs/products/audience/tracking-pixel) — sibling `@imtbl/pixel` package for drop-in page-view tracking
- [REST API](https://docs.immutable.com/docs/products/audience/rest-api) — backend reference for direct integration
- [Data dictionary](https://docs.immutable.com/docs/products/audience/data-dictionary) — predefined event names and property schemas
- [Sample app](../sdk-sample-app) — runnable example showing init, tracking, identity, and consent

## License

See [LICENSE.md](../../../LICENSE.md) at the repo root.
