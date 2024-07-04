import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.*'],
  outDir: 'dist',
  format: ['esm'],
  target: 'es2022',
  external: ['axios'],
  splitting: false,
  treeshake: false,
});
