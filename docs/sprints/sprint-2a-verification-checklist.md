# Sprint 2A Verification Checklist

## Build & Quality

- [x] `pnpm build`
- [x] `pnpm typecheck`
- [x] `pnpm lint` (domain test path fixed)
- [x] `pnpm test` — 55 tests passing
- [x] `pnpm --filter @edutrack/api run test:coverage` — ≥85% statements/lines/functions
- [x] `pnpm format:check`

## Database

- [x] Migration `0002_identity_core.sql` created
- [x] Soft delete columns on `users`, `organization_members`
- [x] Audit timestamps on all identity tables
- [x] Indexes on FK lookups and refresh token expiry
- [x] Seed includes identity permissions

## Identity Domain

- [x] `UserAggregate`, `OrganizationMembership`, `Email`, `UserStatus`, password policy
- [x] Exported from `@edutrack/domain`

## Authentication

- [x] POST `/v1/auth/login`
- [x] POST `/v1/auth/refresh` with rotation
- [x] POST `/v1/auth/logout`
- [x] Argon2id hashing
- [x] RS256 JWT access tokens
- [x] Inactive/disabled/locked account handling
- [x] Failed login lockout

## Authorization

- [x] DB-backed RBAC resolver
- [x] Redis permission cache (TDR-007)
- [x] `JwtAuthGuard` + `PermissionGuard`
- [x] `@RequirePermission` decorator
- [x] Tenant admin role bootstrapped on tenant create

## User Management

- [x] Create / update / deactivate / reactivate user
- [x] Assign / remove role
- [x] Organization membership on create
- [x] Audit events on all mutations

## Security Review (Pre-Production)

- [x] JWT private key not committed (`.gitignore` + CI ephemeral keys only)
- [x] Access token TTL = 15 minutes
- [x] Refresh tokens stored as SHA-256 hash
- [x] Refresh token rotation implemented
- [ ] Refresh token reuse detection (planned Sprint 2B)

## CI

- [x] JWT key generation step in integration job
- [x] Identity integration tests in CI pipeline
- [ ] GitHub Actions green (requires push)

## API Smoke Test

- [x] `pnpm --filter @edutrack/api dev` + Swagger `/v1/docs`
- [x] Login → Refresh → Logout → Create User → Assign Role → Protected endpoint

## Out of Scope (Sprint 2B)

- [ ] MFA
- [ ] Parent portal activation
- [ ] RLS session policies
- [ ] Academic/student/attendance/grades/finance modules
