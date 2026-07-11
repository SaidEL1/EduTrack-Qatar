import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const apps = [
  {
    dir: 'apps/api',
    name: '@edutrack/api',
    service: 'api',
    desc: 'NestJS modular monolith',
    stack: 'nestjs',
    deps: ['@edutrack/domain', '@edutrack/logging', '@edutrack/config', '@edutrack/shared'],
  },
  {
    dir: 'apps/admin-portal',
    name: '@edutrack/admin-portal',
    service: 'admin-portal',
    desc: 'Next.js admin portal',
    stack: 'nextjs',
    deps: ['@edutrack/shared', '@edutrack/api-client'],
  },
  {
    dir: 'apps/teacher-portal',
    name: '@edutrack/teacher-portal',
    service: 'teacher-portal',
    desc: 'Next.js teacher portal + PWA',
    stack: 'nextjs',
    deps: ['@edutrack/shared', '@edutrack/api-client'],
  },
  {
    dir: 'apps/parent-portal',
    name: '@edutrack/parent-portal',
    service: 'parent-portal',
    desc: 'Next.js parent portal + PWA',
    stack: 'nextjs',
    deps: ['@edutrack/shared', '@edutrack/api-client'],
  },
  {
    dir: 'apps/student-portal',
    name: '@edutrack/student-portal',
    service: 'student-portal',
    desc: 'Next.js student portal (v1.1)',
    stack: 'nextjs',
    deps: ['@edutrack/shared', '@edutrack/api-client'],
  },
  {
    dir: 'apps/parent-mobile',
    name: '@edutrack/parent-mobile',
    service: 'parent-mobile',
    desc: 'React Native parent app',
    stack: 'react-native',
    deps: ['@edutrack/shared', '@edutrack/api-client'],
  },
  {
    dir: 'apps/teacher-mobile',
    name: '@edutrack/teacher-mobile',
    service: 'teacher-mobile',
    desc: 'React Native teacher app',
    stack: 'react-native',
    deps: ['@edutrack/shared', '@edutrack/api-client'],
  },
  {
    dir: 'apps/operator-console',
    name: '@edutrack/operator-console',
    service: 'operator-console',
    desc: 'Next.js internal operator console',
    stack: 'nextjs',
    deps: ['@edutrack/shared', '@edutrack/api-client'],
  },
];

const workers = [
  {
    dir: 'workers/notification-worker',
    name: '@edutrack/notification-worker',
    service: 'notification-worker',
    desc: 'Async notification delivery worker',
    stack: 'node',
    deps: ['@edutrack/logging', '@edutrack/config', '@edutrack/shared'],
  },
  {
    dir: 'workers/report-worker',
    name: '@edutrack/report-worker',
    service: 'report-worker',
    desc: 'Async report generation worker',
    stack: 'node',
    deps: ['@edutrack/logging', '@edutrack/config', '@edutrack/shared'],
  },
];

function writeFile(rel, content) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

function createWorkspace(entry) {
  const { dir, name, service, desc, stack } = entry;
  const tsExt =
    stack === 'nestjs'
      ? 'nestjs'
      : stack === 'nextjs'
        ? 'nextjs'
        : stack === 'react-native'
          ? 'react-native'
          : 'node';
  const eslintExt = stack === 'nestjs' ? 'nestjs' : stack === 'nextjs' ? 'nextjs' : 'node';

  const dependencies = Object.fromEntries(
    entry.deps.map((dep) => [dep, 'workspace:*']),
  );

  const pkg = {
    name,
    version: '0.0.0',
    private: true,
    license: 'UNLICENSED',
    type: 'module',
    description: desc,
    scripts: {
      build: 'tsc -p tsconfig.build.json',
      dev: 'tsc -p tsconfig.build.json --watch',
      lint: 'eslint .',
      'lint:fix': 'eslint . --fix',
      typecheck: 'tsc -p tsconfig.json --noEmit',
      test: 'jest --passWithNoTests',
      'test:coverage': 'jest --coverage --passWithNoTests',
      clean: 'rimraf dist coverage',
    },
    dependencies,
    devDependencies: {
      '@edutrack/eslint-config': 'workspace:*',
      '@edutrack/jest-config': 'workspace:*',
      '@edutrack/typescript-config': 'workspace:*',
      '@types/jest': '^29.5.14',
      '@types/node': '^22.10.2',
      eslint: '^9.17.0',
      jest: '^29.7.0',
      rimraf: '^6.0.1',
      typescript: '^5.7.2',
    },
  };

  writeFile(`${dir}/package.json`, `${JSON.stringify(pkg, null, 2)}\n`);

  writeFile(
    `${dir}/tsconfig.json`,
    `{
  "extends": "@edutrack/typescript-config/${tsExt}.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["dist", "node_modules"]
}
`,
  );

  writeFile(`${dir}/tsconfig.build.json`, `{
  "extends": "./tsconfig.json"
}
`);

  writeFile(
    `${dir}/eslint.config.js`,
    `import config from '@edutrack/eslint-config/${eslintExt}';

export default [
  ...config,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
`,
  );

  writeFile(
    `${dir}/jest.config.js`,
    `import base from '@edutrack/jest-config/node';

export default {
  ...base,
  displayName: '${name}',
  rootDir: '.',
  passWithNoTests: true,
};
`,
  );

  writeFile(
    `${dir}/src/index.ts`,
    `/** Workspace boundary marker — ${desc} (Sprint 0) */
export const SERVICE_NAME = '${service}' as const;
`,
  );

  writeFile(
    `${dir}/README.md`,
    `# ${name}

${desc}

## Sprint 0 status

Engineering workspace shell only. Feature implementation begins in later sprints per EDU-BP-007.

## Scripts

- \`pnpm build\` — compile TypeScript boundary module
- \`pnpm lint\` — ESLint with workspace boundary rules
- \`pnpm test\` — Jest (passes with no tests in Sprint 0)

## Architecture

See \`docs/engineering/ARCHITECTURE_FOLDERS.md\`.
`,
  );
}

[...apps, ...workers].forEach(createWorkspace);

const apiDirs = [
  'apps/api/src/modules',
  'apps/api/src/shared/domain',
  'apps/api/src/shared/application',
  'apps/api/src/shared/infrastructure',
  'apps/api/src/shared/presentation',
];
apiDirs.forEach((d) => writeFile(`${d}/.gitkeep`, ''));

console.log(`Created ${apps.length + workers.length} workspaces`);
