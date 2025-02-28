// @ts-check
import { defineConfig } from 'tsup'
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };
import { renameSync } from 'fs';

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
    // Browser Bundle for ESM
    {
      entry: ['src/index.ts'],
      outDir: 'dist/browser',
      platform: 'browser',
      format: 'esm',
      target: 'es2022',
      //only minify identifiers, other settings cause: Critical dependency: the request of a dependency is an expression
      minifyIdentifiers: true,
      bundle: true,
      splitting: true,
      esbuildPlugins: [
        nodeModulesPolyfillPlugin({
          globals: {
            Buffer: true,
            process: true,
          },
          modules: ['crypto', 'buffer', 'process', 'fs', 'path', 'url']
        }),
        replace({ 
          '__SDK_VERSION__': pkg.version, 
        })
      ]
    },
    // Browser Bundle for CDN
    {
      entry: ['src/index.ts'],
      outExtension: () => ({ 'js': '.cdn.js' }),
      outDir: 'dist/browser',
      platform: 'browser',
      minify: true,
      format: 'esm',
      target: 'es2022',
      bundle: true,
      splitting: false,
      skipNodeModulesBundle: false,
      noExternal: [/.*/],
      esbuildPlugins: [
        nodeModulesPolyfillPlugin({
          globals: {
            Buffer: true,
            process: true,
          },
          modules: ['crypto', 'buffer', 'process', 'fs', 'path', 'url']
        }),
        replace({ 
          '__SDK_VERSION__': pkg.version, 
        })
      ]
    }
  ]
})