// @ts-check
import { defineConfig } from 'tsup';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' with { type: 'json' };

// IIFE bundle of @imtbl/audience for <script>-tag loading. Runs after the
// ESM/CJS build in tsup.config.js — `clean: false` preserves that output.
export default defineConfig({
  entry: { 'imtbl-audience': 'src/cdn.ts' },
  format: ['iife'],
  outDir: 'dist/cdn',
  outExtension: () => ({ js: '.global.js' }),
  minify: true,
  clean: false,
  target: 'es2018',
  platform: 'browser',
  dts: false,
  treeshake: true,
  // IIFE has no runtime module resolution — inline everything, including npm deps.
  noExternal: [/.*/],
  esbuildPlugins: [
    replace({ __SDK_VERSION__: pkg.version === '0.0.0' ? '0.0.0-local' : pkg.version }),
  ],
});
