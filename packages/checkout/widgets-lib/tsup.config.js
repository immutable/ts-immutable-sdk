// @ts-check
import { defineConfig } from 'tsup'
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig((options) => {
  if (options.watch) {
    // Watch mode
    return {
      outDir: 'dist',
      format: 'esm',
      target: 'es2022',
      platform: 'browser',
      bundle: true,
    }
  }
  
  return [
    // Browser Bundle for ESM
    {
      outDir: 'dist/browser',
      platform: 'browser',
      format: 'esm',
      target: 'es2022',
      minify: true,
      bundle: true,
      treeshake: true,
      esbuildPlugins: [
        nodeModulesPolyfillPlugin({
          globals: {
            Buffer: true,
            process: true,
          },
          modules: ['crypto', 'buffer', 'process', 'url', 'fs', 'path']
        }),
        replace({ 
          '__SDK_VERSION__': pkg.version, 
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
        })
      ]
    },

    // Browser Bundle for CDN
    {
      outDir: 'dist/browser',
      outExtension: () => ({ js: '.cdn.js' }),
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
          modules: ['crypto', 'buffer', 'process', 'url', 'fs', 'path']
        }),
        replace({ 
          '__SDK_VERSION__': pkg.version, 
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
        })
      ]
    },

    // Node Bundle for CommonJS and ESM
    {
      outDir: 'dist/node',
      platform: 'node',
      format: ['esm', 'cjs'],
      target: 'es2022',
      minify: true,
      bundle: true,
      splitting: true,
      esbuildPlugins: [
        replace({ 
          '__SDK_VERSION__': pkg.version, 
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
        })
      ]
    },
  ]
})