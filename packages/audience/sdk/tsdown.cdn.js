// @ts-check
import { defineConfig } from 'tsdown';
import { replacePlugin } from '../../../tsdown.base.ts';
import pkg from './package.json' with { type: 'json' };

// IIFE bundle of @imtbl/audience for <script>-tag loading. Runs after the
// ESM/CJS build — `clean: false` preserves that output.
export default defineConfig({
  entry: { 'imtbl-audience': 'src/cdn.ts' },
  format: ['iife'],
  outDir: 'dist/cdn',
  minify: true,
  clean: false,
  target: 'es2018',
  platform: 'browser',
  dts: false,
  treeshake: true,
  // IIFE has no runtime module resolution — inline everything.
  deps: {
    neverBundle: true,
    alwaysBundle: [/.*/],
    onlyBundle: false,
  },
  outputOptions: {
    entryFileNames: '[name].global.js',
    codeSplitting: false,
  },
  plugins: [
    replacePlugin({
      __SDK_VERSION__: pkg.version === '0.0.0' ? '0.0.0-local' : pkg.version,
    }),
  ],
});
