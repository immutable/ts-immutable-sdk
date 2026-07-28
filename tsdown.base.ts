/**
 * Shared tsdown presets for SDK packages that emit browser ESM + node ESM/CJS.
 * Each package should have a local tsdown.config that re-exports or wraps
 * these helpers so dependency externalization and output extensions resolve
 * against that package's package.json (not the monorepo root).
 */
import { defineConfig, type UserConfig, type UserConfigFn } from 'tsdown';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import sdkPkg from './sdk/package.json' with { type: 'json' };

export function replacePlugin(values: Record<string, string>) {
  return replace({
    preventAssignment: true,
    delimiters: ['', ''],
    values,
  });
}

export type BrowserNodeConfigOptions = {
  entry?: UserConfig['entry'];
  alwaysBundle?: string[];
  sdkVersion?: string;
};

export function createBrowserNodeConfig(
  opts: BrowserNodeConfigOptions = {},
): UserConfigFn {
  const {
    entry = 'src/index.ts',
    alwaysBundle = [],
    sdkVersion = sdkPkg.version,
  } = opts;

  const version = sdkVersion === '0.0.0' ? '2.0.0' : sdkVersion;

  return defineConfig((options) => {
    if (options.watch) {
      return {
        entry,
        outDir: 'dist/browser',
        format: 'esm',
        target: 'es2022',
        platform: 'browser',
        dts: false,
        deps: {
          alwaysBundle,
          onlyBundle: false,
        },
        plugins: [
          // Rollup plugin types are not fully compatible with Rolldown's Plugin type
          nodePolyfills() as never,
          replacePlugin({ __SDK_VERSION__: version }),
        ],
      };
    }

    return [
      {
        entry,
        outDir: 'dist/browser',
        platform: 'browser',
        format: 'esm',
        target: 'es2022',
        minify: true,
        treeshake: true,
        dts: false,
        hash: false,
        deps: {
          alwaysBundle,
          onlyBundle: false,
        },
        plugins: [
          nodePolyfills() as never,
          replacePlugin({ __SDK_VERSION__: sdkVersion }),
        ],
      },
      {
        entry,
        outDir: 'dist/node',
        platform: 'node',
        format: ['esm', 'cjs'],
        target: 'es2022',
        minify: true,
        treeshake: true,
        dts: false,
        // Separate outDir from browser build, so cleaning is safe.
        clean: true,
        // Keep ESM as .js (package exports expect index.js, not index.mjs)
        fixedExtension: false,
        hash: false,
        deps: {
          alwaysBundle,
          onlyBundle: false,
        },
        plugins: [replacePlugin({ __SDK_VERSION__: sdkVersion })],
      },
    ];
  });
}

export default createBrowserNodeConfig();
