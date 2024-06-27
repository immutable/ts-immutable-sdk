import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.base.json';
import path from 'path';

const mapping = pathsToModuleNameMapper(compilerOptions.paths, { prefix: path.resolve(__dirname, './') + '/' });

console.log(mapping);

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: mapping,
};
