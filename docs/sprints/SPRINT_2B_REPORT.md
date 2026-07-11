# Sprint 2B Report — Identity Security & Tenant Isolation Platform

**Status:** ✅ Complete  
**Date:** 2026-07-12  
**Scope:** Identity security, MFA, sessions, invitations, RLS tenant isolation, rate limiting, security monitoring  
**Out of scope (unchanged):** Academic, student, attendance, grades, finance, parent portal

---

## Executive Summary

Sprint 2B delivers a production-grade identity security layer on top of Sprint 2A Identity Core. The platform now supports TOTP MFA with backup codes, account security workflows, persistent session management, user invitations, PostgreSQL Row Level Security (RLS) for tenant isolation, security event monitoring, and Redis-backed auth rate limiting.

All required validation passes:

| Check                                | Result                             |
| ------------------------------------ | ---------------------------------- |
| `pnpm build`                         | ✅ Pass                            |
| `pnpm lint`                          | ✅ Pass                            |
| `pnpm typecheck`                     | ✅ Pass                            |
| `pnpm test`                          | ✅ 111 tests passed                |
| `pnpm test:coverage` (@edutrack/api) | ✅ ≥85% statements/lines/functions |

---

## Features Delivered

### 1. MFA Platform

- TOTP enrollment with `otpauth://` QR URL (`TotpService`, `MfaService`)
- AES-256-GCM encrypted MFA secrets at rest (`SecretEncryptionService`)
- Backup recovery codes (10 one-time SHA-256 hashed codes)
- MFA login challenge flow (`POST /auth/mfa/verify`)
- Per-user MFA enforcement via `users.mfa_enabled`

### 2. Account Security

- Email verification tokens (`POST /identity/account/verify-email/*`)
- Password reset workflow with opaque tokens
- Password history (last 5 hashes, reuse blocked)
- Password expiry (90-day default, enforced at login/refresh)
- Refresh token reuse detection → family revocation + critical security event

### 3. Session Management

- Persistent sessions keyed by refresh token family (`user_sessions`)
- Device label derivation from User-Agent
- List / revoke / revoke-all endpoints

### 4. Tenant Isolation

- Migration `0003_identity_security.sql` enables PostgreSQL RLS on tenant-scoped identity tables
- `TenantRlsService.withTenantContext()` sets `app.current_tenant_id` per transaction
- JWT `tenant_id` claim propagated (unchanged from 2A)
- Unit + integration tests validate auth flows under tenant context

### 5. Invitation System

- Create/list invitations (tenant-scoped, RBAC protected)
- Public acceptance workflow with token expiry (7 days)
- Role assignment on accept (new or existing users)

### 6. Security Monitoring

- `login_events` — success, failure, locked, MFA, token reuse
- `security_events` — MFA failures, password reset, refresh reuse
- Tenant-scoped read endpoints for admins

### 7. Rate Limiting

- `RedisRateLimiterService` — Redis when available, in-memory fallback
- `AuthRateLimitGuard` (global) — login, refresh, MFA verify, password reset

---

## Files Created

