import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredApps = [
  'apps/api',
  'apps/admin-portal',
  'apps/teacher-portal',
  'apps/parent-portal',
  'apps/student-portal',
  'apps/parent-mobile',
  'apps/teacher-mobile',
  'apps/operator-console',
];

const requiredWorkers = ['workers/notification-worker', 'workers/report-worker'];

const requiredPackages = [
  'packages/shared',
  'packages/domain',
  'packages/logging',
  'packages/config',
  'packages/ui',
  'packages/i18n',
  'packages/api-client',
  'packages/eslint-config',
  'packages/typescript-config',
  'packages/jest-config',
];

const forbiddenInRepo = ['.env', '.env.local', 'credentials.json'];

function assertExists(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required path: ${rel}`);
  }
}

[...requiredApps, ...requiredWorkers, ...requiredPackages].forEach(assertExists);

for (const file of forbiddenInRepo) {
  const full = path.join(root, file);
  if (fs.existsSync(full)) {
    throw new Error(`Forbidden committed secret file detected: ${file}`);
  }
}

console.log('Workspace boundary verification passed.');
