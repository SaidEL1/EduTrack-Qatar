import { initOpenTelemetry, shutdownOpenTelemetry } from './init-telemetry.js';

describe('initOpenTelemetry', () => {
  afterEach(async () => {
    await shutdownOpenTelemetry();
  });

  it('initializes without throwing', () => {
    expect(() => {
      initOpenTelemetry({
        serviceName: 'test-api',
        serviceVersion: '0.0.0',
        environment: 'test',
        metricsPort: 0,
      });
    }).not.toThrow();
  });
});
