// @ts-check
import { defineConfig } from 'tsup'
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig((options) => {
  if (options.watch) {
    // Watch mode
    return {
      outDir: 'dist',
      format: 'esm',
      target: 'es2022',
      platform: 'node',
      bundle: true,
    }
  }
  
  return [
    // Node Bundle for CommonJS and ESM
    {
      outDir: 'dist',
      platform: 'node',
      format: ['esm', 'cjs'],
      target: 'es2022',
      minify: false,
      bundle: true,
      splitting: true,
      esbuildPlugins: [
        replace({ 
          '__SDK_VERSION__': pkg.version, 
        })
      ]
    },
  ]
})