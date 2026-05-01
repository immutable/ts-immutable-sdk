# Agent notes — @imtbl/pixel

This package ships a third-party tracking snippet served from `cdn.immutable.com` and embedded on customer sites. **Bundle size is a hard product constraint.**

- Budget lives in [`bundlebudget.json`](./bundlebudget.json) (currently 10 KB max / 8 KB warn, gzipped).
- CI enforces it on every PR touching `packages/audience/pixel/**` or `packages/audience/core/**` via [`.github/workflows/pixel-bundle-size.yaml`](../../../.github/workflows/pixel-bundle-size.yaml) — builds base vs. head, posts a delta comment, fails over budget. Local rebuilds (`pnpm build` then `gzip -c dist/imtbl.js | wc -c`) are useful for fast iteration while you're cutting bytes, but the workflow is the source of truth.
- `@imtbl/audience-core` is **bundled inline** via the `tsup.config.ts` alias, not externalised. Changes to `core` count toward this budget — that's why the workflow triggers on `core/**` paths too.
