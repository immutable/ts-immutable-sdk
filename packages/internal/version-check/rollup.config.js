import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import pkg from '../../../sdk/package.json' assert { type: 'json' };

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    typescript(),
    replace({
      exclude: 'node_modules/**',
      preventAssignment: true,
      __SDK_VERSION__: pkg.version,
    }),
  ],
};
