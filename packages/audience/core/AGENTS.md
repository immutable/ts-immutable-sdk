# Agent notes — @imtbl/audience-core

Shared internals for the Audience SDKs. Two consumers worth knowing about:

- **`@imtbl/pixel`** bundles this package **inline** into a CDN snippet with a strict size budget. Adding code, dependencies, or large constants here can push the pixel over budget — see [`packages/audience/pixel/AGENTS.md`](../pixel/AGENTS.md). CI runs the pixel bundle-size check on every PR touching `core/**`.
- **`@imtbl/audience-sdk`** consumes this package normally as a workspace dep.

Prefer narrow, tree-shakeable exports. A helper that's only imported by the SDK still costs the pixel bundle bytes if it's reachable from a shared module graph.
