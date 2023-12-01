import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { visualizer } from "rollup-plugin-visualizer";

const defaultPlugin = [
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.CHECKOUT_X_WALLET_BRIDGE': JSON.stringify(process.env.CHECKOUT_X_WALLET_BRIDGE || 'false'),
  }),
  typescript({
    declaration: false,
    declarationMap: false,
  })
]

export default [
  {
    watch: true,
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
    },
    plugins: [
      resolve({
        browser: true,
        dedupe: ['react', 'react-dom'],
      }),
      nodePolyfills({
        include: ['assert', 'events', 'buffer', 'crypto', 'https', 'os', 'stream'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
      commonjs(),
      json(),
      ...defaultPlugin,
      terser(),
      visualizer({
        filename: './visualizer/bundle-stats.html',
        open: true,
      }),
    ],
  },
  // {
  //   watch: false,
  //   input: 'src/index.ts',
  //   output: {
  //     file: 'dist/widgets.js',
  //     format: 'umd',
  //     name: 'ImmutableCheckoutWidgets',
  //     inlineDynamicImports: true
  //   },
  //   context: 'window',
  //   plugins: [
  //     resolve({
  //       browser: true,
  //       dedupe: ['react', 'react-dom'],
  //     }),
  //     nodePolyfills(),
  //     commonjs(),
  //     json(),
  //     ...defaultPlugin,
  //     terser(),
  //   ]
  // }
]