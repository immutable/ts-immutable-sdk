import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
// import copy from 'rollup-plugin-copy';

import pkg from './package.json' assert { type: 'json' };
// import tsConfig from './tsconfig.json' assert { type: 'json' };

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      // file: pkg.module,
      format: 'es',
      // sourcemap: true,
      // sourcemapFile: pkg.module + '.map',
    },
    {
      dir: 'dist',
      // file: pkg.main,
      format: 'cjs',
      // sourcemap: true,
      // sourcemapFile: pkg.main + '.map',
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    url(),
    json(),
    nodeResolve(),
    commonjs(),
    typescript(),
    babel({
      babelHelpers: 'runtime',
    }),
    terser(),
    // copy({
    //   targets: [
    //     {
    //       src: 'src/contracts/stark/Stark.d.ts',
    //       dest: 'dist/src/contracts/stark',
    //     },
    //     {
    //       src: 'src/contracts/immutablex/ImmutableX.d.ts',
    //       dest: 'dist/src/contracts/immutablex',
    //     },
    //     {
    //       src: 'src/contracts/registration/*.d.ts',
    //       dest: 'dist/src/contracts/registration',
    //     },
    //   ],
    // }),
  ],
};
