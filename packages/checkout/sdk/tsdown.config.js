// @ts-check
import { defineConfig } from 'tsdown';
import { replacePlugin } from '../../../tsdown.base.ts';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import pkg from './package.json' with { type: 'json' };

const replacements = {
  __SDK_VERSION__: pkg.version,
  'process.env.CHECKOUT_DEV_MODE': JSON.stringify(
    process.env.CHECKOUT_DEV_MODE || 'false',
  ),
  'process.env.CHECKOUT_LOCAL_MODE': JSON.stringify(
    process.env.CHECKOUT_LOCAL_MODE || 'false',
  ),
  'process.versions': JSON.stringify(process.versions || {}),
};

export default defineConfig((options) => {
  if (options.watch) {
    return {
      entry: 'src/index.ts',
      outDir: 'dist/browser',
      format: 'esm',
      target: 'es2022',
      platform: 'browser',
      dts: false,
      deps: { onlyBundle: false },
      plugins: [
        // @ts-expect-error rollup plugin types
        nodePolyfills(),
        replacePlugin(replacements),
      ],
    };
  }

  return [
    {
      entry: 'src/index.ts',
      outDir: 'dist/browser',
      platform: 'browser',
      format: 'esm',
      target: 'es2022',
      // Keep minify off: rolldown mangle strips /* webpackIgnore: true */ and inlines
      // the CDN URL into import(), which breaks webpack/Vite consumers of widgets().
      minify: false,
      dts: false,
      deps: { onlyBundle: false },
      plugins: [
        // @ts-expect-error rollup plugin types
        nodePolyfills(),
        replacePlugin(replacements),
      ],
    },
    {
      entry: 'src/index.ts',
      outDir: 'dist/node',
      platform: 'node',
      fixedExtension: false,
      format: ['esm', 'cjs'],
      target: 'es2022',
      minify: false,
      dts: false,
      clean: true,
      deps: { onlyBundle: false },
      plugins: [replacePlugin(replacements)],
    },
  ];
});
