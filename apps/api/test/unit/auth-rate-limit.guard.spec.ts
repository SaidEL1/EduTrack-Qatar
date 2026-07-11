import { HttpException } from '@nestjs/common';

import { AuthRateLimitGuard } from '../../src/modules/identity/guards/auth-rate-limit.guard.js';
import { type RedisRateLimiterService } from '../../src/modules/identity/infrastructure/redis-rate-limiter.service.js';

describe('AuthRateLimitGuard', () => {
  let guard: AuthRateLimitGuard;
  let rateLimiter: jest.Mocked<Pick<RedisRateLimiterService, 'check'>>;

  beforeEach(() => {
    rateLimiter = {
      check: jest
        .fn()
        .mockResolvedValue({ allowed: true, remaining: 9, retryAfterSeconds: 0 }),
    };
    guard = new AuthRateLimitGuard(rateLimiter as unknown as RedisRateLimiterService);
  });

  function createContext(path: string) {
    const request = {
      originalUrl: path,
      path,
      ip: '127.0.0.1',
    };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    };
  }

  it('allows non-auth routes without rate limiting', async () => {
    await expect(
      guard.canActivate(createContext('/identity/users') as never),
    ).resolves.toBe(true);
    expect(rateLimiter.check).not.toHaveBeenCalled();
  });

  it('rate limits login routes', async () => {
    await guard.canActivate(createContext('/auth/login') as never);
    expect(rateLimiter.check).toHaveBeenCalledWith('login:127.0.0.1', 10, 60);
  });

  it('throws when rate limit exceeded', async () => {
    rateLimiter.check.mockResolvedValue({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
    });

    await expect(
      guard.canActivate(createContext('/auth/login') as never),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
