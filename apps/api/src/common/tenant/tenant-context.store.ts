import { AsyncLocalStorage } from 'node:async_hooks';

import type { DrizzleDb } from '../../database/database.module.js';

export interface TenantContextState {
  readonly tenantId: string;
  readonly db: DrizzleDb;
}

/** Request-scoped PostgreSQL RLS tenant context — ADR-S2C-001 */
export const tenantContextStore = new AsyncLocalStorage<TenantContextState>();

export function getTenantContext(): TenantContextState | undefined {
  return tenantContextStore.getStore();
}

export function getTenantScopedDb(fallback: DrizzleDb): DrizzleDb {
  return tenantContextStore.getStore()?.db ?? fallback;
}

export function getActiveTenantId(): string | undefined {
  return tenantContextStore.getStore()?.tenantId;
}
