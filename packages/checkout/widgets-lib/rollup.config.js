// @ts-check
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { minify } from 'rollup-plugin-esbuild'

const getPlugins = () => {
  return [
    json(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': "'production'",
    }),
    typescript({customConditions: ["default"], declaration: false, outDir: 'dist/browser'}),
    resolve({
      browser: true,
      dedupe: ['react', 'react-dom'],
      exportConditions: ['default']
    }),
    nodePolyfills(),
    commonjs(),
    minify()
  ];
}

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist/browser',
      format: 'es',
    },
    plugins: [
      ...getPlugins(),
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/browser/index.cdn.js',
      format: 'umd',
      name: 'ImmutableCheckoutWidgets',
      inlineDynamicImports: true
    },
    context: 'window',
    plugins: [
      ...getPlugins(),
    ]
  }
]