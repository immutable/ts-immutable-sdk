import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import terser from '@rollup/plugin-terser';

const PRODUCTION = 'production';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/browser/index.cdn.js',
    format: 'umd',
    name: 'ImmutableCheckoutWidgets',
    inlineDynamicImports: true
  },
  context: 'window',
  plugins: [
    json(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || PRODUCTION),
    }),
    typescript({customConditions: ["default"], declaration: false}),
    resolve({
      browser: true,
      dedupe: ['react', 'react-dom'],
      exportConditions: ['default']
    }),
    nodePolyfills(),
    commonjs(),
    terser()
  ]
}
