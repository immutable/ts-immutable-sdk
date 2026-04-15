# @imtbl/audience-sdk-sample-app

Interactive sample app for `@imtbl/audience`. Every public method, every
typed `track()` event, and every reachable `AudienceErrorCode` has a
dedicated UI control so you can sanity-check SDK changes end-to-end
against the real sandbox backend and copy working call sites.

## Run it

```sh
pnpm --filter @imtbl/audience-sdk-sample-app run dev
```

Open http://localhost:3456/. The `dev` script builds `@imtbl/audience`
first (which produces `dist/cdn/imtbl-audience.global.js`), then serves
this package's files plus the CDN bundle over a small Node server.

## Test keys

These are publishable-key fixtures safe for local use:

- **Sandbox (default):** `pk_imapik-test-sample` — talks to `api.sandbox.immutable.com`
- **Prod:** any non-`pk_imapik-test-` key — talks to `api.immutable.com`

For dev-environment access, leave the key as a test key and set
**Advanced → Base URL override** to `https://api.dev.immutable.com`.
The SDK auto-derives sandbox vs prod from the key prefix; dev is not a
first-class environment and must be reached via explicit override.

## Ten-step walkthrough

1. Paste a test key into **Setup**, leave Initial Consent at `none`, click **Init**.
2. Open the **Consent** panel, click **anonymous**. Status bar updates.
3. Click **Lifecycle → page()**. A page message is queued.
4. Expand **Typed Events → purchase**, fill in `currency=USD`, `value=9.99`, click **Send**. Watch the live TS snippet mirror the form as you type.
5. Set Consent to **full**.
6. In **Identity → Named identify**, enter `user@example.com`, type `email`, traits `{"name":"Jane"}`, click.
7. In **Identity → Traits-only identify**, enter `{"plan":"pro"}`, click.
8. In **Identity → Alias**, connect a Steam ID to the email above.
9. Set Consent back to **none**. Notice the queue purge in the event log.
10. In **Error Handling**, click **Force NETWORK_ERROR**. Watch the `onError` entry land with `code: NETWORK_ERROR`. The app auto-restores the Setup configuration afterwards.

## `AudienceEvents` catalogue

These are the 11 predefined event names and their typed property shapes.
Because `AudienceEvents` is not attached to `window.ImmutableAudience` by
the CDN bundle, the sample app hardcodes the names as a string array in
`sample-app.js`. For TypeScript projects, import the constant instead:

```ts
import { AudienceEvents } from '@imtbl/audience';

audience.track(AudienceEvents.PURCHASE, {
  currency: 'USD',
  value: 9.99,
  itemId: 'sword',
  transactionId: 'tx_123',
});
```

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

The helpers `canTrack(level)` and `canIdentify(level)` are exported from
`@imtbl/audience` but not attached to `window.ImmutableAudience`. TypeScript
projects can import them:

```ts
import { canTrack, canIdentify } from '@imtbl/audience';

if (canTrack(currentConsent)) {
  renderAnalyticsDashboard();
}
if (canIdentify(currentConsent)) {
  showLoginButton();
}
```

From a plain-JavaScript CDN-only context, the rules are:

- `canTrack(level)` is true iff `level !== 'none'`
- `canIdentify(level)` is true iff `level === 'full'`

The sample app gates its Identity and Alias buttons on this rule locally.

## Error codes

`AudienceError.code` is a closed union: `'FLUSH_FAILED'`,
`'CONSENT_SYNC_FAILED'`, `'NETWORK_ERROR'`, `'VALIDATION_REJECTED'`.
Handle them in an `onError` callback passed at init time:

```ts
audience = Audience.init({
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
