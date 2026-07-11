import { getTenantScopedDb } from '../common/tenant/tenant-context.store.js';

import type { DrizzleDb } from './database.module.js';

/** Returns tenant transaction db when RLS context is active, otherwise global pool db */
export function createTenantAwareDb(globalDb: DrizzleDb): DrizzleDb {
  return new Proxy(globalDb, {
    get(target, prop) {
      const activeDb = getTenantScopedDb(target);
      const value = activeDb[prop as keyof DrizzleDb];
      if (typeof value === 'function') {
        return (value as (...args: unknown[]) => unknown).bind(activeDb);
      }
      return value;
    },
  });
}
