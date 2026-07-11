import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { RedisRateLimiterService } from '../infrastructure/redis-rate-limiter.service.js';

export const AUTH_RATE_LIMITS = {
  login: { limit: 10, windowSeconds: 60 },
  refresh: { limit: 30, windowSeconds: 60 },
  mfa: { limit: 10, windowSeconds: 60 },
  passwordReset: { limit: 5, windowSeconds: 300 },
} as const;

/** Redis-backed rate limiting for public auth endpoints — Sprint 2B */
@Injectable()
export class AuthRateLimitGuard implements CanActivate {
  constructor(private readonly rateLimiter: RedisRateLimiterService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.originalUrl.split('?')[0] ?? request.path;
    const config = resolveLimitConfig(path);
    if (!config) {
      return true;
    }
    const ip = request.ip ?? 'unknown';
    const key = `${config.name}:${ip}`;
    const result = await this.rateLimiter.check(
      key,
      config.limit,
      config.windowSeconds,
    );
    if (!result.allowed) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}

function resolveLimitConfig(
  path: string,
):
  | { readonly name: string; readonly limit: number; readonly windowSeconds: number }
  | undefined {
  if (path.includes('/auth/login')) {
    return { name: 'login', ...AUTH_RATE_LIMITS.login };
  }
  if (path.includes('/auth/refresh')) {
    return { name: 'refresh', ...AUTH_RATE_LIMITS.refresh };
  }
  if (path.includes('/auth/mfa/verify')) {
    return { name: 'mfa', ...AUTH_RATE_LIMITS.mfa };
  }
  if (path.includes('/password-reset/request')) {
    return { name: 'password-reset', ...AUTH_RATE_LIMITS.passwordReset };
  }
  return undefined;
}
