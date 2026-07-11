# Sprint 0 Verification Checklist

**Sprint:** 0 — Foundation  
**Blueprint:** EDU-BP-007  
**Acceptance:** `turbo build` passes; CI green; onboarding <4h; README per app; no secrets in repo

## Monorepo & workspaces

- [x] Turborepo monorepo at repository root
- [x] `pnpm-workspace.yaml` includes `apps/*`, `packages/*`, `workers/*`
- [x] All 8 apps scaffolded with README
- [x] Both workers scaffolded with README
- [x] All shared packages present

## Tooling

- [x] TypeScript strict via `@edutrack/typescript-config`
- [x] ESLint flat config with boundary rules
- [x] Prettier configured
- [x] Husky pre-commit + commit-msg hooks
- [x] lint-staged on staged files
- [x] Commitlint conventional commits
- [x] Changesets configured

## CI/CD

- [x] GitHub Actions `ci.yml`: format, lint, typecheck, test, build
- [x] Boundary verification job
- [x] Gitleaks secret scan

## Testing

- [x] Jest preset `@edutrack/jest-config`
- [x] Unit tests for shared, domain, logging, config, api-client, i18n
- [x] `pnpm test` passes

## Local development

- [x] Docker Compose: Postgres 16 + Redis 7
- [x] `.env.example` documented
- [x] `docs/runbooks/LOCAL_DEVELOPMENT.md`

## Foundations

- [x] `@edutrack/logging` — structured Pino logger
- [x] `@edutrack/shared` — Result type, EduTrackError
- [x] `@edutrack/config` — Zod env validation, SecretsProvider
- [x] `@edutrack/domain` — EntityId, ValueObject, AggregateRoot

## Documentation

- [x] Root README
- [x] Developer onboarding guide
- [x] Coding standards, naming, imports
- [x] Architecture folders guide
- [x] Secrets management guide
- [x] VS Code workspace (`edutrack.code-workspace`)

## Validation commands

```bash
pnpm install
pnpm build
pnpm lint
pnpm test
pnpm typecheck
pnpm format:check
node scripts/verify-workspace-boundaries.mjs
```

## Sign-off

| Role                | Name | Date | Status  |
| ------------------- | ---- | ---- | ------- |
| VP Engineering      |      |      | Pending |
| Principal Architect |      |      | Pending |
| DevOps Lead         |      |      | Pending |
| QA Lead             |      |      | Pending |

**Ready for Sprint 1?** Engineering complete — pending sign-off above.
