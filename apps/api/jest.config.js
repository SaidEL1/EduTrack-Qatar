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
  collectCoverageFrom: [
    'src/modules/identity/application/**/*.ts',
    'src/modules/identity/infrastructure/**/*.ts',
    'src/modules/notification/**/*.ts',
    'src/modules/platform/application/**/*.ts',
    'src/modules/security/**/*.ts',
    'src/common/utils/**/*.ts',
    'src/common/interceptors/**/*.ts',
    'src/common/middleware/origin-validation.middleware.ts',
    '!src/**/*.d.ts',
    '!src/modules/security/decorators/**',
  ],
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
