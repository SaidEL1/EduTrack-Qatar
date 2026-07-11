import { Test, type TestingModule } from '@nestjs/testing';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { DRIZZLE } from '../../src/database/database.module.js';
import * as schema from '../../src/database/schema/index.js';
import { AuditService } from '../../src/modules/audit/audit.service.js';
import { PermissionCacheService } from '../../src/modules/identity/infrastructure/permission-cache.service.js';
import { RbacRepository } from '../../src/modules/identity/infrastructure/rbac.repository.js';
import { PlatformService } from '../../src/modules/platform/platform.service.js';

const DATABASE_URL = process.env['DATABASE_URL'];
const describeIntegration = DATABASE_URL ? describe : describe.skip;

describeIntegration('Platform integration (requires DATABASE_URL)', () => {
  let platformService: PlatformService;
  let auditService: AuditService;
  let sql: postgres.Sql;
  let tenantA = '';
  let tenantB = '';

  beforeAll(async () => {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL is required for integration tests');
    }

    sql = postgres(DATABASE_URL, { max: 5 });
    const db = drizzle(sql, { schema });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformService,
        AuditService,
        RbacRepository,
        { provide: 'REDIS_URL', useValue: undefined },
        PermissionCacheService,
        { provide: DRIZZLE, useValue: db },
      ],
    }).compile();

    platformService = module.get(PlatformService);
    auditService = module.get(AuditService);

    const a = await platformService.createTenant({
      slug: `tenant-a-${String(Date.now())}`,
      name: 'Tenant A',
    });
    const b = await platformService.createTenant({
      slug: `tenant-b-${String(Date.now())}`,
      name: 'Tenant B',
    });
    tenantA = a.id;
    tenantB = b.id;
  });

  afterAll(async () => {
    if (tenantA) {
      await sql`DELETE FROM tenants WHERE id = ${tenantA}`;
    }
    if (tenantB) {
      await sql`DELETE FROM tenants WHERE id = ${tenantB}`;
    }
    await sql.end({ timeout: 5 });
  });

  it('isolates tenant school profiles', async () => {
    await platformService.upsertSchool({ tenantId: tenantA, name: 'School A' });
    await platformService.upsertSchool({ tenantId: tenantB, name: 'School B' });

    const schoolA = await platformService.getSchool(tenantA);
    const schoolB = await platformService.getSchool(tenantB);

    expect(schoolA.name).toBe('School A');
    expect(schoolB.name).toBe('School B');
    expect(schoolA.tenantId).toBe(tenantA);
    expect(schoolB.tenantId).not.toBe(tenantA);
  });

  it('writes audit log on settings change (AC-SET-002)', async () => {
    await platformService.upsertSetting(tenantA, 'locale', { default: 'en-QA' });
    const logs = await auditService.listByTenant(tenantA, 20);
    expect(logs.some((entry) => entry.action === 'settings.created')).toBe(true);
  });
});
