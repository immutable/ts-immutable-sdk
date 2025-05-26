// @ts-check
import { defineConfig } from 'tsup'
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };


export default defineConfig((options) => {
  if (options.watch) {
    // Watch mode
    return {
      entry: ['src'],
      outDir: 'dist',
      format: 'esm',
      target: 'es2022',
      platform: 'browser',
      bundle: false,
    }
  }
  
  return [
    // Node & Browser Bundle for ESM
    {
      entry: ['src'],
      outDir: 'dist',
      format: 'esm',
      target: 'es2022',
      bundle: true,
      treeshake: true,
      splitting: false,
    },

    // Node Bundle for CJS
    {
      entry: ['src', '!src/index.browser.ts'],
      outDir: 'dist',
      platform: 'node',
      format: 'cjs',
      target: 'es2022',
      bundle: true,
      treeshake: true,
    },

    // Browser Bundle for CDN
    {
      entry: ['src/index.browser.ts'],  
      outExtension: () => ({ js: '.cdn.js' }),
      outDir: 'dist',
      platform: 'browser',
      format: 'iife',
      target: 'es2022',
      globalName: 'immutable',
      bundle: true,
      minify: true,
      splitting: false,
      skipNodeModulesBundle: false,
      noExternal: [/.*/],
      esbuildPlugins: [
        nodeModulesPolyfillPlugin({
          globals: {
            Buffer: true,
            process: true,
          },
          modules: ['crypto', 'buffer', 'process', 'path', 'fs']
        }),
        replace({ 
          '__SDK_VERSION__': pkg.version, 
        })
      ]
    }
  ]
})