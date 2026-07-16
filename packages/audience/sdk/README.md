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

## Auto-capture

The SDK includes the same passive capture engine as the tracking pixel,
useful if you're integrating the web SDK on its own, without the pixel
snippet. On by default; pass `autocapture` to `Audience.init()` to
configure it.

| Event | When it fires | Key properties |
|-------|--------------|----------------|
| `link_clicked` | Outbound link click (external domains only) | `link_url`, `link_text`, `element_id`, `outbound: true`, plus session attribution (UTMs, click IDs) |
| `form_submitted` | HTML form submission | `form_action`, `form_id`, `form_name`, `field_names`. `email_hash` at `full` consent only. |
| `button_clicked` | Button or `input[type=button\|submit\|reset]` click. Off by default (pass `autocapture: { buttons: true }` to enable). | `button_text`, `element_id`, `element_type`. Submit buttons inside a `<form>` are skipped (the form's own `form_submitted` already covers that interaction). |
| `scroll_depth` | Scroll milestone reached (25%, 50%, 75%, 90%, 100%) | `depth` (integer). Resets on each `page()` call. |

```ts
const audience = Audience.init({
  publishableKey: 'YOUR_PUBLISHABLE_KEY',
  consent: 'anonymous',
  autocapture: { forms: false }, // disable form auto-capture; others stay on
});
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

## Documentation

- [Web SDK](https://docs.immutable.com/docs/products/audience/web-sdk) — API reference, usage, integration walkthrough
- [Tracking Pixel](https://docs.immutable.com/docs/products/audience/tracking-pixel) — sibling `@imtbl/pixel` package for drop-in page-view tracking
- [REST API](https://docs.immutable.com/docs/products/audience/rest-api) — backend reference for direct integration
- [Data dictionary](https://docs.immutable.com/docs/products/audience/data-dictionary) — predefined event names and property schemas
- [Sample app](../sdk-sample-app) — runnable example showing init, tracking, identity, and consent

## License

See [LICENSE.md](../../../LICENSE.md) at the repo root.
