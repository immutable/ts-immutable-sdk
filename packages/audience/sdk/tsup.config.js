// @ts-check
// Local tsup config for @imtbl/audience.
//
// Overrides the monorepo's root tsup config by setting `noExternal` to the
// explicit list of `@imtbl/*` workspace deps that should be inlined into the
// built bundle. The same list is used by scripts/prepack.mjs to strip those
// deps from the published package.json. Keeping the two in sync via a shared
// module prevents the "tsup silently bundles a new dep but prepack leaves
// workspace:* in package.json" class of bugs.
import { defineConfig } from 'tsup';
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' with { type: 'json' };
import { BUNDLED_WORKSPACE_DEPS } from './scripts/bundled-workspace-deps.mjs';

export default defineConfig((options) => {
  if (options.watch) {
    return {
      entry: ['src/index.ts'],
      outDir: 'dist/browser',
      format: 'esm',
      target: 'es2022',
      platform: 'browser',
      bundle: true,
      noExternal: BUNDLED_WORKSPACE_DEPS,
      esbuildPlugins: [
        nodeModulesPolyfillPlugin({
          globals: { Buffer: true, process: true },
          modules: ['crypto', 'buffer', 'process'],
        }),
        replace({
          __SDK_VERSION__: pkg.version === '0.0.0' ? '2.0.0' : pkg.version,
        }),
      ],
    };
  }

  return [
    // Browser ESM bundle
    {
      entry: ['src/index.ts'],
      outDir: 'dist/browser',
      platform: 'browser',
      format: 'esm',
      target: 'es2022',
      minify: true,
      bundle: true,
      noExternal: BUNDLED_WORKSPACE_DEPS,
      treeshake: true,
      esbuildPlugins: [
        nodeModulesPolyfillPlugin({
          globals: { Buffer: true, process: true },
          modules: ['crypto', 'buffer', 'process'],
        }),
        replace({ __SDK_VERSION__: pkg.version }),
      ],
    },

    // Node CJS + ESM bundle
    {
      entry: ['src/index.ts'],
      outDir: 'dist/node',
      platform: 'node',
      format: ['esm', 'cjs'],
      target: 'es2022',
      minify: true,
      bundle: true,
      noExternal: BUNDLED_WORKSPACE_DEPS,
      treeshake: true,
      esbuildPlugins: [
        replace({ __SDK_VERSION__: pkg.version }),
      ],
    },
  ];
});
