import { baseEnvSchema } from '@edutrack/config';
import { z } from 'zod';

/** API runtime environment — validated at bootstrap (Twelve-Factor / NFR-MNT-001) */
export const apiEnvSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url(),
  API_PREFIX: z.string().default('v1'),
  METRICS_PORT: z.coerce.number().int().default(9464),
  OTEL_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  CORS_ORIGINS: z.string().default('*'),
  REDIS_REQUIRED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  APP_PUBLIC_URL: z.string().url().default('http://localhost:3000'),
  EMAIL_RETURN_TOKENS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
