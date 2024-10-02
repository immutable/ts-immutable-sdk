// @ts-check
import { defineConfig } from 'tsup'
import { replace } from 'esbuild-plugin-replace';
import pkg from './package.json' assert { type: 'json' };
import { nodeModulesPolyfillPlugin } from 'esbuild-plugins-node-modules-polyfill';

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: !options.watch ? ['esm', 'cjs'] : 'esm',
  platform: 'browser',
  target: 'es2022',
  bundle: true,
  clean: true,
  minify: !options.watch,
  splitting: false,
  skipNodeModulesBundle: !!options.watch,
  noExternal: !options.watch ? [/.*/] : [],
  esbuildPlugins: [
    nodeModulesPolyfillPlugin(),
    replace({ 
      '__SDK_VERSION__': pkg.version, 
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    })
  ]
}))