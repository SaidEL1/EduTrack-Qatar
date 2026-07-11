import { baseEnvSchema } from './env/base-env.js';
import { loadConfig } from './loader.js';

describe('loadConfig', () => {
  it('validates required environment variables', () => {
    const config = loadConfig({
      schema: baseEnvSchema,
      env: {
        NODE_ENV: 'test',
        SERVICE_NAME: 'unit-test',
      },
    });

    expect(config.SERVICE_NAME).toBe('unit-test');
    expect(config.LOG_LEVEL).toBe('info');
  });

  it('throws EduTrackError on invalid config', () => {
    expect(() =>
      loadConfig({
        schema: baseEnvSchema,
        env: { NODE_ENV: 'invalid' },
      }),
    ).toThrow('Environment validation failed');
  });
});
