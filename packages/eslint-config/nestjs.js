import base from './base.js';

/** NestJS API — enforces modular monolith boundaries (EDU-BP-007 §3) */
export default [
  ...base,
  {
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/modules/**/domain/**',
              from: './src/modules/**/infrastructure/**',
              message:
                'Domain layer must not import from infrastructure (Clean Architecture).',
            },
            {
              target: './src/modules/**/domain/**',
              from: './src/modules/**/presentation/**',
              message:
                'Domain layer must not import from presentation (Clean Architecture).',
            },
          ],
        },
      ],
    },
  },
];
