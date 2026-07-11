import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';
import { tenantSecurityPolicies } from '../../../database/schema/index.js';

export interface TenantSecurityPolicyRecord {
  readonly tenantId: string;
  readonly mfaRequired: boolean;
  readonly passwordMinLength: number;
  readonly passwordExpiryDays: number;
  readonly passwordHistoryCount: number;
  readonly maxActiveSessions: number;
  readonly sessionIdleTimeoutMinutes: number;
}

export const DEFAULT_TENANT_SECURITY_POLICY: Omit<
  TenantSecurityPolicyRecord,
  'tenantId'
> = {
  mfaRequired: false,
  passwordMinLength: 12,
  passwordExpiryDays: 90,
  passwordHistoryCount: 5,
  maxActiveSessions: 10,
  sessionIdleTimeoutMinutes: 480,
};

@Injectable()
export class TenantSecurityPolicyRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async findByTenantId(tenantId: string): Promise<TenantSecurityPolicyRecord | null> {
    const [row] = await this.db
      .select()
      .from(tenantSecurityPolicies)
      .where(eq(tenantSecurityPolicies.tenantId, tenantId));
    if (!row) {
      return null;
    }
    return mapRow(row);
  }

  async createDefaults(tenantId: string): Promise<TenantSecurityPolicyRecord> {
    const [row] = await this.db
      .insert(tenantSecurityPolicies)
      .values({ tenantId, ...DEFAULT_TENANT_SECURITY_POLICY })
      .returning();
    if (!row) {
      throw new Error('Failed to create tenant security policy');
    }
    return mapRow(row);
  }

  async upsert(
    tenantId: string,
    input: Partial<Omit<TenantSecurityPolicyRecord, 'tenantId'>>,
  ): Promise<TenantSecurityPolicyRecord> {
    const existing = await this.findByTenantId(tenantId);
    if (!existing) {
      const [row] = await this.db
        .insert(tenantSecurityPolicies)
        .values({
          tenantId,
          ...DEFAULT_TENANT_SECURITY_POLICY,
          ...input,
        })
        .returning();
      if (!row) {
        throw new Error('Failed to create tenant security policy');
      }
      return mapRow(row);
    }

    const [row] = await this.db
      .update(tenantSecurityPolicies)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(tenantSecurityPolicies.tenantId, tenantId))
      .returning();
    if (!row) {
      throw new Error('Failed to update tenant security policy');
    }
    return mapRow(row);
  }
}

function mapRow(
  row: typeof tenantSecurityPolicies.$inferSelect,
): TenantSecurityPolicyRecord {
  return {
    tenantId: row.tenantId,
    mfaRequired: row.mfaRequired,
    passwordMinLength: row.passwordMinLength,
    passwordExpiryDays: row.passwordExpiryDays,
    passwordHistoryCount: row.passwordHistoryCount,
    maxActiveSessions: row.maxActiveSessions,
    sessionIdleTimeoutMinutes: row.sessionIdleTimeoutMinutes,
  };
}
