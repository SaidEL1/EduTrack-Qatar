# Naming Conventions

**References:** EDU-BP-007 §3, EDU-ARCH-005

## Repositories & workspaces

| Artifact         | Pattern                | Example               |
| ---------------- | ---------------------- | --------------------- |
| npm scope        | `@edutrack/<name>`     | `@edutrack/shared`    |
| App workspace    | kebab-case             | `teacher-portal`      |
| Worker workspace | kebab-case + `-worker` | `notification-worker` |

## TypeScript

| Artifact   | Pattern                                  | Example                              |
| ---------- | ---------------------------------------- | ------------------------------------ |
| Files      | kebab-case                               | `entity-id.ts`                       |
| Classes    | PascalCase                               | `EntityId`                           |
| Interfaces | PascalCase (no `I` prefix)               | `LogContext`                         |
| Types      | PascalCase                               | `TenantId`                           |
| Functions  | camelCase                                | `createLogger`                       |
| Constants  | SCREAMING_SNAKE or camelCase for objects | `APP_NAME`                           |
| Enums      | PascalCase + PascalCase members          | `LogLevel.Info` (prefer union types) |

## Git

| Artifact  | Pattern                        | Example                                   |
| --------- | ------------------------------ | ----------------------------------------- |
| Branch    | `<type>/<scope>/<description>` | `feat/api/tenant-crud`                    |
| Commit    | Conventional Commits           | `feat(domain): add EntityId value object` |
| Changeset | descriptive kebab              | `sprint-0-foundation.md`                  |

## Environment variables

| Scope            | Pattern                          | Example                    |
| ---------------- | -------------------------------- | -------------------------- |
| Public (Next.js) | `NEXT_PUBLIC_*`                  | `NEXT_PUBLIC_API_BASE_URL` |
| Secrets          | `EDUTRACK_*` via SecretsProvider | `EDUTRACK_JWT_PRIVATE_KEY` |
| Standard         | SCREAMING_SNAKE                  | `DATABASE_URL`             |

## Database (Sprint 1+)

- Tables: `snake_case`, plural (`students`, `audit_logs`)
- Columns: `snake_case`
- RLS policies: `tenant_isolation_<table>`

## API (Sprint 1+)

- REST paths: kebab-case plural nouns (`/academic-years`)
- JSON fields: camelCase in API responses
