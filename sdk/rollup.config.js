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

const getFileBuild = (inputFilename) => [
  {
    input: `./src/${inputFilename}.ts`,
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
  {
    input: `./dist/types/${inputFilename}.d.ts`,
    output: {
      file: `./dist/${inputFilename}.d.ts`,
      format: 'es',
    },
    plugins: [
      dts({
        respectExternal: true,
      }),
    ],
  },
];

export default [
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
    },
    plugins: [
      typescript(),
      nodeResolve({
        resolveOnly: getPackages(),
      }),
      commonJs(),
      json(),
    ],
  },
  // Export ES Modules
  ...getFileBuild('index'),
  ...getFileBuild('base'),
  ...getFileBuild('imx'),
  ...getFileBuild('provider'),
  ...getFileBuild('passport'),
  ...getFileBuild('checkout_sdk'),
  ...getFileBuild('checkout_widgets'),
];
