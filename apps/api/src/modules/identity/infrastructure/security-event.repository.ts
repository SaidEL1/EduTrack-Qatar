import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import {
  loginEvents,
  mfaLoginChallenges,
  securityEvents,
} from '../../../database/schema/index.js';

import { hashToken } from './token.utils.js';

@Injectable()
export class LoginEventRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async record(input: {
    readonly tenantId?: string;
    readonly userId?: string;
    readonly email: string;
    readonly outcome: (typeof loginEvents.$inferInsert)['outcome'];
    readonly ipAddress?: string;
    readonly userAgent?: string;
    readonly metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.db.insert(loginEvents).values({
      tenantId: input.tenantId,
      userId: input.userId,
      email: input.email,
      outcome: input.outcome,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: input.metadata,
    });
  }

  async listByTenant(tenantId: string, limit = 50) {
    return this.db
      .select()
      .from(loginEvents)
      .where(eq(loginEvents.tenantId, tenantId))
      .orderBy(desc(loginEvents.createdAt))
      .limit(limit);
  }
}

@Injectable()
export class SecurityEventRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async record(input: {
    readonly tenantId?: string;
    readonly userId?: string;
    readonly eventType: string;
    readonly severity?: 'info' | 'warning' | 'critical';
    readonly ipAddress?: string;
    readonly metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.db.insert(securityEvents).values({
      tenantId: input.tenantId,
      userId: input.userId,
      eventType: input.eventType,
      severity: input.severity ?? 'info',
      ipAddress: input.ipAddress,
      metadata: input.metadata,
    });
  }

  async listByTenant(tenantId: string, limit = 50) {
    return this.db
      .select()
      .from(securityEvents)
      .where(eq(securityEvents.tenantId, tenantId))
      .orderBy(desc(securityEvents.createdAt))
      .limit(limit);
  }
}

@Injectable()
export class MfaLoginChallengeRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async create(input: {
    readonly userId: string;
    readonly tenantId: string;
    readonly rawToken: string;
    readonly expiresAt: Date;
    readonly ipAddress?: string;
    readonly userAgent?: string;
  }): Promise<string> {
    const [row] = await this.db
      .insert(mfaLoginChallenges)
      .values({
        userId: input.userId,
        tenantId: input.tenantId,
        tokenHash: hashToken(input.rawToken),
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      })
      .returning({ id: mfaLoginChallenges.id });
    return row?.id ?? '';
  }

  async consume(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const now = new Date();
    const [row] = await this.db
      .select()
      .from(mfaLoginChallenges)
      .where(
        and(
          eq(mfaLoginChallenges.tokenHash, tokenHash),
          isNull(mfaLoginChallenges.consumedAt),
          gt(mfaLoginChallenges.expiresAt, now),
        ),
      );
    if (!row) {
      return null;
    }
    await this.db
      .update(mfaLoginChallenges)
      .set({ consumedAt: now })
      .where(eq(mfaLoginChallenges.id, row.id));
    return row;
  }
}
