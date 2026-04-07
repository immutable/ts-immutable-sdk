import { resolve } from 'path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['iife'],
  globalName: '__imtblPixelInternal',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  treeshake: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  noExternal: ['@imtbl/audience-core', '@imtbl/metrics'],
  outExtension: () => ({ js: '.js' }),
  esbuildOptions(options) {
    options.outbase = 'src';
    options.entryNames = 'imtbl';
    // Resolve @imtbl/audience-core from source so the pixel bundles
    // a tree-shaken copy — no runtime dependency on the core package.
    // @imtbl/metrics is stubbed out — the pixel is a self-contained
    // snippet and doesn't need internal telemetry.
    options.alias = {
      '@imtbl/audience-core': resolve(__dirname, '../core/src/index.ts'),
      '@imtbl/metrics': resolve(__dirname, 'src/stubs/metrics.ts'),
    };
  },
});
