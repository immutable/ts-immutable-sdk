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
]

export default [
  {
    watch: true,
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es'
    },
    plugins: [
      typescript()
    ],
  },
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
      typescript({
        declaration: false,
        declarationMap: false,
      }),
      ...defaultPlugin,
      terser(),
      visualizer({
        filename: './visualizer/bundle-stats.html',
      }),
    ],
  },
]