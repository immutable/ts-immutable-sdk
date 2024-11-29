// @ts-check
import { defineConfig } from 'tsup'
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  outDir: 'dist',
  outExtension: () => ({js: '.browser.js'}),
  platform: 'browser',
  format: 'esm',
  bundle: true,
  clean: true,
  splitting: false,
  minify: !options.watch,
  skipNodeModulesBundle: !!options.watch,
  noExternal: !options.watch ? [/.*/] : [],
  esbuildPlugins: [
    nodeModulesPolyfillPlugin(),
    replace({ 
      '__SDK_VERSION__': pkg.version, 
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    })
  ]
}))