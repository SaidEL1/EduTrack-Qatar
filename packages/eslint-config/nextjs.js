import base from './base.js';

/** Next.js portal apps — UI must not access database layers directly */
export default [
  ...base,
  {
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/**',
              from: '../../../packages/domain/**',
              message:
                'Portal apps must consume APIs via @edutrack/api-client, not domain packages directly.',
            },
          ],
        },
      ],
    },
  },
];
