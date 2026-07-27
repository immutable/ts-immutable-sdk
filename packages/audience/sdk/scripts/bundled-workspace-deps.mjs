// Single source of truth for @imtbl/* workspace packages that get bundled
// into the published @imtbl/audience package.
//
// Used by:
//   - ../tsdown.config.js (deps.alwaysBundle: inlines the runtime code at build)
//   - ./prepack.mjs       (strips workspace:* specifiers from package.json
//                          before pnpm pack, since these deps are bundled
//                          into dist/ and @imtbl/audience-core is private)
//
// Adding a new direct @imtbl/* workspace dep to @imtbl/audience? Add it
// here. Otherwise tsdown will leave the import as external (broken at runtime
// in consumer projects) or prepack will leave a workspace:* specifier in
// the published package.json (breaks `npm install @imtbl/audience`).
export const BUNDLED_WORKSPACE_DEPS = [
  '@imtbl/audience-core',
  '@imtbl/metrics',
];
