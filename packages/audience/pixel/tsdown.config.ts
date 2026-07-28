import { resolve, dirname } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig } from 'tsdown';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8'),
);

export default defineConfig({
  entry: { imtbl: 'src/iife.ts' },
  outDir: 'dist',
  format: ['iife'],
  globalName: '__imtblPixelInternal',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  treeshake: true,
  sourcemap: false,
  clean: true,
  dts: false,
  deps: {
    alwaysBundle: ['@imtbl/audience-core', '@imtbl/metrics'],
    onlyBundle: false,
  },
  define: {
    PIXEL_VERSION_INJECTED: JSON.stringify(pkg.version),
  },
  alias: {
    '@imtbl/audience-core': resolve(__dirname, '../core/src/index.ts'),
    '@imtbl/metrics': resolve(__dirname, 'src/stubs/metrics.ts'),
  },
  outputOptions: {
    entryFileNames: '[name].js',
    codeSplitting: false,
  },
});
