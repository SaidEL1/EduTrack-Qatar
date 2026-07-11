import { BadRequestException, Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export const TENANT_ID_HEADER = 'x-tenant-id';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(request: Request, _response: Response, next: NextFunction): void {
    const path = request.path;

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
    if (path.startsWith('/health') || path.startsWith('/v1/docs')) {
      return true;
    }
    if (path === '/v1/platform/tenants' && (method === 'GET' || method === 'POST')) {
      return true;
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
