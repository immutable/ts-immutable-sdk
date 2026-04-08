# @imtbl/audience — Demo

Single-page interactive harness that exercises every public method on the `Audience` class against the real Immutable backend.

## Run

```sh
cd packages/audience/sdk
pnpm demo
```

This runs `pnpm build` (ESM + CDN bundle + types) then serves the package root on `http://localhost:3456`. Open:

```
http://localhost:3456/demo/
```

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
6. Set consent to `full` → `PUT /v1/audience/tracking-consent` returns 204.
7. Identify a user (any made-up ID, type `passport`, optional traits) → status bar's User ID updates.
8. Try Alias with a Steam ID → Passport ID → `ALIAS` entry.
9. Click **Reset** → anonymous ID rotates, session end + start fire.
10. Click **Shutdown** → session end fires, buttons flip off.

## Environments

| Env | API URL | Consent PUT |
|---|---|---|
| `dev` | `api.dev.immutable.com` | **known broken — returns 500.** Use `sandbox` to exercise consent sync. |
| `sandbox` | `api.sandbox.immutable.com` | works |

## Troubleshooting

- **`window.ImmutableAudience is undefined`** in the demo page: the CDN bundle failed to load. Re-run `pnpm build` from `packages/audience/sdk` and confirm `dist/cdn/imtbl-audience.global.js` exists.
- **`POST /v1/audience/messages` returns 400**: the publishable key format is wrong. Must start with `pk_imapik-`.
- **`POST /v1/audience/messages` returns 403**: the key isn't registered for audience tracking on the backend. Use one of the keys in the table above.
- **Identify button is a no-op**: consent is not `full`. Click **Set full** first.
- **No events in BigQuery after 30s**: events go through SQS → Pub/Sub → BigQuery. BQ access requires `roles/bigquery.dataViewer` on `dev-im-cdp`. If you don't have it, the API ack (`POST /messages` 200) is your E2E confirmation.

## Files

```
demo/
  index.html   # single page, loads ../dist/cdn/imtbl-audience.global.js
  demo.js      # vanilla ES2020, no modules; reads window.ImmutableAudience
  demo.css     # light theme, hand-written CSS, no external deps
  README.md    # this file
```

Security: all user-controlled inputs (event names, traits, publishable keys) are rendered via `textContent` / `createElement`. No `innerHTML` anywhere on user data. CSP meta tag restricts `connect-src` to the dev and sandbox API origins.
