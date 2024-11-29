// @ts-check
import { defineConfig } from 'tsup'
import { replace } from 'esbuild-plugin-replace';
import pkg from './sdk/package.json' assert { type: 'json' };
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';

export default defineConfig(() => ({
  entry: ['src/index.ts'],
  outExtension: () => ({ js: '.browser.js' }),
  outDir: 'dist',
  format: 'esm',
  platform: 'browser',
  bundle: true,
  skipNodeModulesBundle: false,
  minify: false,
  noExternal: [/.*/],
  esbuildPlugins: [
    nodeModulesPolyfillPlugin({
      globals: {
        Buffer: true,
        process: true,
      },
      modules: ['crypto', 'buffer', 'process']
    }),
    replace({ 
      '__SDK_VERSION__': pkg.version, 
    })
  ]
}))