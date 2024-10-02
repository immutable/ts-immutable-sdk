// @ts-check
import { defineConfig } from 'tsup';
import { replace } from 'esbuild-plugin-replace';
import pkg from './sdk/package.json' assert { type: 'json' };

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: !options.watch ? ['esm', 'cjs'] : 'esm',
  target: 'es2022',
  bundle: true,
  clean: !options.watch,
  splitting: false,
  minify: !options.watch,
  skipNodeModulesBundle: true,
  esbuildPlugins: [replace({ '__SDK_VERSION__': pkg.version })]
}));
