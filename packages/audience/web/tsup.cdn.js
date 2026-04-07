// @ts-check
import { defineConfig } from 'tsup';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };

/**
 * Audience web SDK CDN bundle — self-contained IIFE exposing window.ImmutableWebSDK.
 * All dependencies (including @imtbl/audience-core) are inlined.
 *
 * Output: dist/cdn/imtbl-web.global.js
 */
export default defineConfig({
  entry: { 'imtbl-web': 'src/cdn.ts' },
  outDir: 'dist/cdn',
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  bundle: true,
  treeshake: true,
  noExternal: [/.*/],
  esbuildPlugins: [
    replace({
      '__SDK_VERSION__': pkg.version === '0.0.0' ? '0.1.0' : pkg.version,
    }),
  ],
});
