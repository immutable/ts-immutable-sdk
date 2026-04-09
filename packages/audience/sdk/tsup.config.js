// @ts-check
// Local tsup config for @imtbl/audience.
//
// Extends the monorepo's root tsup config but overrides `noExternal` so that
// every `@imtbl/*` workspace dep (audience-core, its transitive metrics dep)
// is inlined into the built bundle. This makes the package installable as a
// standalone tarball without the pnpm `workspace:*` protocol.
import { defineConfig } from 'tsup';
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' with { type: 'json' };

const IMTBL_WORKSPACE = /^@imtbl\//;

export default defineConfig((options) => {
  if (options.watch) {
    return {
      entry: ['src/index.ts'],
      outDir: 'dist/browser',
      format: 'esm',
      target: 'es2022',
      platform: 'browser',
      bundle: true,
      noExternal: [IMTBL_WORKSPACE],
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
      noExternal: [IMTBL_WORKSPACE],
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
      noExternal: [IMTBL_WORKSPACE],
      treeshake: true,
      esbuildPlugins: [
        replace({ __SDK_VERSION__: pkg.version }),
      ],
    },
  ];
});
