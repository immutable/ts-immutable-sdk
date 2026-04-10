// Roll up the generated .d.ts files so that type re-exports from
// `@imtbl/audience-core` (and its transitive `@imtbl/metrics`) are inlined
// into a single self-contained declaration file. Without this, consumers of
// the published tarball would get unresolved type references, because the
// @imtbl/* packages are bundled into dist/ but not published alongside.
import { dts } from 'rollup-plugin-dts';

// By default, rollup treats every non-relative import as external — so
// `@imtbl/audience-core` type re-exports would stay as bare imports in the
// output. Pass `respectExternal: true` so the plugin walks through node
// resolution to `.d.ts` files for @imtbl/* workspace packages and inlines
// them into the rolled-up declaration file.
export default {
  input: 'dist/types/index.d.ts',
  output: { file: 'dist/types/index.d.ts', format: 'es' },
  plugins: [dts({ respectExternal: true })],
};
