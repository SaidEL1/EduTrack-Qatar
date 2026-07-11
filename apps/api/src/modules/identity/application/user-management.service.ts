import { Email, validatePasswordPolicy } from '@edutrack/domain';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import {
  organizationMembers,
  userProfiles,
  users,
} from '../../../database/schema/index.js';
import { AuditService } from '../../audit/audit.service.js';
import { buildAuditEntry } from '../../platform/platform-audit.helper.js';
import { PasswordHasherService } from '../infrastructure/password-hasher.service.js';
import { RbacRepository } from '../infrastructure/rbac.repository.js';

export interface CreateUserInput {
  readonly tenantId: string;
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly displayName?: string;
  readonly roleId?: string;
  readonly actorId?: string;
}

export interface UpdateUserInput {
  readonly tenantId: string;
  readonly userId: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly displayName?: string;
  readonly email?: string;
  readonly actorId?: string;
}

/** User lifecycle management — FR-SET-003 */
@Injectable()
export class UserManagementService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly passwordHasher: PasswordHasherService,
    private readonly rbacRepository: RbacRepository,
    private readonly auditService: AuditService,
  ) {}

  async createUser(input: CreateUserInput, correlationId?: string) {
    const emailResult = Email.create(input.email);
    if (!emailResult.ok) {
      throw new ConflictException(emailResult.error.message);
    }

    const passwordResult = validatePasswordPolicy(input.password);
    if (!passwordResult.ok) {
      throw new ConflictException(passwordResult.error.message);
    }

    const [existing] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, emailResult.value.value), isNull(users.deletedAt)));

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const [user] = await this.db
      .insert(users)
      .values({
        email: emailResult.value.value,
        passwordHash,
        status: 'active',
      })
      .returning();

    if (!user) {
      throw new NotFoundException('Failed to create user');
    }

    await this.db.insert(userProfiles).values({
      userId: user.id,
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: input.displayName,
    });

    await this.db.insert(organizationMembers).values({
      tenantId: input.tenantId,
      userId: user.id,
      status: 'active',
      joinedAt: new Date(),
    });

    if (input.roleId) {
      await this.rbacRepository.assignRole(
        input.tenantId,
        user.id,
        input.roleId,
        input.actorId,
      );
    }

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId: input.tenantId,
          action: 'identity.user.created',
          entityType: 'user',
          entityId: user.id,
          afterState: { email: user.email, status: user.status },
          ...(input.actorId !== undefined ? { actorId: input.actorId } : {}),
        },
        correlationId,
      ),
    );

    return this.getUser(input.tenantId, user.id);
  }

  async getUser(tenantId: string, userId: string) {
    const [row] = await this.db
      .select({
        user: users,
        profile: userProfiles,
        membership: organizationMembers,
      })
      .from(users)
      .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
      .innerJoin(
        organizationMembers,
        and(
          eq(organizationMembers.userId, users.id),
          eq(organizationMembers.tenantId, tenantId),
          isNull(organizationMembers.deletedAt),
        ),
      )
      .where(and(eq(users.id, userId), isNull(users.deletedAt)));

    if (!row) {
      throw new NotFoundException('User not found');
    }

    return {
      id: row.user.id,
      email: row.user.email,
      status: row.user.status,
      membershipStatus: row.membership.status,
      profile: {
        firstName: row.profile.firstName,
        lastName: row.profile.lastName,
        displayName: row.profile.displayName,
        locale: row.profile.locale,
        timezone: row.profile.timezone,
      },
      lastLoginAt: row.user.lastLoginAt,
      createdAt: row.user.createdAt,
    };
  }

  async listUsers(tenantId: string) {
    const rows = await this.db
      .select({
        user: users,
        profile: userProfiles,
        membership: organizationMembers,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(organizationMembers.userId, users.id))
      .innerJoin(userProfiles, eq(userProfiles.userId, users.id))
      .where(
        and(
          eq(organizationMembers.tenantId, tenantId),
          isNull(organizationMembers.deletedAt),
          isNull(users.deletedAt),
        ),
      );

    return rows.map((row) => ({
      id: row.user.id,
      email: row.user.email,
      status: row.user.status,
      membershipStatus: row.membership.status,
      profile: {
        firstName: row.profile.firstName,
        lastName: row.profile.lastName,
        displayName: row.profile.displayName,
      },
    }));
  }

  async updateUser(input: UpdateUserInput, correlationId?: string) {
    const before = await this.getUser(input.tenantId, input.userId);

    if (input.email) {
      const emailResult = Email.create(input.email);
      if (!emailResult.ok) {
        throw new ConflictException(emailResult.error.message);
      }
      await this.db
        .update(users)
        .set({ email: emailResult.value.value, updatedAt: new Date() })
        .where(eq(users.id, input.userId));
    }

    const profileUpdates: Partial<{
      firstName: string;
      lastName: string;
      displayName: string;
      updatedAt: Date;
    }> = { updatedAt: new Date() };

    if (input.firstName !== undefined) profileUpdates.firstName = input.firstName;
    if (input.lastName !== undefined) profileUpdates.lastName = input.lastName;
    if (input.displayName !== undefined) profileUpdates.displayName = input.displayName;

    if (Object.keys(profileUpdates).length > 1) {
      await this.db
        .update(userProfiles)
        .set(profileUpdates)
        .where(eq(userProfiles.userId, input.userId));
    }

    const after = await this.getUser(input.tenantId, input.userId);

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId: input.tenantId,
          action: 'identity.user.updated',
          entityType: 'user',
          entityId: input.userId,
          beforeState: before,
          afterState: after,
          ...(input.actorId !== undefined ? { actorId: input.actorId } : {}),
        },
        correlationId,
      ),
    );

    return after;
  }

  async deactivateUser(
    tenantId: string,
    userId: string,
    actorId?: string,
    correlationId?: string,
  ) {
    const before = await this.getUser(tenantId, userId);

    await this.db
      .update(users)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(eq(users.id, userId));

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId,
          action: 'identity.user.deactivated',
          entityType: 'user',
          entityId: userId,
          beforeState: before,
          afterState: { status: 'inactive' },
          ...(actorId !== undefined ? { actorId } : {}),
        },
        correlationId,
      ),
    );

    return this.getUser(tenantId, userId);
  }

  async reactivateUser(
    tenantId: string,
    userId: string,
    actorId?: string,
    correlationId?: string,
  ) {
    const before = await this.getUser(tenantId, userId);

    await this.db
      .update(users)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(users.id, userId));

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId,
          action: 'identity.user.reactivated',
          entityType: 'user',
          entityId: userId,
          beforeState: before,
          afterState: { status: 'active' },
          ...(actorId !== undefined ? { actorId } : {}),
        },
        correlationId,
      ),
    );

    return this.getUser(tenantId, userId);
  }

  async assignRole(
    tenantId: string,
    userId: string,
    roleId: string,
    actorId?: string,
    correlationId?: string,
  ) {
    await this.getUser(tenantId, userId);
    await this.rbacRepository.assignRole(tenantId, userId, roleId, actorId);

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId,
          action: 'identity.role.assigned',
          entityType: 'user_role',
          entityId: userId,
          afterState: { roleId },
          ...(actorId !== undefined ? { actorId } : {}),
        },
        correlationId,
      ),
    );
  }

  async removeRole(
    tenantId: string,
    userId: string,
    roleId: string,
    actorId?: string,
    correlationId?: string,
  ) {
    await this.rbacRepository.removeRole(tenantId, userId, roleId);

    await this.auditService.append(
      buildAuditEntry(
        {
          tenantId,
          action: 'identity.role.removed',
          entityType: 'user_role',
          entityId: userId,
          afterState: { roleId },
          ...(actorId !== undefined ? { actorId } : {}),
        },
        correlationId,
      ),
    );
  }
}
