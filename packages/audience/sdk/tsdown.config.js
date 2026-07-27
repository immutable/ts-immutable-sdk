// @ts-check
// Local tsdown config for @imtbl/audience.
//
// Overrides the monorepo shared browser/node preset by setting
// `deps.alwaysBundle` to the explicit list of `@imtbl/*` workspace deps that
// should be inlined. The same list is used by scripts/prepack.mjs to strip
// those deps from the published package.json.
import { defineConfig } from 'tsdown';
import { replacePlugin } from '../../../tsdown.base.ts';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import pkg from './package.json' with { type: 'json' };
import { BUNDLED_WORKSPACE_DEPS } from './scripts/bundled-workspace-deps.mjs';

const localVersion = pkg.version === '0.0.0' ? '0.0.0-local' : pkg.version;

export default defineConfig((options) => {
  if (options.watch) {
    return {
      entry: ['src/index.ts'],
      outDir: 'dist/browser',
      format: 'esm',
      target: 'es2022',
      platform: 'browser',
      dts: false,
      deps: {
        alwaysBundle: BUNDLED_WORKSPACE_DEPS,
        onlyBundle: false,
      },
      plugins: [
        // @ts-expect-error rollup plugin types
        nodePolyfills(),
        replacePlugin({ __SDK_VERSION__: localVersion }),
      ],
    };
  }

  return [
    {
      entry: ['src/index.ts'],
      outDir: 'dist/browser',
      platform: 'browser',
      format: 'esm',
      target: 'es2022',
      minify: true,
      treeshake: true,
      dts: false,
      deps: {
        alwaysBundle: BUNDLED_WORKSPACE_DEPS,
        onlyBundle: false,
      },
      plugins: [
        // @ts-expect-error rollup plugin types
        nodePolyfills(),
        replacePlugin({ __SDK_VERSION__: pkg.version }),
      ],
    },
    {
      entry: ['src/index.ts'],
      outDir: 'dist/node',
      platform: 'node',
      fixedExtension: false,
      format: ['esm', 'cjs'],
      target: 'es2022',
      minify: true,
      treeshake: true,
      dts: false,
      clean: true,
      deps: {
        alwaysBundle: BUNDLED_WORKSPACE_DEPS,
        onlyBundle: false,
      },
      plugins: [replacePlugin({ __SDK_VERSION__: pkg.version })],
    },
  ];
});
