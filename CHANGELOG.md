# Changelog

## [0.2.0] - 2026-07-11 — Sprint 2A Identity Core

### Added

- Identity domain models in `@edutrack/domain` (Email, UserStatus, password policy, UserAggregate, OrganizationMembership)
- SQL migration `0002_identity_core.sql` — users, profiles, memberships, user_roles, refresh_tokens
- Authentication: login, refresh rotation, logout (`/v1/auth/*`)
- RS256 JWT access tokens + Argon2id password hashing
- User management APIs (`/v1/identity/users`, `/v1/identity/roles`)
- DB-backed RBAC with Redis permission cache (TDR-007)
- Global `JwtAuthGuard` + `@Public()` decorator
- Identity permissions seeded alongside platform permissions
- 55 unit + integration tests; identity/security coverage ≥85%

### Changed

- `PermissionEngine` — persisted RBAC replaces in-memory seed (ADR-S2A-001)
- Tenant creation bootstraps `tenant_admin` role with platform + identity permissions
- Platform tenant-scoped endpoints now require JWT Bearer token
- Swagger updated to v0.2.0 with Bearer auth scheme

### Security

- Account lockout after 5 failed login attempts (15-minute window)
- Timing-safe string comparison utility
- Rate limiting foundation via `@nestjs/throttler` on auth module
- Auth and user lifecycle audit events (NFR-LOG-001)

## [0.1.0] - 2026-07-11 — Sprint 1 Platform Foundation

### Added

- `@edutrack/observability` — OpenTelemetry metrics bootstrap
- `@edutrack/api` NestJS platform API with Drizzle/PostgreSQL
- Tenant, school, campus, academic year REST endpoints (`/v1/platform/*`)
- Audit log append + query (FR-SET-008)
- System settings and feature flags APIs
- Health endpoints: `/v1/health`, `/v1/health/live`, `/v1/health/ready`
- Correlation ID middleware and structured error responses
- RBAC permission skeleton (`PermissionEngine`, `@RequirePermission`)
- Swagger UI at `/v1/docs`
- SQL migration `0001_platform_foundation.sql`
- Seed script for platform permissions
- Integration test harness (requires `DATABASE_URL`)

### Changed

- `@edutrack/shared` — `createCorrelationId`, `parseCorrelationId`
- `@edutrack/logging` — `pino-pretty` moved to production dependencies
- `apps/api` — upgraded from TypeScript shell to NestJS application

### Security

- Helmet middleware enabled
- Tenant context required via `X-Tenant-Id` header (except operator endpoints)
- RLS enabled on tenant tables (policies in Sprint 2)
