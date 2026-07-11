import { ForbiddenException, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * CSRF mitigation for browser clients — validates Origin/Referer against allowed origins.
 * Bearer-token API clients without Origin header are allowed (mobile, server-to-server).
 */
@Injectable()
export class OriginValidationMiddleware implements NestMiddleware {
  use(request: Request, _response: Response, next: NextFunction): void {
    if (!STATE_CHANGING_METHODS.has(request.method.toUpperCase())) {
      next();
      return;
    }

    if (this.isExempt(request)) {
      next();
      return;
    }

    const authorization = request.headers.authorization;
    if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
      const origin = request.headers.origin;
      if (!origin) {
        next();
        return;
      }
    }

    const allowed = parseAllowedOrigins(process.env['CORS_ORIGINS'] ?? '*');
    if (allowed.has('*')) {
      next();
      return;
    }

    const origin = request.headers.origin ?? request.headers.referer;
    if (!origin) {
      next();
      return;
    }

    if (!isAllowedOrigin(origin, allowed)) {
      throw new ForbiddenException('Origin not allowed');
    }

    next();
  }

  private isExempt(request: Request): boolean {
    const path = request.originalUrl.split('?')[0] ?? request.path;
    return (
      path.includes('/health') ||
      path.includes('/auth/login') ||
      path.includes('/auth/refresh') ||
      path.includes('/auth/logout') ||
      path.includes('/auth/mfa/verify') ||
      path.includes('/auth/invitations/accept') ||
      path.includes('/identity/account/verify-email/confirm') ||
      path.includes('/identity/account/password-reset/')
    );
  }
}

function parseAllowedOrigins(raw: string): Set<string> {
  return new Set(
    raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function isAllowedOrigin(value: string, allowed: Set<string>): boolean {
  try {
    const origin = new URL(value).origin;
    return allowed.has(origin);
  } catch {
    return allowed.has(value);
  }
}
