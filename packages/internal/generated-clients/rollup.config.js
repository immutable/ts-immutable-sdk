import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
  },
  plugins: [
    typescript({ module: 'CommonJS' }),
    commonjs({ extensions: ['.js', '.ts'] }),
  ],
};
