import { EduTrackError } from '@edutrack/shared';
import { config as loadDotenv } from 'dotenv';
import type { z } from 'zod';

export interface LoadConfigOptions<T extends z.ZodTypeAny> {
  readonly schema: T;
  readonly env?: Record<string, string | undefined>;
  readonly dotenvPath?: string;
}

/**
 * Validates environment variables against a Zod schema.
 * Fails fast on misconfiguration — no silent defaults for secrets.
 */
export function loadConfig<T extends z.ZodTypeAny>(
  options: LoadConfigOptions<T>,
): z.infer<T> {
  if (options.dotenvPath) {
    const result = loadDotenv({ path: options.dotenvPath });
    if (result.error) {
      throw new EduTrackError({
        code: 'CONFIGURATION',
        message: `Failed to load environment file: ${options.dotenvPath}`,
        cause: result.error,
      });
    }
  }

  const source = options.env ?? process.env;

  const parsed = options.schema.safeParse(source);
  if (!parsed.success) {
    throw new EduTrackError({
      code: 'CONFIGURATION',
      message: 'Environment validation failed',
      metadata: {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
  }

  return parsed.data as z.infer<T>;
}
