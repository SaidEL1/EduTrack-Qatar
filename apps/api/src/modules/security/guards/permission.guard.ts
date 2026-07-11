import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { getTenantIdFromRequest } from '../../../common/middleware/tenant-context.middleware.js';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator.js';
import { PermissionEngine } from '../permission-engine.service.js';
import type { PlatformPermissionCode } from '../permissions/platform.permissions.js';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionEngine: PermissionEngine,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.getAllAndOverride<
      PlatformPermissionCode | undefined
    >(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = getTenantIdFromRequest(request);
    const actorId = request.headers['x-actor-id'] as string | undefined;

    this.permissionEngine.assertPermission(tenantId, permission, actorId);
    return true;
  }
}
