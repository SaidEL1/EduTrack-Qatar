import nodeConfig from '@edutrack/eslint-config/node';

export default [
  ...nodeConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/**',
              from: '../../../apps/**',
              message: '@edutrack/ui must not import from application workspaces.',
            },
          ],
        },
      ],
    },
  },
];
