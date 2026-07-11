/**
 * Bootstraps tenant + admin user for HTTP smoke tests (no HTTP auth required).
 */
/* eslint-disable no-console -- CLI bootstrap script outputs JSON to stdout */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '../src/database/schema/index.js';
import { AuditService } from '../src/modules/audit/audit.service.js';
import { UserManagementService } from '../src/modules/identity/application/user-management.service.js';
import { PasswordHasherService } from '../src/modules/identity/infrastructure/password-hasher.service.js';
import { PermissionCacheService } from '../src/modules/identity/infrastructure/permission-cache.service.js';
import { RbacRepository } from '../src/modules/identity/infrastructure/rbac.repository.js';
import { PlatformService } from '../src/modules/platform/platform.service.js';
import { ensureTestJwtKeys, TEST_PASSWORD } from '../test/helpers/jwt-test-keys.js';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

ensureTestJwtKeys();

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
execSync('tsx src/database/migrate/run-migrations.ts', {
  cwd: apiRoot,
  env: process.env,
  stdio: 'inherit',
});
execSync('tsx src/database/seed/run-seed.ts', {
  cwd: apiRoot,
  env: process.env,
  stdio: 'inherit',
});

const sql = postgres(DATABASE_URL, { max: 5 });
const db = drizzle(sql, { schema });

const auditService = new AuditService(db);
const permissionCache = new PermissionCacheService(process.env['REDIS_URL']);
const rbacRepository = new RbacRepository(db, permissionCache);
const passwordHasher = new PasswordHasherService();
const platformService = new PlatformService(db, auditService, rbacRepository);
const userManagementService = new UserManagementService(
  db,
  passwordHasher,
  rbacRepository,
  auditService,
);

const slug = `smoke-${String(Date.now())}`;
const tenant = await platformService.createTenant({
  slug,
  name: 'Smoke Test Tenant',
});

const roles = await rbacRepository.listRoles(tenant.id);
const adminRoleId = roles.find((role) => role.code === 'tenant_admin')?.id ?? '';

const adminEmail = `admin-${slug}@test.qa`;
const admin = await userManagementService.createUser({
  tenantId: tenant.id,
  email: adminEmail,
  password: TEST_PASSWORD,
  firstName: 'Smoke',
  lastName: 'Admin',
  roleId: adminRoleId,
});

await sql.end({ timeout: 5 });
await permissionCache.onModuleDestroy();

console.log(
  JSON.stringify({
    tenantId: tenant.id,
    adminEmail,
    adminPassword: TEST_PASSWORD,
    adminRoleId,
    adminUserId: admin.id,
  }),
);
