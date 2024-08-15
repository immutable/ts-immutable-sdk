import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import swc from 'unplugin-swc'

const isProduction = process.env.NODE_ENV === 'production';

const commonPlugins = [
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.CHECKOUT_DEV_MODE': JSON.stringify(process.env.CHECKOUT_DEV_MODE || 'false'),
    'process.env.CHECKOUT_LOCAL_MODE': JSON.stringify(process.env.CHECKOUT_LOCAL_MODE || 'false'),
    'process.versions': JSON.stringify(process.versions || {}),
  }),
  isProduction ? typescript({customConditions: ["default"]}) : swc.rollup()
]

export default [
  {
    watch: true,
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es'
    },
    plugins: [ ...commonPlugins ]
  },
  {
    watch: false,
    input: 'src/index.ts',
    output: {
      file: 'dist/browser.js',
      format: 'umd',
      name: 'ImmutableCheckout'
    },
    context: 'window',
    plugins: [
      json(),
      nodeResolve({ browser: true, exportConditions: ['browser'] }),
      commonjs(),
      nodePolyfills(),
      terser(),
      ...commonPlugins,
    ],
  }
]
