// @ts-check
import { defineConfig } from 'tsdown';
import { replacePlugin } from '../tsdown.base.ts';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import pkg from './package.json' with { type: 'json' };

export default defineConfig((options) => {
  if (options.watch) {
    return {
      entry: ['src/*.ts'],
      outDir: 'dist',
      format: 'esm',
      target: 'es2022',
      platform: 'browser',
      unbundle: true,
      dts: false,
      fixedExtension: false,
      hash: false,
      deps: { onlyBundle: false },
    };
  }

  return [
    // Node & Browser Bundle for ESM
    {
      entry: ['src/*.ts'],
      outDir: 'dist',
      format: 'esm',
      target: 'es2022',
      treeshake: true,
      dts: false,
      fixedExtension: false,
      hash: false,
      deps: { onlyBundle: false },
    },

    // Node Bundle for CJS (exclude browser-only entry)
    {
      entry: ['src/*.ts', '!src/index.browser.ts'],
      outDir: 'dist',
      platform: 'node',
      fixedExtension: false,
      hash: false,
      format: 'cjs',
      target: 'es2022',
      treeshake: true,
      dts: false,
      clean: false,
      deps: { onlyBundle: false },
    },

    // Browser Bundle for CDN — single IIFE file
    {
      entry: { index: 'src/index.browser.ts' },
      outDir: 'dist',
      platform: 'browser',
      format: 'iife',
      target: 'es2022',
      globalName: 'immutable',
      minify: true,
      dts: false,
      clean: false,
      deps: {
        neverBundle: true,
        alwaysBundle: [/.*/],
        onlyBundle: false,
      },
      outputOptions: {
        entryFileNames: 'index.cdn.js',
        codeSplitting: false,
      },
      plugins: [
        // @ts-expect-error rollup plugin types
        nodePolyfills(),
        replacePlugin({ __SDK_VERSION__: pkg.version }),
      ],
    },
  ];
});
