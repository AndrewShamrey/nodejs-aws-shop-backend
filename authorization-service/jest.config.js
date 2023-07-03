const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest',
  clearMocks: true,
  roots: ['<rootDir>/src'],
  coveragePathIgnorePatterns: ['./node-modules', './__testUtils__'],
  modulePathIgnorePatterns: ['./node-modules'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/__testUtils__/testSetup.ts'],
};
