import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import swc from 'unplugin-swc'

const DEVELOPMENT = 'development';
const PRODUCTION = 'production';

const isProduction = process.env.NODE_ENV === PRODUCTION

const defaultPlugins = [
  json(),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || PRODUCTION),
  }),
  isProduction ? typescript({customConditions: ["default"]}) : swc.rollup({ jsc: { 
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
  if (process.env.NODE_ENV === DEVELOPMENT) {
    return defaultPlugins;
  }

  return [
    ...defaultPlugins,
    ...productionPlugins
  ];
}

const isDevelopment = () => process.env.NODE_ENV === DEVELOPMENT;

export default [
  {
    watch: isDevelopment(),
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
      inlineDynamicImports: isDevelopment()
    },
    plugins: [
      ...getPlugins(),
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
      ...getPlugins(),
    ]
  }
]
