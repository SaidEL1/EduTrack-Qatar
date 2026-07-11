/* eslint-disable no-console -- CLI seed runner */
import postgres from 'postgres';

import { DEFAULT_IDENTITY_PERMISSIONS } from '../../modules/identity/permissions/identity.permissions.js';
import { DEFAULT_PLATFORM_PERMISSIONS } from '../../modules/security/permissions/platform.permissions.js';

const DATABASE_URL =
  process.env['DATABASE_URL'] ??
  'postgresql://edutrack:edutrack_local_dev@localhost:5432/edutrack';

async function runSeed(): Promise<void> {
  const sql = postgres(DATABASE_URL, { max: 1 });

  const allPermissions = [
    ...DEFAULT_PLATFORM_PERMISSIONS,
    ...DEFAULT_IDENTITY_PERMISSIONS,
  ];

  for (const code of allPermissions) {
    const moduleName = code.startsWith('identity.') ? 'identity' : 'platform';
    await sql`
      INSERT INTO permissions (code, description, module)
      VALUES (${code}, ${`Permission ${code}`}, ${moduleName})
      ON CONFLICT (code) DO NOTHING
    `;
  }

  await sql.end({ timeout: 5 });
  console.log('Seed complete: platform + identity permissions');
}

runSeed().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
