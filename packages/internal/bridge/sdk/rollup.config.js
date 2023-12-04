import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
// import replace from '@rollup/plugin-replace';
// import path from 'path';
// import { fileURLToPath } from 'url';

// export const __filename = fileURLToPath(import.meta.url);

export default {
  input: './src/index.ts',
  output: {
    dir: 'dist',
  },
  plugins: [
    json(),
    commonjs(),
    nodeResolve(),
    typescript({
      exclude: [],
    }),
    // replace({
    //   preventAssignment: true,
    //   '__dirname': path.dirname(zxy),
    // }),
  ],
};
