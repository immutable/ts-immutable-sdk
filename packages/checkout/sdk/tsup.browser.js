// @ts-check
import { defineConfig } from 'tsup'
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig(() => ({
  entry: ['src/index.ts'],
  outExtension: () => ({ js: '.browser.js' }),
  outDir: 'dist',
  platform: 'browser',
  format: 'esm',
  target: 'es2022',
  bundle: true,
  skipNodeModulesBundle: false,
  //only minify identifiers, other settings cause: Critical dependency: the request of a dependency is an expression
  minifyIdentifiers: true,
  noExternal: [/.*/],
  esbuildPlugins: [
    replace({ 
      '__SDK_VERSION__': pkg.version, 
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.CHECKOUT_DEV_MODE': JSON.stringify(process.env.CHECKOUT_DEV_MODE || 'false'),
      'process.env.CHECKOUT_LOCAL_MODE': JSON.stringify(process.env.CHECKOUT_LOCAL_MODE || 'false'),
      'process.versions': JSON.stringify(process.versions || {}),
    })
  ]
}))