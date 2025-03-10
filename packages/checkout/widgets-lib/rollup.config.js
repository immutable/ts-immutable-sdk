import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import swc from 'unplugin-swc'

const PRODUCTION = 'production';

const isProduction = process.env.NODE_ENV === PRODUCTION

/**
 * @type {import('rollup').RollupOptions}
 */
export default 
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
      ...(isProduction ? [
        resolve({
          browser: true,
          dedupe: ['react', 'react-dom'],
          exportConditions: ['default', 'browser'],
        })
      ] : []),
      nodePolyfills(),
      json(),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || PRODUCTION),
      }),
      commonjs(),
    ],
  }
