// @ts-check
import { defineConfig } from 'tsup'
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: !options.watch ? ['esm', 'cjs'] : 'esm',
  target: 'es2022',
  bundle: true,
  clean: !options.watch,
  splitting: false,  
  //only minify identifiers, other settings cause: Critical dependency: the request of a dependency is an expression
  minifyIdentifiers: !options.watch,
  skipNodeModulesBundle: true,
  esbuildPlugins: [
    replace({ 
      '__SDK_VERSION__': pkg.version, 
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.CHECKOUT_DEV_MODE': JSON.stringify(process.env.CHECKOUT_DEV_MODE || 'false'),
      'process.env.CHECKOUT_LOCAL_MODE': JSON.stringify(process.env.CHECKOUT_LOCAL_MODE || 'false'),
      'process.versions': JSON.stringify(process.versions || {}),
    })
  ]
}));