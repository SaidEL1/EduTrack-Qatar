# Architecture Folders

**References:** EDU-ARCH-005 Clean Architecture, EDU-BP-007 §3

## API (`apps/api`)

```
src/
├── modules/                    # Bounded contexts (Sprint 1+)
│   └── <context>/
│       ├── domain/             # Entities, value objects, domain services
│       ├── application/        # Use cases, DTOs, ports
│       ├── infrastructure/     # DB, external APIs, messaging
│       └── presentation/       # Controllers, guards, filters
└── shared/
    ├── domain/
    ├── application/
    ├── infrastructure/
    └── presentation/
```

**Rule:** Dependencies point inward — presentation → application → domain.

## Portal apps (`apps/*-portal`, `apps/operator-console`)

```
src/
├── app/          # Next.js App Router (Sprint 8+)
├── components/   # Feature components
├── lib/          # Client utilities
└── index.ts      # Sprint 0 boundary marker
```

## Mobile apps (`apps/*-mobile`)

```
src/
├── screens/      # Sprint 9+
├── navigation/
├── lib/
└── index.ts
```

## Workers (`workers/*`)

```
src/
├── handlers/     # Job handlers (Sprint 10+)
├── lib/
└── index.ts
```

## Shared packages

| Package                | Structure                                     |
| ---------------------- | --------------------------------------------- |
| `@edutrack/shared`     | `src/types`, `src/errors`, `src/constants`    |
| `@edutrack/domain`     | `src/base`, `src/value-objects`, `src/errors` |
| `@edutrack/logging`    | `src/logger.ts`, `src/context.ts`             |
| `@edutrack/config`     | `src/env`, `src/secrets`, `src/loader.ts`     |
| `@edutrack/i18n`       | `src/locales`, `src/rtl`                      |
| `@edutrack/ui`         | `src/components` (Sprint 8+)                  |
| `@edutrack/api-client` | `src/http-client.ts`                          |

## Infrastructure (`infra/`)

Terraform modules for AWS Bahrain — begins post Sprint 0 (EDU-BP-007).
