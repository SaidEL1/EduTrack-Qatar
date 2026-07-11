import { RedisRateLimiterService } from '../../src/modules/identity/infrastructure/redis-rate-limiter.service.js';

describe('RedisRateLimiterService', () => {
  it('allows requests within memory fallback limits', async () => {
    const limiter = new RedisRateLimiterService(undefined);
    const first = await limiter.check('login:127.0.0.1', 2, 60);
    const second = await limiter.check('login:127.0.0.1', 2, 60);
    const third = await limiter.check('login:127.0.0.1', 2, 60);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('throws on boot when redis is required but missing', () => {
    const previous = process.env['REDIS_REQUIRED'];
    process.env['REDIS_REQUIRED'] = 'true';
    const limiter = new RedisRateLimiterService(undefined);
    expect(() => {
      limiter.onModuleInit();
    }).toThrow('REDIS_URL is required');
    process.env['REDIS_REQUIRED'] = previous;
  });
});
