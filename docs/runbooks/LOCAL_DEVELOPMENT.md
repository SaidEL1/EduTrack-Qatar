# Local Development Runbook

## Start services

```bash
docker compose up -d
docker compose ps
```

## Environment

```bash
cp .env.example .env.local
```

## Monorepo commands

```bash
pnpm install
pnpm dev        # watch mode
pnpm build
pnpm test
```

## Stop services

```bash
docker compose down
```

## Reset database volume

```bash
docker compose down -v
docker compose up -d
```

**Warning:** destroys local data.

## Troubleshooting

| Issue                       | Fix                                        |
| --------------------------- | ------------------------------------------ |
| Port 5432 in use            | Stop local Postgres or change compose port |
| pnpm not found              | `corepack enable`                          |
| ESLint project service slow | First run indexes TS projects — wait       |
