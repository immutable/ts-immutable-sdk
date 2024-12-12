// @ts-check
import { defineConfig } from 'tsup'
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
import { replace } from 'esbuild-plugin-replace';
import pkg from './sdk/package.json' assert { type: 'json' };

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
      noExternal: ['@uniswap/swap-router-contracts'],
      treeshake: true,
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
    },

    // Node Bundle for CommonJS and ESM
    {
      outDir: 'dist/node',
      platform: 'node',
      format: ['esm', 'cjs'],
      target: 'es2022',
      minify: true,
      bundle: true,
      noExternal: ['@uniswap/swap-router-contracts'],
      treeshake: true,
      esbuildPlugins: [
        replace({ 
          '__SDK_VERSION__': pkg.version, 
        })
      ]
    },
  ]
})