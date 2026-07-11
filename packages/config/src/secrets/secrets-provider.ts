import { EduTrackError } from '@edutrack/shared';

export interface SecretsProviderOptions {
  readonly prefix?: string;
}

/**
 * Local/dev secrets from environment variables.
 * Production: replace with AWS Secrets Manager integration (Sprint 1+).
 * @see EDU-BP-007 §15 — secrets never committed to repository
 */
export class SecretsProvider {
  private readonly prefix: string;

  constructor(options: SecretsProviderOptions = {}) {
    this.prefix = options.prefix ?? 'EDUTRACK_';
  }

  getSecret(key: string): string {
    const envKey = `${this.prefix}${key}`;
    const value = process.env[envKey];

    if (!value) {
      throw new EduTrackError({
        code: 'CONFIGURATION',
        message: `Required secret not found: ${envKey}`,
        metadata: { secretKey: key },
      });
    }

    return value;
  }

  getOptionalSecret(key: string): string | undefined {
    const envKey = `${this.prefix}${key}`;
    return process.env[envKey];
  }
}
