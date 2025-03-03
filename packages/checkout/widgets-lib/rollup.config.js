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
]

const productionPlugins = [
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
  // browser bundle
  {
    input: 'src/index.ts',
    treeshake: 'smallest',
    output: {
      dir: 'dist/browser',
      format: 'es',
      inlineDynamicImports: !isProduction,
    },
    plugins: [
       isProduction ? typescript({customConditions: ["default"], declaration: false, outDir: 'dist/browser'}) 
         : swc.rollup({ jsc: { 
         transform: { react: { development: true, runtime: 'automatic' }},
       } }),
      resolve({
        browser: true,
        dedupe: ['react', 'react-dom'],
        exportConditions: ['default', 'browser'],
      }),
      nodePolyfills(),
      ...getPlugins(),
    ],
  },
  // node esm bundle
  {
    input: 'src/index.ts',
    treeshake: 'smallest',
    output: {
      dir: 'dist/node',
      format: 'es',
      inlineDynamicImports: !isProduction,
    },
    plugins: [
      isProduction ? typescript({customConditions: ["default"], declaration: false, outDir: 'dist/node'}) 
        : swc.rollup({ jsc: { 
        transform: { react: { development: true, runtime: 'automatic' }},
      } }),
      resolve({
        dedupe: ['react', 'react-dom'],
        exportConditions: ['default', 'node']
      }),
      ...getPlugins(),
    ]
  },
  // node cjs bundle
  {
    input: 'src/index.ts',
    treeshake: 'smallest',
    output: {
      dir: 'dist/node',
      format: 'cjs',
      inlineDynamicImports: !isProduction,
    },
    plugins: [
      isProduction ? typescript({customConditions: ["default"], declaration: false, outDir: 'dist/node'}) 
        : swc.rollup({ jsc: { 
        transform: { react: { development: true, runtime: 'automatic' }},
      } }),
      resolve({
        dedupe: ['react', 'react-dom'],
        exportConditions: ['default', 'node']
      }),
      ...getPlugins(),
    ]
  }
]