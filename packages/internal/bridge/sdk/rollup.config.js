import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import swc from 'unplugin-swc'

const isProduction = process.env.NODE_ENV === 'production';

export default [{
    input: './src/index.ts',
    output: {
      file: 'dist/index.js',
    },
    plugins: [
      json(),
      commonjs(),
      nodeResolve({ exportConditions: ["default"] }),
      isProduction ? typescript({customConditions: ["default"]}) : swc.rollup()
    ],
  },
  {
    input: './src/index.ts',
    output: {
      file: 'dist/index.browser.js',
    },
    plugins: [
      json(),
      commonjs(),
      nodeResolve({ browser: true, exportConditions: ["default"] }), 
      isProduction ? typescript({customConditions: ["default"]}) : swc.rollup()
    ],
  }
];
