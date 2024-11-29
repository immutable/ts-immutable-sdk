// @ts-check
import { defineConfig } from 'tsup'
import { renameSync } from 'fs';

export default defineConfig(() => ({
  entry: ['src', '!src/index.ts', '!src/minting_backend.ts', '!src/webhook.ts'],  
  outExtension: () => ({ js: '.browser.js' }),
  onSuccess: async () => renameSync('./dist/index.browser.browser.js', './dist/index.browser.js'),
  outDir: 'dist',
  platform: 'browser',
  format: 'esm',
  bundle: true,
  splitting: false,
  skipNodeModulesBundle: false,
  minify: false,
  noExternal: [/.*/]
}))