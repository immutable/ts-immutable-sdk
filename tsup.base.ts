import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm', 'cjs'],
  target: 'es2022',
  bundle: true,
  clean: true,
  splitting: false,
  skipNodeModulesBundle: true,
});
