import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import {
  permissions,
  rolePermissions,
  roles,
  userRoles,
} from '../../../database/schema/index.js';

import { PermissionCacheService } from './permission-cache.service.js';

/** Resolves effective permissions from persisted RBAC — FR-SET-003 */
@Injectable()
export class RbacRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly permissionCache: PermissionCacheService,
  ) {}

  async resolvePermissions(tenantId: string, userId: string): Promise<string[]> {
    const cached = await this.permissionCache.get(tenantId, userId);
    if (cached) {
      return cached;
    }

    const userRoleRows = await this.db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(and(eq(userRoles.tenantId, tenantId), eq(userRoles.userId, userId)));

    if (userRoleRows.length === 0) {
      await this.permissionCache.set(tenantId, userId, []);
      return [];
    }

    const roleIds = userRoleRows.map((row) => row.roleId);
    const permissionRows = await this.db
      .select({ code: permissions.code })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds));

    const codes = [...new Set(permissionRows.map((row) => row.code))];
    await this.permissionCache.set(tenantId, userId, codes);
    return codes;
  }

  async bootstrapTenantAdminRole(
    tenantId: string,
    permissionCodes: readonly string[],
  ): Promise<string> {
    const [existing] = await this.db
      .select()
      .from(roles)
      .where(and(eq(roles.tenantId, tenantId), eq(roles.code, 'tenant_admin')));

    if (existing) {
      return existing.id;
    }

    const [role] = await this.db
      .insert(roles)
      .values({
        tenantId,
        code: 'tenant_admin',
        name: 'Tenant Administrator',
        isSystem: true,
      })
      .returning();

    if (!role) {
      throw new Error('Failed to create tenant_admin role');
    }

    const permissionRows = await this.db
      .select()
      .from(permissions)
      .where(inArray(permissions.code, [...permissionCodes]));

    if (permissionRows.length > 0) {
      await this.db.insert(rolePermissions).values(
        permissionRows.map((perm) => ({
          roleId: role.id,
          permissionId: perm.id,
        })),
      );
    }

    return role.id;
  }

  async assignRole(
    tenantId: string,
    userId: string,
    roleId: string,
    assignedBy?: string,
  ): Promise<void> {
    await this.db
      .insert(userRoles)
      .values({
        tenantId,
        userId,
        roleId,
        assignedBy,
      })
      .onConflictDoNothing();

    await this.permissionCache.invalidate(tenantId, userId);
  }

  async removeRole(tenantId: string, userId: string, roleId: string): Promise<void> {
    await this.db
      .delete(userRoles)
      .where(
        and(
          eq(userRoles.tenantId, tenantId),
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId),
        ),
      );

    await this.permissionCache.invalidate(tenantId, userId);
  }

  async listRoles(tenantId: string) {
    return this.db.select().from(roles).where(eq(roles.tenantId, tenantId));
  }
}
