import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import swc from 'unplugin-swc'

const PRODUCTION = 'production';

const isProduction = process.env.NODE_ENV === PRODUCTION

const defaultPlugins = [
  json(),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || PRODUCTION),
  }),
  isProduction ? typescript({customConditions: ["default"], declaration: false, outDir: 'dist/browser'}) 
    : swc.rollup({ jsc: { 
      transform: { react: { development: true, runtime: 'automatic' }},
    } }),
]

const productionPlugins = [
  resolve({
    browser: true,
    dedupe: ['react', 'react-dom'],
    exportConditions: ['default']
  }),
  nodePolyfills(),
  commonjs(),

]

const getPlugins = () => {
  if (process.env.NODE_ENV !== PRODUCTION) {
    return defaultPlugins;
  }

  return [
    ...defaultPlugins,
    ...productionPlugins
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
      inlineDynamicImports: !isProduction
    },
    plugins: [
      ...getPlugins(),
    ]
  },
  ...(process.env.NODE_ENV === PRODUCTION ? [
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
  }] : []),
]