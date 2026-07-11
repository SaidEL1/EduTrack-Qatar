import { ForbiddenException, Injectable } from '@nestjs/common';

import { RbacRepository } from '../identity/infrastructure/rbac.repository.js';

import type { PermissionCode } from './permissions/permission.types.js';

/**
 * Permission engine — persisted RBAC with Redis cache (FR-SET-003 / TDR-007).
 */
@Injectable()
export class PermissionEngine {
  constructor(private readonly rbacRepository: RbacRepository) {}

  /** @deprecated Use bootstrapTenantAdminRole via RbacRepository during tenant provisioning */
  seedTenantPermissions(
    _tenantId: string,
    _permissions: readonly PermissionCode[],
  ): void {
    /* no-op — permissions are persisted in DB since Sprint 2A */
  }

  async assertPermission(
    tenantId: string,
    permission: PermissionCode,
    actorId?: string,
  ): Promise<void> {
    if (actorId === 'system') {
      return;
    }

    if (!actorId) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }

    const granted = await this.rbacRepository.resolvePermissions(tenantId, actorId);

    if (!granted.includes(permission)) {
      throw new ForbiddenException(`Missing permission: ${permission}`);
    }
  }

  async hasPermission(
    tenantId: string,
    permission: PermissionCode,
    userId: string,
  ): Promise<boolean> {
    const granted = await this.rbacRepository.resolvePermissions(tenantId, userId);
    return granted.includes(permission);
  }
}
