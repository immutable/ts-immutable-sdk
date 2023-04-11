import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { readFileSync } from 'fs';
import commonJs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';

const packages = JSON.parse(
  readFileSync('./workspace-packages.json', { encoding: 'utf8' })
);

const getPackages = () => packages.map((pkg) => pkg.name);

export default [
  // Export ES Modules
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
    },
    plugins: [
      typescript({
        declaration: true,
        declarationDir: './dist/types',
      }),
      nodeResolve({
        resolveOnly: getPackages(),
      }),
      commonJs(),
      json(),
    ],
  },

  // Export Types
  {
    input: 'dist/types/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [
      dts({
        respectExternal: true,
      }),
    ],
  },
];
