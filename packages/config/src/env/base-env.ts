import { z } from 'zod';

/** Base environment schema shared across all EduTrack services */
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  SERVICE_NAME: z.string().min(1),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

export function loadBaseEnv(
  env: Record<string, string | undefined> = process.env,
): BaseEnv {
  return baseEnvSchema.parse(env);
}
