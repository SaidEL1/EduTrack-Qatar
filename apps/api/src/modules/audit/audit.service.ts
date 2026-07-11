import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, type DrizzleDb } from '../../database/database.module.js';
import { auditLogs } from '../../database/schema/index.js';

export interface AuditLogEntry {
  readonly tenantId: string;
  readonly actorId?: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly beforeState?: Record<string, unknown>;
  readonly afterState?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly correlationId?: string;
}

/** Append-only audit trail — FR-SET-008, NFR-LOG-002, AC-SET-002 */
@Injectable()
export class AuditService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  async append(entry: AuditLogEntry): Promise<void> {
    await this.db.insert(auditLogs).values({
      tenantId: entry.tenantId,
      actorId: entry.actorId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      beforeState: entry.beforeState,
      afterState: entry.afterState,
      ipAddress: entry.ipAddress,
      correlationId: entry.correlationId,
    });
  }

  async listByTenant(tenantId: string, limit = 50) {
    return this.db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.tenantId, tenantId))
      .limit(limit);
  }
}
