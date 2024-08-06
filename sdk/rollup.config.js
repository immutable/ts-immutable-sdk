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
import babel from '@rollup/plugin-babel';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Convert the import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
// Get the directory name of the current module
const __dirname = dirname(__filename);
const projectRoot = __dirname;

// RELEASE_TYPE environment variable is set by the CI/CD pipeline
const releaseType = process.env.RELEASE_TYPE || 'alpha';

const packages = JSON.parse(
  readFileSync(join(projectRoot, 'workspace-packages.json'), { encoding: 'utf8' }
));

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


const buildJS = () => {
  const filesToBuild = getFilesToBuild();
  // generate a single object that contains all the files under input
  const [inputs] = filesToBuild.reduce((acc, f) => {
    return [{...acc[0], [f] : `./src/${f}.ts`}]
  }, [{}])

  console.log(inputs)

  return  {
      input: inputs,
      output: {
        dir: 'dist',
        format: 'es',
      },
      plugins: [
        nodeResolve({
          resolveOnly: getPackages(),
        }),
        json(),
        commonJs(),
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
      external: ['pg'] 
    }
};

const getTypesBuild = (inputFilename) => [
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
    external: ['pg'] 
  },
];

const buildTypes = () => {
  const modules = [];
  const filesToBuild = getFilesToBuild();
  for (const file of filesToBuild) {
    modules.push(...getTypesBuild(file));
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
    input: 'src/browser.index.ts',
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
        preferBuiltins: false,
      }),
      nodePolyfills(),
      json(),
      commonJs(),
      babel({
        babelHelpers: 'bundled',
        include: ['../node_modules/ethers-v6/**', '../node_modules/@opensea/seaport-js/**'],
        plugins: ['@babel/plugin-transform-class-properties', '@babel/plugin-transform-private-methods'],
      }),
      typescript(),
      replace({
        // Can't exclude node_modules here because some dependencies use process.env.NODE_ENV
        // this breaks in browsers
        preventAssignment: true,
        __SDK_VERSION__: pkg.version,
        
        // This breaks in a dex dependency, so manually replacing it.
        'process.env.NODE_ENV': '"production"',
        'process': 'undefined'
      }),
      terser(),
    ],
  },

  // Export ES Modules
  buildJS(),
  ...buildTypes(),
];
