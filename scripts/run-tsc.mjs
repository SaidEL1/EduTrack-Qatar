#!/usr/bin/env node
/** Invokes the TypeScript compiler without Windows .CMD shims (paths with spaces). */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(path.dirname(fileURLToPath(import.meta.url)));
const tscPath = require.resolve('typescript/bin/tsc');

const result = spawnSync(process.execPath, [tscPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  windowsHide: true,
});

process.exit(result.status ?? 1);
