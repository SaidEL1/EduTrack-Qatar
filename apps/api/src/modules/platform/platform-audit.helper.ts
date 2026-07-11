import type { AuditLogEntry } from '../audit/audit.service.js';

export function buildAuditEntry(
  base: Omit<AuditLogEntry, 'correlationId' | 'beforeState' | 'afterState'> & {
    readonly beforeState?: Record<string, unknown>;
    readonly afterState?: Record<string, unknown>;
  },
  correlationId?: string,
): AuditLogEntry {
  return {
    tenantId: base.tenantId,
    action: base.action,
    entityType: base.entityType,
    entityId: base.entityId,
    ...(base.actorId !== undefined ? { actorId: base.actorId } : {}),
    ...(base.beforeState !== undefined ? { beforeState: base.beforeState } : {}),
    ...(base.afterState !== undefined ? { afterState: base.afterState } : {}),
    ...(correlationId !== undefined ? { correlationId } : {}),
  };
}