| Path                                                                           | Purpose                           |
| ------------------------------------------------------------------------------ | --------------------------------- |
| `docs/sprints/SPRINT_2B_DESIGN.md`                                             | Technical design                  |
| `docs/sprints/SPRINT_2B_REPORT.md`                                             | This report                       |
| `apps/api/drizzle/migrations/0003_identity_security.sql`                       | DB migration                      |
| `apps/api/src/common/utils/defined-fields.ts`                                  | exactOptionalPropertyTypes helper |
| `apps/api/src/modules/identity/application/mfa.service.ts`                     | MFA orchestration                 |
| `apps/api/src/modules/identity/application/account-security.service.ts`        | Account security                  |
| `apps/api/src/modules/identity/application/session-management.service.ts`      | Sessions                          |
| `apps/api/src/modules/identity/application/invitation.service.ts`              | Invitations                       |
| `apps/api/src/modules/identity/infrastructure/secret-encryption.service.ts`    | MFA secret encryption             |
| `apps/api/src/modules/identity/infrastructure/totp.service.ts`                 | TOTP (otplib)                     |
| `apps/api/src/modules/identity/infrastructure/redis-rate-limiter.service.ts`   | Rate limiter                      |
| `apps/api/src/modules/identity/infrastructure/tenant-rls.service.ts`           | RLS context                       |
| `apps/api/src/modules/identity/infrastructure/identity-security.repository.ts` | Security repos                    |
| `apps/api/src/modules/identity/infrastructure/security-event.repository.ts`    | Event repos                       |
| `apps/api/src/modules/identity/guards/auth-rate-limit.guard.ts`                | Auth rate limit guard             |
| `apps/api/src/modules/identity/dto/security.dto.ts`                            | Security DTOs                     |
| `apps/api/src/modules/identity/presentation/mfa.controller.ts`                 | MFA API                           |
| `apps/api/src/modules/identity/presentation/sessions.controller.ts`            | Sessions API                      |
| `apps/api/src/modules/identity/presentation/security.controller.ts`            | Account/invitations/monitoring    |
| `apps/api/test/unit/*.spec.ts` (12 new/extended)                               | Unit tests                        |

---

## Files Modified

| Path                                                                       | Change                              |
| -------------------------------------------------------------------------- | ----------------------------------- |
| `apps/api/src/database/schema/index.ts`                                    | New enums + tables                  |
| `apps/api/src/modules/identity/identity.module.ts`                         | All Sprint 2B providers/controllers |
| `apps/api/src/modules/identity/application/auth.service.ts`                | MFA flow, reuse detection, sessions |
| `apps/api/src/modules/identity/infrastructure/refresh-token.repository.ts` | `findByHash`, `revokeAllForUser`    |
| `apps/api/src/modules/identity/permissions/identity.permissions.ts`        | New permissions                     |
| `apps/api/src/modules/identity/presentation/auth.controller.ts`            | MFA verify endpoint                 |
| `apps/api/src/common/middleware/tenant-context.middleware.ts`              | Public route exemptions             |
| `apps/api/package.json`                                                    | `otplib` dependency                 |
| `apps/api/test/unit/auth.service.spec.ts`                                  | Updated mocks + MFA/reuse tests     |
| `apps/api/test/integration/identity.integration.spec.ts`                   | IdentityModule wiring               |

---

## Database Migrations

**`0003_identity_security.sql`**

- **Enums:** `security_token_purpose`, `invitation_status`, `login_event_outcome`, `security_event_severity`
- **User columns:** `email_verified_at`, `mfa_enabled`, `password_expires_at`
- **Tables:** `user_mfa`, `security_tokens`, `password_history`, `user_sessions`, `mfa_login_challenges`, `invitations`, `login_events`, `security_events`
- **RLS:** Policies on tenant-scoped tables using `current_setting('app.current_tenant_id')`

Run: `pnpm --filter @edutrack/api db:migrate`

---

## API Endpoints

### Auth (public, rate-limited)

| Method | Path                       | Description                     |
| ------ | -------------------------- | ------------------------------- |
| POST   | `/auth/login`              | Login — tokens or MFA challenge |
| POST   | `/auth/mfa/verify`         | Complete MFA login              |
| POST   | `/auth/refresh`            | Rotate refresh token            |
| POST   | `/auth/logout`             | Revoke session                  |
| POST   | `/auth/invitations/accept` | Accept invitation               |

### MFA (authenticated)

| Method | Path                                    | Permission            |
| ------ | --------------------------------------- | --------------------- |
| POST   | `/identity/mfa/enroll`                  | `identity.mfa.manage` |
| POST   | `/identity/mfa/confirm`                 | `identity.mfa.manage` |
| DELETE | `/identity/mfa`                         | `identity.mfa.manage` |
| POST   | `/identity/mfa/backup-codes/regenerate` | `identity.mfa.manage` |

### Sessions

| Method | Path                            | Permission                |
| ------ | ------------------------------- | ------------------------- |
| GET    | `/identity/sessions`            | `identity.session.read`   |
| DELETE | `/identity/sessions/:sessionId` | `identity.session.revoke` |
| POST   | `/identity/sessions/revoke-all` | `identity.session.revoke` |

