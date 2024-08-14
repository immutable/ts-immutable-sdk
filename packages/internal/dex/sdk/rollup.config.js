import typescript from '@rollup/plugin-typescript';
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
    isProduction ? 
    typescript({
      customConditions: ["default"],
      exclude: ['**/ABIs/*', '**/*.test.*', '**/utils/testUtils.ts'],
    }) :
    swc.rollup({ exclude: ['**/ABIs/*', '**/*.test.*', '**/utils/testUtils.ts'] }),
  ],
};
