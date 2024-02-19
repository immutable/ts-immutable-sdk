import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const defaultPlugin = [
  resolve({
    browser: true,
    dedupe: ['react', 'react-dom'],
  }),
  nodePolyfills(),
  commonjs(),
  json(),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  }),
  typescript(),
  terser()
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
      ...defaultPlugin,
    ]
  },
  {
    watch: false,
    input: 'src/index.ts',
    output: {
      file: 'dist/widgets.js',
      format: 'umd',
      name: 'ImmutableCheckoutWidgets',
      inlineDynamicImports: true
    },
    context: 'window',
    plugins: [
      ...defaultPlugin,,
    ]
  }
]
