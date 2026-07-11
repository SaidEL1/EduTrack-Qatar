import { ForbiddenException, Injectable } from '@nestjs/common';

import type { PlatformPermissionCode } from './permissions/platform.permissions.js';

/**
 * Permission engine skeleton — full RBAC in Sprint 2 (FR-SET-003).
 * Sprint 1: system actor bypasses checks; tenant requests require header presence only.
 */
@Injectable()
export class PermissionEngine {
  private readonly tenantRolePermissions = new Map<
    string,
    Set<PlatformPermissionCode>
  >();

  seedTenantPermissions(
    tenantId: string,
    permissions: readonly PlatformPermissionCode[],
  ): void {
    this.tenantRolePermissions.set(tenantId, new Set(permissions));
  }

  assertPermission(
    tenantId: string,
    permission: PlatformPermissionCode,
    actorId?: string,
  ): void {
    if (actorId === 'system') {
      return;
    }

    const granted = this.tenantRolePermissions.get(tenantId);
    if (!granted?.has(permission)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
  }
}