### Account (mixed)

| Method | Path                                       | Auth                  |
| ------ | ------------------------------------------ | --------------------- |
| POST   | `/identity/account/verify-email/request`   | Bearer                |
| POST   | `/identity/account/verify-email/confirm`   | Public                |
| POST   | `/identity/account/password-reset/request` | Public (rate-limited) |
| POST   | `/identity/account/password-reset/confirm` | Public                |

### Invitations

| Method | Path                    | Permission                  |
| ------ | ----------------------- | --------------------------- |
| POST   | `/identity/invitations` | `identity.invitation.write` |
| GET    | `/identity/invitations` | `identity.invitation.read`  |

### Security Monitoring

| Method | Path                              | Permission               |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/identity/security/login-events` | `identity.security.read` |
| GET    | `/identity/security/events`       | `identity.security.read` |

---

## Security Review

| Area            | Assessment                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------------- |
| MFA secrets     | Encrypted at rest (AES-256-GCM); key from `EDUTRACK_MFA_ENCRYPTION_KEY` or JWT private key fallback |
| Backup codes    | SHA-256 hashed, one-time use, timing-safe compare                                                   |
| Refresh reuse   | Revoked token reuse → full family revocation + critical audit                                       |
| Password policy | Domain validation + history + expiry                                                                |
| Rate limiting   | Per-IP sliding window on auth endpoints                                                             |
| RLS             | PostgreSQL policies enforce tenant_id match                                                         |
| Tokens          | Opaque hashed storage (unchanged pattern from 2A)                                                   |

**Recommendations for production:**

- Set dedicated `EDUTRACK_MFA_ENCRYPTION_KEY` (32+ bytes)
- Configure `REDIS_URL` for distributed rate limiting
- Wire `TenantRlsService` into request lifecycle for all tenant-scoped DB operations
- Add email delivery integration for verification/reset/invitation tokens (Sprint 3+)

---

## Test Results

```
Test Suites: 26 passed
Tests:       111 passed
Time:        ~11s
```

Key new test coverage:

- MFA enrollment, challenge, backup codes
- Refresh token reuse detection
- Account security (verify, reset, expiry)
- Session management
- Invitation accept flows
- Identity security + security event repositories
- Tenant RLS service
- Auth rate limit guard

---

## Coverage (@edutrack/api)

| Metric     | Threshold | Actual  |
| ---------- | --------- | ------- |
| Statements | 85%       | ✅ Pass |
| Lines      | 85%       | ✅ Pass |
| Functions  | 85%       | ✅ Pass |
| Branches   | 55%       | ✅ Pass |

---

## Remaining Risks

1. **RLS not wired globally** — `TenantRlsService` exists but is not yet applied to every repository call; application-layer tenant_id filtering still primary defense.
2. **Tenant-level MFA policy** — Only per-user `mfa_enabled`; org-wide MFA requirement not implemented.
3. **Email delivery** — Tokens returned in API responses (dev pattern); production needs secure email channel.
4. **Redis optional** — Rate limiter falls back to in-memory (single-instance only).
5. **Existing tenant_admin roles** — New permissions require seed re-run or tenant re-provision for pre-2B tenants.

---

## Ready for Next Sprint?

**Recommendation: ✅ Yes — proceed to Sprint 3 (Platform Communications / Notifications or next planned module)**

Sprint 2B acceptance criteria met. Identity security foundation is in place. Suggested Sprint 3 prep:

- Email/notification worker integration for verification & invitation delivery
- Global RLS middleware wiring
- Tenant MFA enforcement policy

---

## Standards Compliance

- EDU-MPS-006 — Modular monolith, identity bounded context extended
- EDU-BP-007 — Secrets via `SecretsProvider`, no credentials in repo
- EDU-ARCH-005 — DDD layers preserved (application / infrastructure / presentation)
- ADR-S2B-001 — MFA secret encryption
- ADR-S2B-002 — PostgreSQL RLS tenant context
