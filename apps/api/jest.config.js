import base from '@edutrack/jest-config/node';

export default {
  ...base,
  displayName: '@edutrack/api',
  rootDir: '.',
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    ...base.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
