# Coding Standards

**References:** EDU-ARCH-005, EDU-BP-007 §3, NFR-MNT-001

## Architecture

- **Modular monolith** — bounded contexts as NestJS modules in `apps/api`
- **Clean Architecture** — domain → application → infrastructure → presentation
- **DDD** — aggregates, value objects, domain events (Sprint 1+)
- **SOLID** — single responsibility per module; depend on abstractions

## TypeScript

- Strict mode enabled (`@edutrack/typescript-config`)
- No `any` — ESLint error
- Prefer `type` imports for types only
- Use `Result<T, E>` at domain boundaries (`@edutrack/shared`)

## Error handling

- Domain: `DomainError` (`@edutrack/domain`)
- Application: `EduTrackError` with structured metadata (`@edutrack/shared`)
- Never swallow errors silently — log with correlation ID

## Logging

- Use `@edutrack/logging` — structured JSON to stdout
- Include: `service`, `environment`, `correlationId`, `tenantId` when available
- Never log secrets, tokens, or PII in clear text

## Testing

- Jest for unit tests; ≥70% coverage on foundation packages
- Test file naming: `*.test.ts` adjacent to source
- No business module tests in Sprint 0

## Security

- Secrets via `SecretsProvider` / AWS Secrets Manager (prod)
- No secrets in repository — enforced by CI gitleaks
- Tenant isolation tested from Sprint 1

## Pull requests

- One vertical concern per PR
- CI must pass: lint, typecheck, test, build, boundary check
- Link PRD requirement ID when applicable (`FR-*`, `NFR-*`)
