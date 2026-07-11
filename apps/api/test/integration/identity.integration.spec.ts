import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Global, Module } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { DRIZZLE } from '../../src/database/database.module.js';
import * as schema from '../../src/database/schema/index.js';
import { AuditModule } from '../../src/modules/audit/audit.module.js';
import { AuthService } from '../../src/modules/identity/application/auth.service.js';
import { UserManagementService } from '../../src/modules/identity/application/user-management.service.js';
import { IdentityModule } from '../../src/modules/identity/identity.module.js';
import { RbacRepository } from '../../src/modules/identity/infrastructure/rbac.repository.js';
import { PlatformService } from '../../src/modules/platform/platform.service.js';
import { PermissionEngine } from '../../src/modules/security/permission-engine.service.js';
import { ensureTestJwtKeys, TEST_PASSWORD } from '../helpers/jwt-test-keys.js';

const DATABASE_URL = process.env['DATABASE_URL'];
const describeIntegration = DATABASE_URL ? describe : describe.skip;

function createTestDatabaseModule(db: ReturnType<typeof drizzle>): new () => object {
  @Global()
  @Module({
    providers: [{ provide: DRIZZLE, useValue: db }],
    exports: [DRIZZLE],
  })
  class TestDatabaseModule {}
  return TestDatabaseModule;
}

describeIntegration('Identity integration (requires DATABASE_URL)', () => {
  let platformService: PlatformService;
  let authService: AuthService;
  let userManagementService: UserManagementService;
  let rbacRepository: RbacRepository;
  let permissionEngine: PermissionEngine;
  let sql: postgres.Sql;
  let tenantId = '';
  let adminUserId = '';
  let adminRoleId = '';

  beforeAll(async () => {
    ensureTestJwtKeys();

    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL is required');
    }

    const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    execSync('tsx src/database/migrate/run-migrations.ts', {
      cwd: apiRoot,
      env: { ...process.env, DATABASE_URL },
      stdio: 'inherit',
    });
    execSync('tsx src/database/seed/run-seed.ts', {
      cwd: apiRoot,
      env: { ...process.env, DATABASE_URL },
      stdio: 'inherit',
    });

    sql = postgres(DATABASE_URL, { max: 5 });
    const db = drizzle(sql, { schema });

    const TestDatabaseModule = createTestDatabaseModule(db);

    const module: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule, AuditModule, IdentityModule],
      providers: [PlatformService, PermissionEngine],
    })
      .overrideProvider('REDIS_URL')
      .useValue(undefined)
      .compile();

    platformService = module.get(PlatformService);
    authService = module.get(AuthService);
    userManagementService = module.get(UserManagementService);
    rbacRepository = module.get(RbacRepository);
    permissionEngine = module.get(PermissionEngine);

    const tenant = await platformService.createTenant({
      slug: `identity-${String(Date.now())}`,
      name: 'Identity Test Tenant',
    });
    tenantId = tenant.id;

    const roles = await rbacRepository.listRoles(tenantId);
    adminRoleId = roles.find((role) => role.code === 'tenant_admin')?.id ?? '';

    const admin = await userManagementService.createUser({
      tenantId,
      email: `admin-${String(Date.now())}@test.qa`,
      password: TEST_PASSWORD,
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRoleId,
    });
    adminUserId = admin.id;
  });

  afterAll(async () => {
    if (tenantId) {
      await sql`DELETE FROM tenants WHERE id = ${tenantId}`;
    }
    await sql.end({ timeout: 5 });
  });

  it('authenticates active user and issues tokens', async () => {
    const user = await userManagementService.getUser(tenantId, adminUserId);

    const tokens = await authService.login({
      email: user.email,
      password: TEST_PASSWORD,
      tenantId,
    });

    expect(tokens.accessToken).toBeDefined();
    expect(tokens.refreshToken).toBeDefined();
    expect(tokens.tokenType).toBe('Bearer');
  });

  it('rotates refresh tokens', async () => {
    const user = await userManagementService.getUser(tenantId, adminUserId);
    const initial = await authService.login({
      email: user.email,
      password: TEST_PASSWORD,
      tenantId,
    });

    expect(initial.refreshToken).toEqual(expect.any(String));
    const rotated = await authService.refresh(String(initial.refreshToken));
    expect(rotated.accessToken).toBeDefined();
    expect(rotated.refreshToken).not.toBe(initial.refreshToken);
  });

  it('enforces RBAC from persisted roles', async () => {
    await expect(
      permissionEngine.assertPermission(tenantId, 'platform.school.read', adminUserId),
    ).resolves.toBeUndefined();

    await expect(
      permissionEngine.assertPermission(
        tenantId,
        'platform.school.read',
        '00000000-0000-0000-0000-000000000001',
      ),
    ).rejects.toThrow('Missing permission');
  });

  it('deactivates and blocks login', async () => {
    const email = `inactive-${String(Date.now())}@test.qa`;
    const user = await userManagementService.createUser({
      tenantId,
      email,
      password: TEST_PASSWORD,
      firstName: 'Inactive',
      lastName: 'User',
    });

    await userManagementService.deactivateUser(tenantId, user.id);

    await expect(
      authService.login({ email, password: TEST_PASSWORD, tenantId }),
    ).rejects.toThrow('Account is inactive');
  });
});
