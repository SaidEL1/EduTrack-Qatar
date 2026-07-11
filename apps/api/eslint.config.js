import nestConfig from '@edutrack/eslint-config/nestjs';

export default [
  ...nestConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        projectService: false,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
    },
  },
];
