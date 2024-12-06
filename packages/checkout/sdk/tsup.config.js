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
          modules: ['crypto', 'buffer', 'process']
        }),
        replace({ 
          '__SDK_VERSION__': pkg.version, 
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
          'process.env.CHECKOUT_DEV_MODE': JSON.stringify(process.env.CHECKOUT_DEV_MODE || 'false'),
          'process.env.CHECKOUT_LOCAL_MODE': JSON.stringify(process.env.CHECKOUT_LOCAL_MODE || 'false'),
          'process.versions': JSON.stringify(process.versions || {}),
        })
      ]
    },

    // Node Bundle for CommonJS and ESM
    {
      outDir: 'dist/node',
      platform: 'node',
      format: ['esm', 'cjs'],
      target: 'es2022',
      //only minify identifiers, other settings cause: Critical dependency: the request of a dependency is an expression
      minifyIdentifiers: true,
      bundle: true,
      splitting: true,
      esbuildPlugins: [
        replace({ 
          '__SDK_VERSION__': pkg.version, 
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
          'process.env.CHECKOUT_DEV_MODE': JSON.stringify(process.env.CHECKOUT_DEV_MODE || 'false'),
          'process.env.CHECKOUT_LOCAL_MODE': JSON.stringify(process.env.CHECKOUT_LOCAL_MODE || 'false'),
          'process.versions': JSON.stringify(process.versions || {}),
        })
      ]
    },
  ]
})