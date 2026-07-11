import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import {
  invitations,
  passwordHistory,
  securityTokens,
  userMfa,
  userSessions,
} from '../../../database/schema/index.js';

import { hashToken } from './token.utils.js';

const PASSWORD_HISTORY_LIMIT = 5;

@Injectable()
export class UserMfaRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async findByUserId(userId: string) {
    const [row] = await this.db
      .select()
      .from(userMfa)
      .where(eq(userMfa.userId, userId));
    return row ?? null;
  }

  async upsertPending(input: {
    readonly userId: string;
    readonly secretEncrypted: string;
  }) {
    const existing = await this.findByUserId(input.userId);
    if (existing) {
      await this.db
        .update(userMfa)
        .set({
          secretEncrypted: input.secretEncrypted,
          enabledAt: null,
          backupCodeHashes: null,
          updatedAt: new Date(),
        })
        .where(eq(userMfa.id, existing.id));
      return existing.id;
    }
    const [row] = await this.db
      .insert(userMfa)
      .values({
        userId: input.userId,
        secretEncrypted: input.secretEncrypted,
      })
      .returning({ id: userMfa.id });
    return row?.id ?? '';
  }

  async enable(userId: string, backupCodeHashes: string[]): Promise<void> {
    await this.db
      .update(userMfa)
      .set({
        enabledAt: new Date(),
        backupCodeHashes,
        updatedAt: new Date(),
      })
      .where(eq(userMfa.userId, userId));
  }

  async updateBackupCodes(userId: string, backupCodeHashes: string[]): Promise<void> {
    await this.db
      .update(userMfa)
      .set({ backupCodeHashes, updatedAt: new Date() })
      .where(eq(userMfa.userId, userId));
  }

  async remove(userId: string): Promise<void> {
    await this.db.delete(userMfa).where(eq(userMfa.userId, userId));
  }
}

@Injectable()
export class SecurityTokenRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(input: {
    readonly userId: string;
    readonly purpose: 'email_verification' | 'password_reset';
    readonly rawToken: string;
    readonly expiresAt: Date;
  }): Promise<string> {
    const [row] = await this.db
      .insert(securityTokens)
      .values({
        userId: input.userId,
        purpose: input.purpose,
        tokenHash: hashToken(input.rawToken),
        expiresAt: input.expiresAt,
      })
      .returning({ id: securityTokens.id });
    return row?.id ?? '';
  }

  async consume(rawToken: string, purpose: 'email_verification' | 'password_reset') {
    const tokenHash = hashToken(rawToken);
    const now = new Date();
    const [row] = await this.db
      .select()
      .from(securityTokens)
      .where(
        and(
          eq(securityTokens.tokenHash, tokenHash),
          eq(securityTokens.purpose, purpose),
          isNull(securityTokens.consumedAt),
          gt(securityTokens.expiresAt, now),
        ),
      );
    if (!row) {
      return null;
    }
    await this.db
      .update(securityTokens)
      .set({ consumedAt: now })
      .where(eq(securityTokens.id, row.id));
    return row;
  }
}

@Injectable()
export class PasswordHistoryRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async add(userId: string, passwordHash: string): Promise<void> {
    await this.db.insert(passwordHistory).values({ userId, passwordHash });
    const rows = await this.db
      .select({ id: passwordHistory.id })
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, userId))
      .orderBy(desc(passwordHistory.createdAt));
    const stale = rows.slice(PASSWORD_HISTORY_LIMIT);
    for (const row of stale) {
      await this.db.delete(passwordHistory).where(eq(passwordHistory.id, row.id));
    }
  }

  async listHashes(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ passwordHash: passwordHistory.passwordHash })
      .from(passwordHistory)
      .where(eq(passwordHistory.userId, userId))
      .orderBy(desc(passwordHistory.createdAt))
      .limit(PASSWORD_HISTORY_LIMIT);
    return rows.map((row) => row.passwordHash);
  }
}

@Injectable()
export class UserSessionRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async upsert(input: {
    readonly userId: string;
    readonly tenantId: string;
    readonly familyId: string;
    readonly deviceLabel?: string;
    readonly ipAddress?: string;
    readonly userAgent?: string;
  }): Promise<void> {
    const existing = await this.findByFamilyId(input.familyId);
    if (existing) {
      await this.db
        .update(userSessions)
        .set({ lastSeenAt: new Date(), revokedAt: null })
        .where(eq(userSessions.id, existing.id));
      return;
    }
    await this.db.insert(userSessions).values({
      userId: input.userId,
      tenantId: input.tenantId,
      familyId: input.familyId,
      deviceLabel: input.deviceLabel,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
  }

  async findByFamilyId(familyId: string) {
    const [row] = await this.db
      .select()
      .from(userSessions)
      .where(eq(userSessions.familyId, familyId));
    return row ?? null;
  }

  async listActive(userId: string, tenantId: string) {
    return this.db
      .select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.tenantId, tenantId),
          isNull(userSessions.revokedAt),
        ),
      )
      .orderBy(desc(userSessions.lastSeenAt));
  }

  async revoke(sessionId: string, userId: string): Promise<string | null> {
    const [row] = await this.db
      .select()
      .from(userSessions)
      .where(and(eq(userSessions.id, sessionId), eq(userSessions.userId, userId)));
    if (!row || row.revokedAt) {
      return null;
    }
    await this.db
      .update(userSessions)
      .set({ revokedAt: new Date() })
      .where(eq(userSessions.id, sessionId));
    return row.familyId;
  }

  async revokeByFamilyId(familyId: string): Promise<void> {
    await this.db
      .update(userSessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(userSessions.familyId, familyId), isNull(userSessions.revokedAt)));
  }

  async revokeAll(userId: string, tenantId: string): Promise<string[]> {
    const sessions = await this.listActive(userId, tenantId);
    const familyIds = sessions.map((s) => s.familyId);
    if (familyIds.length === 0) {
      return [];
    }
    await this.db
      .update(userSessions)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.tenantId, tenantId),
          isNull(userSessions.revokedAt),
        ),
      );
    return familyIds;
  }
}

@Injectable()
export class InvitationRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(input: {
    readonly tenantId: string;
    readonly email: string;
    readonly roleId?: string;
    readonly invitedBy: string;
    readonly rawToken: string;
    readonly expiresAt: Date;
  }) {
    const [row] = await this.db
      .insert(invitations)
      .values({
        tenantId: input.tenantId,
        email: input.email.toLowerCase(),
        roleId: input.roleId,
        invitedBy: input.invitedBy,
        tokenHash: hashToken(input.rawToken),
        expiresAt: input.expiresAt,
      })
      .returning();
    return row;
  }

  async findByToken(rawToken: string) {
    const [row] = await this.db
      .select()
      .from(invitations)
      .where(eq(invitations.tokenHash, hashToken(rawToken)));
    return row ?? null;
  }

  async listByTenant(tenantId: string) {
    return this.db
      .select()
      .from(invitations)
      .where(eq(invitations.tenantId, tenantId))
      .orderBy(desc(invitations.createdAt));
  }

  async markAccepted(id: string, acceptedBy: string): Promise<void> {
    await this.db
      .update(invitations)
      .set({
        status: 'accepted',
        acceptedAt: new Date(),
        acceptedBy,
      })
      .where(eq(invitations.id, id));
  }
}
