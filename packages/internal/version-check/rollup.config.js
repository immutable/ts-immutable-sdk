import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import {readFileSync} from 'fs';

const pkg = JSON.parse(readFileSync(new URL('../../../sdk/package.json', import.meta.url), 'utf8'));

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
  plugins: [
    json(),
    typescript(),
    replace({
      exclude: 'node_modules/**',
      preventAssignment: true,
      __SDK_VERSION__: pkg.version,
    }),
  ],
};
