import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.ts',
  output: {
    dir: 'dist',
  },
  plugins: [
    json(),
    typescript({
      exclude: ['**/ABIs/*', '**/*.test.*', '**/utils/testUtils.ts'],
    }),
  ],
};
