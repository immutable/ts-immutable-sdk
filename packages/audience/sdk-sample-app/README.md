# @imtbl/audience-sdk-sample-app

Interactive sample app for `@imtbl/audience`. Every public method, every
typed `track()` event, and every reachable `AudienceErrorCode` has a
dedicated UI control so you can sanity-check SDK changes end-to-end
against the real sandbox backend and copy working call sites.

> **Pre-release.** Depends on `@imtbl/audience@0.0.0`. The SDK API is
> stabilising but breaking changes may still land before the first
> published release.

## Why vanilla JavaScript?

Every other sample app in this monorepo (`packages/passport/sdk-sample-app`,
`packages/checkout/sdk-sample-app`, `packages/internal/dex/sdk-sample-app`,
`packages/internal/bridge/bridge-sample-app`) is React + Next.js with the
`@biom3` design system. This one is plain ES2020 served by a ~90-line Node
stdlib HTTP server. Intentional: the whole point is to demonstrate how
`@imtbl/audience` loads via a plain `<script>` tag — the pattern real
studios use when they drop the SDK into existing pages. A React wrapper
would hide `window.ImmutableAudience` behind JSX abstractions and require
a build step, obscuring the loading pattern we're demonstrating. The SDK
itself is framework-agnostic — wrap these calls in your framework of
choice when you ship.

## Run it

```sh
pnpm --filter @imtbl/audience-sdk-sample-app run dev
```

Open http://localhost:3456/. The `dev` script builds `@imtbl/audience`
first (which produces `dist/cdn/imtbl-audience.global.js`), then serves
this package's files plus the CDN bundle over a small Node server.

## Publishable keys

