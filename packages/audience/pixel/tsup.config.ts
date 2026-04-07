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
  outExtension: () => ({ js: '.js' }),
  esbuildOptions(options) {
    options.outbase = 'src';
    options.entryNames = 'imtbl';
  },
});
