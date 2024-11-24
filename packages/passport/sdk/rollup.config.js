import typescript from '@rollup/plugin-typescript';
import swc from 'unplugin-swc'

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [isProduction ? typescript({customConditions: ["default"]}) : swc.rollup()],
};
