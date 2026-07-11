# Changelog

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
