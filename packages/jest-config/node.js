import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const configDir = path.dirname(fileURLToPath(import.meta.url));

function findMonorepoRoot(startDir) {
  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  throw new Error('EduTrack monorepo root not found');
}

const monorepoRoot = findMonorepoRoot(configDir);

/** Maps @edutrack/* workspace imports to source for Jest */
function createWorkspaceModuleNameMapper() {
  const packages = fs.readdirSync(path.join(monorepoRoot, 'packages'));
  return Object.fromEntries(
    packages.map((pkg) => [
      `^@edutrack/${pkg}$`,
      path.join(monorepoRoot, 'packages', pkg, 'src/index.ts'),
    ]),
  );
}

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    ...createWorkspaceModuleNameMapper(),
  },
  transform: {
    '^.+\\.tsx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: { syntax: 'typescript', decorators: true },
          target: 'es2022',
        },
        module: { type: 'es6' },
      },
    ],
  },
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  passWithNoTests: false,
  clearMocks: true,
  restoreMocks: true,
};

export default config;
