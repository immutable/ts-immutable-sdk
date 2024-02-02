import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const defaultPlugin = [
  json(),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
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
      typescript(),
      ...defaultPlugin
    ],
  },
  {
    watch: false,
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
      name: 'ImmutableCheckoutWidgets'
    },
    context: 'window',
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
      typescript({
        declaration: false,
        declarationMap: false,
      }),
      ...defaultPlugin,
      terser(),
    ],
  },
]
