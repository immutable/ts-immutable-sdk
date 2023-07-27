import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { readFileSync } from 'fs';
import commonJs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
import replace from '@rollup/plugin-replace';
import pkg from './package.json' assert { type: 'json' };
import moduleReleases from './module-release.json' assert { type: 'json' };
import terser from '@rollup/plugin-terser';
import nodePolyfills from 'rollup-plugin-polyfill-node';


// RELEASE_TYPE environment variable is set by the CI/CD pipeline
const releaseType = process.env.RELEASE_TYPE || 'alpha';

const packages = JSON.parse(
  readFileSync('./workspace-packages.json', { encoding: 'utf8' })
);

const getPackages = () => packages.map((pkg) => pkg.name);

// Get relevant files to bundle
const getFilesToBuild = () => {
  // Always build the index file
  const files = ['index'];

  const moduleFiles = Object.keys(moduleReleases.modules);
  if (releaseType === 'alpha') {
    return [...files, ...moduleFiles];
  }

  const returnModules = moduleFiles.filter(
    (file) => moduleReleases.modules[file] === 'prod'
  );
  return [...files, ...returnModules];
};

const getFileBuild = (inputFilename) => [
  {
    input: `./src/${inputFilename}.ts`,
    output: {
      dir: 'dist',
      format: 'es',
    },
    plugins: [
      nodeResolve({
        resolveOnly: getPackages(),
      }),
      commonJs(),
      json(),
      typescript({
        declaration: true,
        declarationDir: './dist/types',
      }),
      replace({
        exclude: 'node_modules/**',
        preventAssignment: true,
        __SDK_VERSION__: pkg.version,
      }),
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

const buildBundles = () => {
  const modules = [];
  const filesToBuild = getFilesToBuild();
  for (const file of filesToBuild) {
    modules.push(...getFileBuild(file));
  }
  return modules;
};

export default [
  // Main build entry
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
    },
    plugins: [
      nodeResolve({
        resolveOnly: getPackages(),
      }),
      json(),
      commonJs(),
      typescript(),
      replace({
        exclude: 'node_modules/**',
        preventAssignment: true,
        __SDK_VERSION__: pkg.version,
      }),
    ],
  },
  // Browser Bundle
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.browser.js',
      format: 'umd',
      sourcemap: true,
      name: 'immutable',
    },
    plugins: [
      nodeResolve({
        jsnext: true,
        main: true,
        browser: true,
      }),
      nodePolyfills(),
      commonJs(),
      typescript(),
      json(),
      replace({
        exclude: 'node_modules/**',
        preventAssignment: true,
        __SDK_VERSION__: pkg.version,
      }),
      terser(),
    ],
  },

  // Export ES Modules
  ...buildBundles(),
];
