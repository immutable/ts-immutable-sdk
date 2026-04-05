// @ts-check
import { defineConfig } from 'tsup';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };

/**
 * Audience web SDK CDN bundle — self-contained IIFE exposing window.ImmutableWebSDK.
 * All dependencies (including @imtbl/audience-core) are inlined.
 *
 * Output: dist/cdn/imtbl-web.js
 * Usage:  <script src="https://cdn.immutable.com/web-sdk/v1/imtbl-web.js"></script>
 *         <script>
 *           var sdk = window.ImmutableWebSDK.init({ ... });
 *           sdk.track(window.AudienceEvent.Purchase, { currency: 'USD', value: 9.99 });
 *         </script>
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
