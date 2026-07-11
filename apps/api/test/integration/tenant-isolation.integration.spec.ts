import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Test, type TestingModule } from '@nestjs/testing';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { DRIZZLE } from '../../src/database/database.module.js';
import * as schema from '../../src/database/schema/index.js';
import {
  organizationMembers,
  tenants,
  users,
} from '../../src/database/schema/index.js';
import { TenantRlsService } from '../../src/modules/identity/infrastructure/tenant-rls.service.js';

const DATABASE_URL = process.env['DATABASE_URL'];
const describeIntegration = DATABASE_URL ? describe : describe.skip;

interface RoleCapabilities {
  readonly bypassesRls: boolean;
}

interface RlsTableState {
  readonly rowSecurity: boolean;
  readonly forceRowSecurity: boolean;
}

describeIntegration('Tenant isolation integration (requires DATABASE_URL)', () => {
  let tenantRlsService: TenantRlsService;
  let sqlClient: postgres.Sql;
  let db: ReturnType<typeof drizzle>;
  let tenantA = '';
  let tenantB = '';
  let userA = '';
  let roleCapabilities: RoleCapabilities = { bypassesRls: true };

  beforeAll(async () => {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL is required');
    }

    const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    execSync('tsx src/database/migrate/run-migrations.ts', {
      cwd: apiRoot,
      env: { ...process.env, DATABASE_URL },
      stdio: 'inherit',
    });

    sqlClient = postgres(DATABASE_URL, { max: 5 });
    db = drizzle(sqlClient, { schema });

    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantRlsService, { provide: DRIZZLE, useValue: db }],
    }).compile();

    tenantRlsService = module.get(TenantRlsService);
    roleCapabilities = await readRoleCapabilities(db);

    const [a] = await db
      .insert(tenants)
      .values({
        slug: `iso-a-${String(Date.now())}`,
        name: 'Tenant A',
        status: 'active',
      })
      .returning();
    const [b] = await db
      .insert(tenants)
      .values({
        slug: `iso-b-${String(Date.now() + 1)}`,
        name: 'Tenant B',
        status: 'active',
      })
      .returning();

    tenantA = a?.id ?? '';
    tenantB = b?.id ?? '';

    const [user] = await db
      .insert(users)
      .values({
        email: `iso-user-${String(Date.now())}@test.qa`,
        passwordHash: 'hash',
        status: 'active',
      })
      .returning();
    userA = user?.id ?? '';

    await db.insert(organizationMembers).values([
      { tenantId: tenantA, userId: userA, status: 'active', joinedAt: new Date() },
      { tenantId: tenantB, userId: userA, status: 'active', joinedAt: new Date() },
    ]);
  });

  afterAll(async () => {
    if (userA) {
      await sqlClient`DELETE FROM organization_members WHERE user_id = ${userA}`;
      await sqlClient`DELETE FROM users WHERE id = ${userA}`;
    }
    if (tenantA) {
      await sqlClient`DELETE FROM tenants WHERE id IN (${tenantA}, ${tenantB})`;
    }
    await sqlClient.end({ timeout: 5 });
  });

  it('sets PostgreSQL tenant session variable inside RLS transaction', async () => {
    await tenantRlsService.withTenantContext(tenantA, async (scopedDb) => {
      const rows = await scopedDb.execute<{ tenant_id: string }>(
        sql`SELECT current_setting('app.current_tenant_id', true) AS tenant_id`,
      );
      expect(rows[0]?.tenant_id).toBe(tenantA);
    });
  });

  it('enables forced row level security on tenant-scoped tables', async () => {
    const state = await readRlsTableState(db, 'organization_members');
    expect(state.rowSecurity).toBe(true);
    expect(state.forceRowSecurity).toBe(true);
  });

  it('prevents cross-tenant reads when database role honors RLS', async () => {
    if (roleCapabilities.bypassesRls) {
      const policyCount = await countTenantPolicies(db, 'organization_members');
      expect(policyCount).toBeGreaterThan(0);
      return;
    }

    const rowsA = await tenantRlsService.withTenantContext(tenantA, async (scopedDb) =>
      scopedDb.select().from(organizationMembers),
    );
    expect(rowsA.every((row) => row.tenantId === tenantA)).toBe(true);

    const isolation = await tenantRlsService.verifyTenantIsolation(
      tenantA,
      tenantB,
      'organization_members',
    );
    expect(isolation.ownCount).toBeGreaterThan(0);
    expect(isolation.otherCount).toBeGreaterThan(0);
    expect(isolation.ownCount).not.toBe(isolation.otherCount);
  });
});

async function readRoleCapabilities(
  db: ReturnType<typeof drizzle>,
): Promise<RoleCapabilities> {
  const rows = await db.execute<{ rolsuper: boolean; rolbypassrls: boolean }>(sql`
    SELECT rolsuper, rolbypassrls
    FROM pg_roles
    WHERE rolname = current_user
  `);
  const role = rows[0];
  return {
    bypassesRls: Boolean(role?.rolsuper ?? role?.rolbypassrls),
  };
}

async function readRlsTableState(
  db: ReturnType<typeof drizzle>,
  tableName: string,
): Promise<RlsTableState> {
  const rows = await db.execute<{
    relrowsecurity: boolean;
    relforcerowsecurity: boolean;
  }>(sql`
    SELECT relrowsecurity, relforcerowsecurity
    FROM pg_class
    WHERE relname = ${tableName}
  `);
  const table = rows[0];
  return {
    rowSecurity: Boolean(table?.relrowsecurity),
    forceRowSecurity: Boolean(table?.relforcerowsecurity),
  };
}

async function countTenantPolicies(
  db: ReturnType<typeof drizzle>,
  tableName: string,
): Promise<number> {
  const rows = await db.execute<{ count: number }>(sql`
    SELECT count(*)::int AS count
    FROM pg_policies
    WHERE tablename = ${tableName}
  `);
  return rows[0]?.count ?? 0;
}
