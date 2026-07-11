/**
 * HTTP smoke test for Sprint 2A Identity Core.
 * Requires: Docker Postgres + Redis, migrations, seed, and API running on PORT (default 3000).
 */
/* eslint-disable no-console -- CLI smoke script */
const BASE_URL = process.env['SMOKE_BASE_URL'] ?? 'http://localhost:3000/v1';
const TENANT_HEADER = 'x-tenant-id';

interface BootstrapData {
  tenantId: string;
  adminEmail: string;
  adminPassword: string;
  adminRoleId: string;
}

function loadBootstrap(): BootstrapData {
  const raw = process.env['SMOKE_BOOTSTRAP_JSON'];
  if (!raw) {
    throw new Error('Set SMOKE_BOOTSTRAP_JSON (run identity-smoke-bootstrap.ts first)');
  }
  return JSON.parse(raw) as BootstrapData;
}

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    token?: string;
    tenantId?: string;
    expectStatus?: number;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  if (options.tenantId) {
    headers[TENANT_HEADER] = options.tenantId;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  const text = await response.text();
  const expected = options.expectStatus;
  const ok =
    expected !== undefined
      ? response.status === expected
      : response.status >= 200 && response.status < 300;

  if (!ok) {
    const expectedLabel = expected !== undefined ? String(expected) : '2xx';
    throw new Error(
      `${method} ${path} expected ${expectedLabel}, got ${String(response.status)}: ${text}`,
    );
  }

  if (response.status === 204 || text.length === 0) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

async function main(): Promise<void> {
  const bootstrap = loadBootstrap();
  const { tenantId, adminEmail, adminPassword, adminRoleId } = bootstrap;

  console.log('1. Login');
  const login = await request<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }>('POST', '/auth/login', {
    body: { email: adminEmail, password: adminPassword, tenantId },
    tenantId,
  });
  console.log('   OK — tokenType:', login.tokenType, 'expiresIn:', login.expiresIn);

  console.log('2. Refresh');
  const refreshed = await request<{
    accessToken: string;
    refreshToken: string;
  }>('POST', '/auth/refresh', {
    body: { refreshToken: login.refreshToken },
  });
  console.log('   OK — rotated refresh token');

  console.log('3. Protected endpoint (list roles)');
  const roles = await request<{ id: string; code: string }[]>(
    'GET',
    '/identity/roles',
    {
      token: refreshed.accessToken,
      tenantId,
    },
  );
  console.log('   OK — roles:', roles.map((r) => r.code).join(', '));

  console.log('4. Create user');
  const newEmail = `smoke-${String(Date.now())}@test.qa`;
  const created = await request<{ id: string; email: string }>(
    'POST',
    '/identity/users',
    {
      token: refreshed.accessToken,
      tenantId,
      body: {
        email: newEmail,
        password: adminPassword,
        firstName: 'Smoke',
        lastName: 'User',
      },
      expectStatus: 201,
    },
  );
  console.log('   OK — userId:', created.id);

  console.log('5. Assign role');
  await request('POST', `/identity/users/${created.id}/roles`, {
    token: refreshed.accessToken,
    tenantId,
    body: { roleId: adminRoleId },
    expectStatus: 201,
  });
  console.log('   OK — role assigned');

  console.log('6. Logout');
  await request('POST', '/auth/logout', {
    body: { refreshToken: refreshed.refreshToken },
  });
  console.log('   OK — session revoked');

  console.log('7. Swagger docs reachable');
  const docs = await fetch(`${BASE_URL}/docs-json`);
  if (!docs.ok) {
    throw new Error(`Swagger docs not reachable: ${String(docs.status)}`);
  }
  console.log('   OK — /v1/docs-json');

  console.log('\nAll identity smoke checks passed.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
