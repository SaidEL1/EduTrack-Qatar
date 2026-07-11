/* eslint-disable no-console -- CLI migration runner */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import postgres from 'postgres';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(rootDir, '../../../drizzle/migrations');

const DATABASE_URL =
  process.env['DATABASE_URL'] ??
  'postgresql://edutrack:edutrack_local_dev@localhost:5432/edutrack';

async function runMigrations(): Promise<void> {
  const sql = postgres(DATABASE_URL, { max: 1 });

  await sql`CREATE TABLE IF NOT EXISTS schema_migrations (
    id serial PRIMARY KEY,
    filename text NOT NULL UNIQUE,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`;

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const [existing] = await sql<{ filename: string }[]>`
      SELECT filename FROM schema_migrations WHERE filename = ${file}
    `;

    if (existing) {
      continue;
    }

    const contents = readFileSync(path.join(migrationsDir, file), 'utf8');
    await sql.unsafe(contents);
    await sql`INSERT INTO schema_migrations (filename) VALUES (${file})`;
    console.log(`Applied migration: ${file}`);
  }

  await sql.end({ timeout: 5 });
  console.log('Migrations complete');
}

runMigrations().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
