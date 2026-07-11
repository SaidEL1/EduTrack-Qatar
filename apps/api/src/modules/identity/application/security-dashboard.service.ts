import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, gte, isNull, sql } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import {
  loginEvents,
  securityEvents,
  userSessions,
} from '../../../database/schema/index.js';

export interface SecurityDashboardSummary {
  readonly activeSessions: number;
  readonly failedLogins24h: number;
  readonly successfulLogins24h: number;
  readonly criticalEvents24h: number;
  readonly mfaChallenges24h: number;
}

export interface LoginAnalyticsPoint {
  readonly outcome: string;
  readonly count: number;
}

@Injectable()
export class SecurityDashboardService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async getSummary(tenantId: string): Promise<SecurityDashboardSummary> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [sessions] = await this.db
      .select({ value: count() })
      .from(userSessions)
      .where(and(eq(userSessions.tenantId, tenantId), isNull(userSessions.revokedAt)));

    const loginStats = await this.db
      .select({
        outcome: loginEvents.outcome,
        value: count(),
      })
      .from(loginEvents)
      .where(and(eq(loginEvents.tenantId, tenantId), gte(loginEvents.createdAt, since)))
      .groupBy(loginEvents.outcome);

    const [criticalEvents] = await this.db
      .select({ value: count() })
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.tenantId, tenantId),
          eq(securityEvents.severity, 'critical'),
          gte(securityEvents.createdAt, since),
        ),
      );

    const failedLogins24h = sumOutcome(loginStats, 'failure');
    const successfulLogins24h = sumOutcome(loginStats, 'success');
    const mfaChallenges24h =
      sumOutcome(loginStats, 'mfa_required') + sumOutcome(loginStats, 'mfa_success');

    return {
      activeSessions: sessions?.value ?? 0,
      failedLogins24h,
      successfulLogins24h,
      criticalEvents24h: criticalEvents?.value ?? 0,
      mfaChallenges24h,
    };
  }

  async getLoginAnalytics(tenantId: string, days = 7): Promise<LoginAnalyticsPoint[]> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = await this.db
      .select({
        outcome: loginEvents.outcome,
        value: count(),
      })
      .from(loginEvents)
      .where(and(eq(loginEvents.tenantId, tenantId), gte(loginEvents.createdAt, since)))
      .groupBy(loginEvents.outcome);

    return rows.map((row) => ({
      outcome: row.outcome,
      count: row.value,
    }));
  }

  async getFailedLoginReport(tenantId: string, limit = 50) {
    return this.db
      .select()
      .from(loginEvents)
      .where(
        and(eq(loginEvents.tenantId, tenantId), eq(loginEvents.outcome, 'failure')),
      )
      .orderBy(sql`${loginEvents.createdAt} DESC`)
      .limit(limit);
  }

  async getActiveSessions(tenantId: string) {
    return this.db
      .select()
      .from(userSessions)
      .where(and(eq(userSessions.tenantId, tenantId), isNull(userSessions.revokedAt)))
      .orderBy(sql`${userSessions.lastSeenAt} DESC`);
  }
}

function sumOutcome(
  rows: readonly { outcome: string; value: number | bigint }[],
  outcome: string,
): number {
  const row = rows.find((entry) => entry.outcome === outcome);
  return Number(row?.value ?? 0);
}
