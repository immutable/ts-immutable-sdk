# @imtbl/audience-sdk-sample-app

Single-page interactive harness that exercises every public method on the `Audience` class against the real Immutable backend.

## Run

```sh
cd packages/audience/sdk-sample-app
pnpm dev
```

This builds `@imtbl/audience` (ESM + CDN bundle + types) and then serves this sample app on `http://localhost:3456`. Open that URL directly — `index.html` is the entry point. The sample-app's local `serve.mjs` routes `/vendor/imtbl-audience.global.js` to the CDN bundle in `../sdk/dist/cdn/`, so the sdk's build output stays the single source of truth.

Stop the server with `Ctrl+C`.

## Test publishable keys

These are test-only keys registered for audience tracking. Safe to commit and share.

| Environment | Key |
|---|---|
| `dev` | `pk_imapik-test-Xei06NzJZClzQogVXlKQ` |
| `sandbox` | `pk_imapik-test-5ss4GpFy-n@$$Ye3LSox` |

## What to try

1. Paste a key, pick `sandbox`, set initial consent to `anonymous`, click **Init**.
2. Watch the event log: you'll see `INIT`, `TRACK session_start`, and `FLUSH ok`. Check the browser DevTools Network tab — `POST /v1/audience/messages` should return 200.
3. Click **Call page()** with no properties → `PAGE` entry + 200 response.
4. Enter `{"section":"marketplace"}` in the page properties textarea → `PAGE {section: marketplace}`.
5. Track a custom event with properties → `TRACK`.
6. In **Studio Events**, click **game_page_viewed** → fires with demo gameId, gameName, slug, isLoggedIn.
7. Click **link_clicked** → fires with a demo URL, label, source, and gameId.
8. Click **email_acquired**, **sign_in**, **wishlist_add**, **wishlist_remove** → each fires with realistic demo properties matching the Play integration.
9. Set consent to `full` → `PUT /v1/audience/tracking-consent` returns 204.
10. Identify a user (any made-up ID, type `passport`, optional traits) → status bar's User ID updates.
11. Try Alias with a Steam ID → Passport ID → `ALIAS` entry.
12. Click **Reset** → anonymous ID rotates, session end + start fire.
13. Click **Shutdown** → session end fires, buttons flip off.

## Environments

| Env | API URL | Consent PUT |
|---|---|---|
| `dev` | `api.dev.immutable.com` | **known broken — returns 500.** Use `sandbox` to exercise consent sync. |
| `sandbox` | `api.sandbox.immutable.com` | works |

## Troubleshooting

- **`window.ImmutableAudience is undefined`** in the demo page: the CDN bundle failed to load. Re-run `pnpm dev` from `packages/audience/sdk-sample-app` and confirm `../sdk/dist/cdn/imtbl-audience.global.js` exists.
- **`POST /v1/audience/messages` returns 400**: the publishable key format is wrong. Must start with `pk_imapik-`.
- **`POST /v1/audience/messages` returns 403**: the key isn't registered for audience tracking on the backend. Use one of the keys in the table above.
- **Identify button is a no-op**: consent is not `full`. Click **Set full** first.
- **No events in BigQuery after 30s**: events go through SQS → Pub/Sub → BigQuery. BQ access requires `roles/bigquery.dataViewer` on `dev-im-cdp`. If you don't have it, the API ack (`POST /messages` 200) is your E2E confirmation.

## Files

```
sdk-sample-app/
  index.html   # single page, loads /vendor/imtbl-audience.global.js
  demo.js      # vanilla ES2020, no modules; reads window.ImmutableAudience
  demo.css     # light theme, hand-written CSS, no external deps
  serve.mjs    # tiny Node static server; routes /vendor/ to ../sdk/dist/cdn/
  package.json # private workspace package; @imtbl/audience as workspace dep
  README.md    # this file
```

Security: all user-controlled inputs (event names, traits, publishable keys) are rendered via `textContent` / `createElement`. No `innerHTML` anywhere on user data. The CSP meta tag restricts `connect-src` to the dev and sandbox audience API origins only (`api.dev.immutable.com`, `api.sandbox.immutable.com`). `@imtbl/metrics` SDK telemetry is bundled into the CDN and posts to `api.immutable.com`; those calls will be blocked by the browser with a CSP violation log, which is intentional and does not affect demo behavior.
