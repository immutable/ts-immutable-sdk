import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';

const defaultPlugin = [
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.CHECKOUT_DEV_MODE': JSON.stringify(process.env.CHECKOUT_DEV_MODE || 'false'),
    'process.env.CHECKOUT_LOCAL_MODE': JSON.stringify(process.env.CHECKOUT_LOCAL_MODE || 'false'),
    'process.versions': JSON.stringify(process.versions || {})
  }),
  typescript()
]

export default [
  {
    watch: true,
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es'
    },
    plugins: [ ...defaultPlugin ],
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
      resolve({
        browser: true,
        dedupe: ['react', 'react-dom'],
      }),
      json(),
      commonjs(),
      ...defaultPlugin,
      terser(),
    ]
  }
]
