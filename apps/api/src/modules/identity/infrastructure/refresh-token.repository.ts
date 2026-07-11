import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gt, isNull } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import { refreshTokens } from '../../../database/schema/index.js';

import { hashToken } from './token.utils.js';

export interface StoreRefreshTokenInput {
  readonly userId: string;
  readonly tenantId: string | null;
  readonly rawToken: string;
  readonly familyId: string;
  readonly expiresAt: Date;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

/** Refresh token persistence with rotation support — TDR-011 */
@Injectable()
export class RefreshTokenRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async store(input: StoreRefreshTokenInput): Promise<string> {
    const [row] = await this.db
      .insert(refreshTokens)
      .values({
        userId: input.userId,
        tenantId: input.tenantId,
        tokenHash: hashToken(input.rawToken),
        familyId: input.familyId,
        expiresAt: input.expiresAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      })
      .returning({ id: refreshTokens.id });

    return row?.id ?? '';
  }

  async findValid(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const now = new Date();

    const [row] = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenHash, tokenHash),
          isNull(refreshTokens.revokedAt),
          gt(refreshTokens.expiresAt, now),
        ),
      );

    return row;
  }

  async findByHash(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const [row] = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash));
    return row ?? null;
  }

  async revokeAllForUser(userId: string, tenantId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.tenantId, tenantId),
          isNull(refreshTokens.revokedAt),
        ),
      );
  }

  async revoke(id: string, replacedBy?: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({
        revokedAt: new Date(),
        ...(replacedBy !== undefined ? { replacedBy } : {}),
      })
      .where(eq(refreshTokens.id, id));
  }

  async revokeFamily(familyId: string, userId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(refreshTokens.familyId, familyId),
          eq(refreshTokens.userId, userId),
          isNull(refreshTokens.revokedAt),
        ),
      );
  }
}
