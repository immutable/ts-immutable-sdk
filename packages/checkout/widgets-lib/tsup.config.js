// @ts-check
import { defineConfig } from 'tsup'
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig((options) => {
  if (options.watch) {
    // Watch mode
    return {
      outDir: 'dist/browser',
      format: 'esm',
      target: 'es2022',
      platform: 'browser',
      bundle: true,
      esbuildPlugins: [
        nodeModulesPolyfillPlugin({
          modules: ['url']
        }),
      ]
    }
  }
  
  return [
    // Browser Bundle for ESM
    {
      outDir: 'dist/browser',
      platform: 'browser',
      format: 'esm',
      target: 'es2022',
      minify: false,
      bundle: true,
      external: [/^react(-dom)?$/, /^@imtbl\//, /^@protobufjs\//, /^es-errors$/, /^get-intrinsic$/],
      splitting: true,
      treeshake: true,
      esbuildPlugins: [
        nodeModulesPolyfillPlugin({
          globals: {
            process: true,
          },
          modules: ['crypto', 'process', 'url', 'fs', 'path']
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