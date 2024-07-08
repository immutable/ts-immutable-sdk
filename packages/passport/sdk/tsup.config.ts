import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: ['es2022'],
  external: ['axios'],
  silent: true,
  bundle: true,
});
