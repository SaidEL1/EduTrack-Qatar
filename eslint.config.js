import nodeConfig from '@edutrack/eslint-config/node';
import tseslint from 'typescript-eslint';

const testFiles = ['**/*.spec.ts', '**/*.test.ts', '**/test/**/*.ts'];
const configJsFiles = [
  'packages/eslint-config/**',
  'packages/jest-config/**',
  'scripts/**',
  'commitlint.config.js',
];

export default [
  ...nodeConfig,
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/node_modules/**',
      'commitlint.config.js',
      'packages/eslint-config/**',
      'packages/jest-config/**',
      'scripts/**',
    ],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: [...testFiles, ...configJsFiles],
    ...tseslint.configs.disableTypeChecked,
  },
];
