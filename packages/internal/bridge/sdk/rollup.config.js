import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default [{
    input: './src/index.ts',
    output: {
      file: 'dist/index.js',
    },
    plugins: [
      json(),
      commonjs(),
      nodeResolve(),
      typescript({ paths: {}}),
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
      nodeResolve({ browser: true }), 
      typescript({ paths: {}}),
    ],
  }
];
