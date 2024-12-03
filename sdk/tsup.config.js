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
    // Node Bundle for CommonJS and ESM
    {
      entry: ['src', '!src/index.browser.ts'],
      outDir: 'dist',
      platform: 'node',
      format: ['esm', 'cjs'],
      target: 'es2022',
      bundle: false,
      minify: false,
      esbuildPlugins: [
        replace({ 
          '__SDK_VERSION__': pkg.version, 
        })
      ]
    },

    // Browser Bundle for ESM
    {
      entry: ['src/index.browser.ts'],
      outDir: 'dist',
      platform: 'browser',
      format: 'esm',
      target: 'es2022',
      bundle: false,
      minify: false,
      esbuildPlugins: [
        nodeModulesPolyfillPlugin({
          globals: {
            Buffer: true,
            process: true,
          },
          modules: ['crypto', 'buffer', 'process', 'http']
        }),
        replace({ 
          '__SDK_VERSION__': pkg.version, 
        })
      ]
    },

    // Browser Bundle for CDN
    {
      entry: ['src/index.browser.ts'],  
      outExtension: () => ({ js: '.cdn.js' }),
      outDir: 'dist',
      platform: 'browser',
      format: 'esm',
      target: 'es2022',
      bundle: true,
      splitting: false,
      skipNodeModulesBundle: false,
      minify: true,
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
    }
  ]
})