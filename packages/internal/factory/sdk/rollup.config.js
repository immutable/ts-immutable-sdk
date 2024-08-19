import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import swc from 'unplugin-swc'

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: './src/index.ts',
  output: {
    dir: 'dist',
  },
  plugins: [
    json(),
    commonjs(),
    nodeResolve({ exportConditions: ["default"] }),
    isProduction ? typescript({customConditions: ["default"]}) : swc.rollup()
  ],
};
