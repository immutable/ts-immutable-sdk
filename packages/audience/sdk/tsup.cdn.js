// @ts-check
import { defineConfig } from 'tsup';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };

/**
 * CDN bundle config for @imtbl/audience.
 *
 * Produces a single-file IIFE at dist/cdn/imtbl-audience.global.js that
 * studios load via <script>. Bundles audience-core directly (no runtime
 * dependency resolution), attaches globals via the src/cdn.ts side-effect
 * entry point, and minifies for size.
 *
 * Runs alongside the main ESM build configured in the monorepo root
 * tsup.config.js — they share the dist/ directory so `clean: false`
 * is required to avoid wiping the ESM output.
 *
 * The esbuild replace plugin substitutes '__SDK_VERSION__' with the
 * actual package version at build time. Both @imtbl/audience and
 * @imtbl/audience-core use '__SDK_VERSION__' as a placeholder in their
 * source (config.ts / context.ts) so the real version gets stamped
 * into context.libraryVersion on every message. Without this replacement
 * the CDN bundle ships the literal placeholder and the backend 400s.
 */
export default defineConfig({
  entry: { 'imtbl-audience': 'src/cdn.ts' },
  format: ['iife'],
  outDir: 'dist/cdn',
  outExtension: () => ({ js: '.global.js' }),
  minify: true,
  sourcemap: true,
  clean: false,
  target: 'es2018',
  platform: 'browser',
  dts: false,
  noExternal: [/.*/],
  esbuildPlugins: [
    replace({
      __SDK_VERSION__: pkg.version === '0.0.0' ? '0.0.0-local' : pkg.version,
    }),
  ],
});
