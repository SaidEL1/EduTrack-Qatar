# Changelog

## [0.4.0] - 2026-07-12 — Sprint 2C Platform Hardening & Communication Foundation

### Added

- SQL migrations `0004_platform_hardening.sql`, `0005_force_row_level_security.sql`
- Global `TenantRlsInterceptor` wiring PostgreSQL RLS into every authenticated tenant request
- AsyncLocalStorage tenant context + tenant-aware Drizzle proxy
- `NotificationModule` with email outbox queue, templates, and console provider
- `tenant_security_policies` table and admin settings API (`/identity/security/settings`)
- Tenant MFA enforcement at login; password/session policy enforcement
- Production hardening: CORS, Origin/Referer CSRF mitigation, `REDIS_REQUIRED` mode, security bootstrap audit
- Security dashboard APIs (`/identity/security/dashboard`, analytics, reports, active sessions)
- 140 unit + integration tests; identity/security/notification coverage ≥85%

### Changed

- Password reset, email verification, and invitation flows queue emails; tokens hidden unless `EMAIL_RETURN_TOKENS=true`
- `PlatformService` provisions default tenant security policy on tenant create
- Swagger bumped to v0.3.0; security audit at `GET /platform/security/audit`

### Security

- `FORCE ROW LEVEL SECURITY` on all tenant-scoped tables (table owner bypass closed)
- Secrets/CORS/Redis configuration audited at startup and via platform API

## [0.3.0] - 2026-07-12 — Sprint 2B Identity Security & Tenant Isolation

### Added

- SQL migration `0003_identity_security.sql` — MFA, sessions, invitations, security events, PostgreSQL RLS
- TOTP MFA platform with QR enrollment, backup codes, and login challenge flow
- Account security: email verification, password reset, password history, password expiry
- Refresh token reuse detection with token-family revocation
- Persistent session management with device tracking (list / revoke / revoke-all)
- User invitation system with token expiry and role assignment
- Security monitoring: login events and security events APIs
- Redis-backed auth rate limiting with in-memory fallback (`AuthRateLimitGuard`)
- `TenantRlsService` for PostgreSQL RLS tenant context (`app.current_tenant_id`)
- 111 unit + integration tests; identity/security coverage ≥85%

### Changed

- Login may return MFA challenge instead of tokens when `mfa_enabled`
- Refresh flow checks revoked tokens first for reuse detection
- `IdentityModule` extended with MFA, sessions, invitations, and security controllers
- Tenant context middleware exempts new public auth/account routes

### Security

- MFA secrets encrypted at rest (AES-256-GCM, ADR-S2B-001)
- PostgreSQL RLS policies on tenant-scoped identity tables (ADR-S2B-002)
- Distributed rate limits on login, refresh, MFA verify, and password reset

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
