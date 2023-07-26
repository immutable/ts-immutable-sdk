import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    typescript(),
    json(),
    resolve({ browser: true, preferBuiltins: true }),
  ],
};
