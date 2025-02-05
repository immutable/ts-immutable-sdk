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
      esbuildPlugins: [nodeModulesPolyfillPlugin({ modules: ['url']})]
    }
  }
  
  return [
    // Browser Bundle for ESM
    // {
    //   outDir: 'dist/browser',
    //   platform: 'browser',
    //   format: 'esm',
    //   target: 'es2022',
    //   minify: false,
    //   bundle: true,
    //   treeshake: true,
    //   noExternal: [/^(?!(react|react-dom)$).*/],
    //   esbuildPlugins: [
    //     nodeModulesPolyfillPlugin({
    //       modules: ['crypto', 'buffer', 'process', 'url', 'fs', 'path']
    //     }),
    //     replace({ 
    //       '__SDK_VERSION__': pkg.version, 
    //     })
    //   ]
    // },
  ]
})
