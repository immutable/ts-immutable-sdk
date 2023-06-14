import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.ts',
  output: {
    dir: 'dist',
  },
  plugins: [
    json(),
    resolve({ browser: true }),
    typescript({
      exclude: ['**/ABIs/*', '**/*.test.*', '**/utils/testUtils.ts'],
    }),
  ],
};
