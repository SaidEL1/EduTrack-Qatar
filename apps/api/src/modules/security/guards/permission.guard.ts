import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { getTenantIdFromRequest } from '../../../common/middleware/tenant-context.middleware.js';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator.js';
import { PermissionEngine } from '../permission-engine.service.js';
import type { PermissionCode } from '../permissions/permission.types.js';
import { getAuthUser } from '../types/authenticated-request.js';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionEngine: PermissionEngine,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.getAllAndOverride<PermissionCode | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = getTenantIdFromRequest(request);
    const authUser = getAuthUser(request);
    const actorId =
      authUser?.userId ?? (request.headers['x-actor-id'] as string | undefined);

    await this.permissionEngine.assertPermission(tenantId, permission, actorId);
    return true;
  }
}
