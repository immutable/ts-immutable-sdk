import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.ts',
  output: {
    dir: 'dist',
    declarationDir: "types",
  },
  plugins: [json(), commonjs(), nodeResolve(), typescript({exclude: ["**/ABIs/*", "**/*.test.*", "**/utils/testUtils.ts"]})],
};
