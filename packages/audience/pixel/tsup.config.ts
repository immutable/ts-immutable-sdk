import { resolve } from 'path';
import { readFileSync } from 'fs';
import { defineConfig } from 'tsup';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
  entry: ['src/iife.ts'],
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
  define: {
    PIXEL_VERSION_INJECTED: JSON.stringify(pkg.version),
  },
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
