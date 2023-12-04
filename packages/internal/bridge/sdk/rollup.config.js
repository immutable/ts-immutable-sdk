import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.ts',
  output: {
    dir: 'dist',
    banner: `import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);`,
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
