import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';

import { tenantContextStore } from '../../../common/tenant/tenant-context.store.js';
import { DRIZZLE, type DrizzleDb } from '../../../database/database.module.js';

/** Sets PostgreSQL RLS tenant context within a transaction — ADR-S2B-002 / ADR-S2C-001 */
@Injectable()
export class TenantRlsService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async runInTenantContext<T>(tenantId: string, fn: () => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
      );
      return tenantContextStore.run({ tenantId, db: tx }, fn);
    });
  }

  async withTenantContext<T>(
    tenantId: string,
    fn: (db: DrizzleDb) => Promise<T>,
  ): Promise<T> {
    return this.runInTenantContext(tenantId, () => fn(getScopedDb()));
  }

  async verifyTenantIsolation(
    tenantId: string,
    otherTenantId: string,
    tableName: 'organization_members' | 'user_sessions' | 'invitations',
  ): Promise<{ ownCount: number; otherCount: number }> {
    const ownCount = await this.withTenantContext(tenantId, async (db) => {
      const rows = await db.execute(
        sql.raw(`SELECT count(*)::int AS count FROM ${tableName}`),
      );
      return (rows[0] as { count: number } | undefined)?.count ?? 0;
    });

    const otherCount = await this.withTenantContext(otherTenantId, async (db) => {
      const rows = await db.execute(
        sql.raw(`SELECT count(*)::int AS count FROM ${tableName}`),
      );
      return (rows[0] as { count: number } | undefined)?.count ?? 0;
    });

    return { ownCount, otherCount };
  }
}

function getScopedDb(): DrizzleDb {
  const store = tenantContextStore.getStore();
  if (!store) {
    throw new Error('Tenant RLS context is not active');
  }
  return store.db;
}
