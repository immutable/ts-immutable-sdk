import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: ['es2022'],
  external: ['axios'],
  splitting: false,
  treeshake: false,
});
