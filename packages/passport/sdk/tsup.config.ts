import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: ['es2022'],
  external: ['axios'],
  splitting: true,
  treeshake: true,
  silent: true,
  bundle: true,
});
