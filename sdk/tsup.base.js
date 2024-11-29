// @ts-check
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src', '!src/index.browser.ts'],
  outDir: 'dist',
  format: !options.watch ? ['esm', 'cjs'] : 'esm',
  target: 'es2022',
  bundle: true,
  clean: !options.watch,
  minify: !options.watch,
  skipNodeModulesBundle: true,
}));
