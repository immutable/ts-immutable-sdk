import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonJs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    dynamicImportFunction: 'import',
  },
  plugins: [
    typescript(),
    nodeResolve({ browser: true }),
    commonJs(),
    json(),
    nodePolyfills(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('sandbox'),
    }),
  ],
};