You need a real publishable key from [Immutable Hub](https://hub.immutable.com/) —
there is no shared fixture key. Test keys start with `pk_imapik-test-` and
route to `api.sandbox.immutable.com`; any other prefix routes to
`api.immutable.com` (prod).

For dev-environment access, leave the key as a test key and set
**Advanced → Base URL override** to `https://api.dev.immutable.com`. The
SDK auto-derives sandbox vs prod from the key prefix; dev is not a
first-class environment and must be reached via explicit override.

## Ten-step walkthrough

1. Paste a test key into **Setup**, leave Initial Consent at `none`, click **Init**.
2. Open the **Consent** panel, click **anonymous**. Status bar updates.
3. Click **Lifecycle → page()**. A page message is queued.
4. Expand **Typed Events → purchase** (5th row in the accordion), fill in `currency=USD`, `value=9.99`, click **Send**. Watch the live TS snippet mirror the form as you type.
5. Set Consent to **full**.
6. In **Identity → Named identify**, enter `user@example.com`, type `email`, traits `{"name":"Jane"}`, click.
7. In **Identity → Traits-only identify**, enter `{"plan":"pro"}`, click.
8. In **Identity → Alias**, connect a Steam ID to the email above.
9. Set Consent back to **none**. Notice the queue purge in the event log.
10. In **Error Handling**, click **Force NETWORK_ERROR**. Watch the `onError` entry land with `code: NETWORK_ERROR`. The app auto-restores the Setup configuration afterwards.

## `AudienceEvents` catalogue

These are the 11 predefined event names and their typed property shapes.
Both the CDN bundle and the ESM package expose them:

```ts
// ESM
import { AudienceEvents } from '@imtbl/audience';

// CDN
const { AudienceEvents } = window.ImmutableAudience;

audience.track(AudienceEvents.PURCHASE, {
  currency: 'USD',
  value: 9.99,
  itemId: 'sword',
  transactionId: 'tx_123',
});
```

The sample app reads event NAMES from `window.ImmutableAudience.AudienceEvents`
at bootstrap and cross-checks them against the field-metadata array in
`sample-app.js`. If the SDK grows a new event that the sample app hasn't
picked up yet, the event log shows a `drift warn` entry.

| Event | Required props | Optional props |
|---|---|---|
| `sign_up` | — | `method` |
| `sign_in` | — | `method` |
| `wishlist_add` | `gameId` | `source`, `platform` |
| `wishlist_remove` | `gameId` | — |
| `purchase` | `currency`, `value` | `itemId`, `itemName`, `quantity`, `transactionId` |
| `game_launch` | — | `platform`, `version`, `buildId` |
| `progression` | `status: 'start' \| 'complete' \| 'fail'` | `world`, `level`, `stage`, `score`, `durationSec` |
| `resource` | `flow: 'sink' \| 'source'`, `currency`, `amount` | `itemType`, `itemId` |
| `email_acquired` | — | `source` |
| `game_page_viewed` | `gameId` | `gameName`, `slug` |
| `link_clicked` | `url` | `label`, `source`, `gameId` |

Pass anything else as a custom event with the `string & {}` escape hatch:

```ts
audience.track('my_custom_event', { foo: 'bar' });
```

## Consent-aware UIs with `canTrack` / `canIdentify`

`canTrack(level)` and `canIdentify(level)` are the SDK's canonical consent
predicates. Both the CDN bundle and the ESM package expose them:

```ts
// ESM
import { canTrack, canIdentify } from '@imtbl/audience';

// CDN
const { canTrack, canIdentify } = window.ImmutableAudience;

if (canTrack(currentConsent)) {
  renderAnalyticsDashboard();
}
if (canIdentify(currentConsent)) {
  showLoginButton();
}
```

The rules themselves are simple:
- `canTrack(level)` returns `true` iff `level !== 'none'`
- `canIdentify(level)` returns `true` iff `level === 'full'`

The sample app's Identity and Alias buttons stay enabled whenever the SDK
is initialised, but the handlers call `canIdentify(currentConsent)` before
invoking `identify()` / `alias()`. When it returns `false`, the handler
logs a `skipped — canIdentify(...) is false` line and returns without
calling the SDK. This mirrors how the SDK itself handles these calls at
lower consent levels: it no-ops rather than throwing, so the sample app
avoids a misleading "ok" log entry for a call that did nothing.

## Error codes

`AudienceError.code` is a closed union: `'FLUSH_FAILED'`,
`'CONSENT_SYNC_FAILED'`, `'NETWORK_ERROR'`, `'VALIDATION_REJECTED'`.
Handle them in an `onError` callback passed at init time:

```js
const audience = window.ImmutableAudience.init({
  publishableKey: 'pk_imapik-test-...',
  onError: (err) => {
    switch (err.code) {
      case 'FLUSH_FAILED':        /* retryable; the queue will retry automatically */ break;
      case 'NETWORK_ERROR':       /* usually transient; the queue will retry       */ break;
      case 'CONSENT_SYNC_FAILED': /* consent PUT failed; state still stored locally */ break;
      case 'VALIDATION_REJECTED': /* terminal; messages were dropped                */ break;
    }
    sentryClient.captureException(err);
  },
});
```

The sample app's Error Handling panel triggers each reachable code by
shutting down, re-initialising against a deliberately broken config, and
logging the `AudienceError` shape it receives via `onError`.

`VALIDATION_REJECTED` is not triggerable from the browser because it
requires the backend to accept the HTTPS POST and then report
`rejected > 0` in the JSON body. The shape you'd see in that case is:

```ts
{
  name: 'AudienceError',
  code: 'VALIDATION_REJECTED',
  message: 'Backend rejected N of M messages',
  status: 200,  // or another 2xx
  endpoint: '...',
  responseBody: { accepted: M - N, rejected: N, ... },
}
```

## CSP

The sample app serves under a tight CSP:

```
default-src 'self';
script-src 'self';
style-src 'self';
connect-src https://api.dev.immutable.com https://api.sandbox.immutable.com https://api.immutable.com
```

No inline scripts, no inline styles, no third-party origins. If you
adapt this sample app for a studio-owned page, keep the same posture —
`@imtbl/audience` is designed to run under a strict CSP.
