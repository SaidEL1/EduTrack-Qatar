# Developer Onboarding

**Target:** New engineer productive in **< 4 hours** (EDU-BP-007 Sprint 0 acceptance).

## 1. Access (30 min)

- GitHub org access with 2FA
- AWS account read access (DevOps — Sprint 1+)
- Slack / project channels

## 2. Workstation setup (45 min)

```bash
# Node via nvm
nvm install
nvm use

# Enable pnpm
corepack enable
corepack prepare pnpm@9.15.0 --activate

# Clone and install
git clone <repo-url> edutrack
cd edutrack
pnpm install
```

Install recommended VS Code extensions: open `edutrack.code-workspace`.

## 3. Local services (15 min)

```bash
cp .env.example .env.local
docker compose up -d
docker compose ps   # postgres + redis healthy
```

## 4. Verify toolchain (30 min)

```bash
pnpm build
pnpm lint
pnpm test
pnpm typecheck
pnpm format:check
node scripts/verify-workspace-boundaries.mjs
```

All commands must pass before opening your first PR.

## 5. Read engineering standards (60 min)

1. `docs/engineering/CODING_STANDARDS.md`
2. `docs/engineering/NAMING_CONVENTIONS.md`
3. `docs/engineering/IMPORT_CONVENTIONS.md`
4. `docs/engineering/ARCHITECTURE_FOLDERS.md`
5. `docs/engineering/SECRETS_MANAGEMENT.md`
6. `docs/05_TECHNICAL_ARCHITECTURE.md` (skim modular monolith + tenant model)

## 6. Branching & commits (15 min)

- Branch from `develop`: `feat/api/tenant-crud` or `fix/shared/result-type`
- Conventional commits: `feat(shared): add correlation id type`
- Pre-commit: lint-staged + Husky
- PR targets `develop`; release merges to `main`

## 7. First task

Sprint 1 begins platform foundation (tenant model, audit log). Wait for Sprint 0 sign-off before picking Sprint 1 stories.

## Support

| Topic              | Contact             |
| ------------------ | ------------------- |
| Monorepo / tooling | Principal Architect |
| CI failures        | DevOps Lead         |
| Product scope      | Product Manager     |
