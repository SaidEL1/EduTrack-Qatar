import { BadRequestException, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export const TENANT_ID_HEADER = 'x-tenant-id';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(request: Request, _response: Response, next: NextFunction): void {
    const path = request.originalUrl.split('?')[0] ?? request.originalUrl;

    if (this.isExempt(path, request.method)) {
      next();
      return;
    }

    const incoming = request.headers[TENANT_ID_HEADER];
    const tenantId = Array.isArray(incoming) ? incoming[0] : incoming;

    if (!tenantId) {
      throw new BadRequestException(`Missing required header: ${TENANT_ID_HEADER}`);
    }

    request.headers[TENANT_ID_HEADER] = tenantId;
    next();
  }

  private isExempt(path: string, method: string): boolean {
    const candidates = [path, path.startsWith('/v1') ? path.slice(3) : path];

    for (const route of candidates) {
      if (route.startsWith('/health') || route.startsWith('/docs')) {
        return true;
      }
      if (
        route.includes('/auth/login') ||
        route.includes('/auth/refresh') ||
        route.includes('/auth/logout')
      ) {
        return true;
      }
      if (
        route.includes('/platform/tenants') &&
        (method === 'GET' || method === 'POST')
      ) {
        return true;
      }
    }

    return false;
  }
}

export function getTenantIdFromRequest(request: Request): string {
  const value = request.headers[TENANT_ID_HEADER];
  const tenantId = typeof value === 'string' ? value : undefined;

  if (!tenantId) {
    throw new BadRequestException(`Missing required header: ${TENANT_ID_HEADER}`);
  }

  return tenantId;
}
