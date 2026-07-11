import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { defer, from, lastValueFrom, type Observable } from 'rxjs';

import { TenantRlsService } from '../../modules/identity/infrastructure/tenant-rls.service.js';
import { SKIP_TENANT_RLS_KEY } from '../decorators/skip-tenant-rls.decorator.js';
import { getTenantIdFromRequest } from '../middleware/tenant-context.middleware.js';

/** Wraps tenant-scoped HTTP handlers in a PostgreSQL RLS transaction — ADR-S2C-001 */
@Injectable()
export class TenantRlsInterceptor implements NestInterceptor {
  constructor(
    private readonly tenantRlsService: TenantRlsService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TENANT_RLS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = this.resolveTenantId(request);
    if (!tenantId) {
      return next.handle();
    }

    return defer(() =>
      from(
        this.tenantRlsService.runInTenantContext(tenantId, () =>
          lastValueFrom(next.handle()),
        ),
      ),
    );
  }

  private resolveTenantId(request: Request): string | undefined {
    try {
      return getTenantIdFromRequest(request);
    } catch {
      return undefined;
    }
  }
}
