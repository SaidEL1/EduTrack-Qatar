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
              from: '../../../packages/domain/**',
              message: 'API client must not import domain packages directly.',
            },
          ],
        },
      ],
    },
  },
];
