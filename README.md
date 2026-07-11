# EduTrack

**The Operating System for Modern Schools** — multi-tenant School OS for Qatar and the GCC.

## Status

**Sprint 0 (Engineering Foundation)** — complete. Business features begin Sprint 1.

## Source of truth

All product and engineering decisions trace to approved documents in `docs/`:

| Document                 | ID            |
| ------------------------ | ------------- |
| Product Discovery        | EDU-DISC-001  |
| Product Strategy         | EDU-STRAT-002 |
| PRD                      | EDU-PRD-003   |
| Experience Spec          | EDU-PX-004    |
| Technical Architecture   | EDU-ARCH-005  |
| Master Product Spec      | EDU-MPS-006   |
| Implementation Blueprint | EDU-BP-007    |

## Monorepo structure

```
apps/          # api, portals, mobile apps, operator console
packages/      # shared libraries, config, design system
workers/       # async job processors
docs/          # product + engineering documentation
infra/         # Terraform (post Sprint 0)
```

## Prerequisites

- Node.js ≥ 20.11 (`nvm use` reads `.nvmrc`)
- pnpm ≥ 9.15 (`corepack enable`)
- Docker Desktop (local Postgres + Redis)

## Quick start

```bash
corepack enable
pnpm install
cp .env.example .env.local
docker compose up -d
pnpm build
pnpm test
pnpm lint
```

See [Developer Onboarding](docs/DEVELOPER_ONBOARDING.md) for the full guide.

## Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `pnpm dev`       | Start all workspaces in watch mode |
| `pnpm build`     | Build all packages and apps        |
| `pnpm lint`      | ESLint across monorepo             |
| `pnpm test`      | Jest unit tests                    |
| `pnpm typecheck` | TypeScript validation              |
| `pnpm format`    | Prettier write                     |
| `pnpm changeset` | Version management                 |

## License

UNLICENSED — proprietary.
