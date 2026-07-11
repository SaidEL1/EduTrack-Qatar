import { createLogger } from './logger.js';

describe('createLogger', () => {
  it('creates a logger with service context', () => {
    const logger = createLogger({
      prettyPrint: false,
      baseContext: {
        service: 'test-service',
        environment: 'test',
      },
    });

    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
  });
});
