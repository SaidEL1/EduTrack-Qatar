# Sprint 2B — Identity Security & Tenant Isolation (Technical Design)

## Scope

Production-grade identity security and PostgreSQL tenant isolation. **Out of scope:** academic, student, attendance, grades, finance, parent portal modules.

## Architecture

```
presentation/     HTTP controllers (auth, mfa, sessions, invitations, security)
application/      Orchestration services (auth, mfa, account-security, sessions, invitations)
infrastructure/   Repositories, TOTP, Redis rate limiter, tenant RLS context, encryption
```

## Database (Migration 0003)

| Table                  | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `user_mfa`             | Encrypted TOTP secret, backup code hashes, enabled timestamp |
| `security_tokens`      | Email verification + password reset (hashed opaque tokens)   |
| `password_history`     | Last N password hashes for reuse prevention                  |
| `user_sessions`        | Persistent sessions linked to refresh `family_id`            |
| `mfa_login_challenges` | Short-lived MFA step-up tokens after password login          |
| `invitations`          | Tenant user invitations with role assignment                 |
| `login_events`         | Login success/failure/MFA audit trail                        |
| `security_events`      | Suspicious activity and security alerts                      |

**User columns:** `email_verified_at`, `mfa_enabled`, `password_expires_at`

**RLS:** Policies on tenant-scoped identity tables using `app.current_tenant_id` session variable.

## Key Flows

### Login with MFA

1. `POST /auth/login` → password OK → if MFA enabled, return `{ mfaRequired, challengeToken }`
2. `POST /auth/mfa/verify` → validate TOTP or backup code → issue token pair + session

### Refresh token reuse

1. Lookup token by hash (including revoked)
2. If revoked → `revokeFamily()` + security event → 401

### Tenant RLS

1. `TenantRlsService.withTenantContext(tenantId, fn)` wraps operations in transaction with `SET LOCAL app.current_tenant_id`
2. Integration tests verify cross-tenant reads return zero rows

### Rate limiting

Redis sliding window via `RedisRateLimiterService` on login, refresh, MFA verify, password reset.

## API Endpoints (prefix `/v1`)

| Method | Path                                       | Auth                     |
| ------ | ------------------------------------------ | ------------------------ |
| POST   | `/auth/mfa/verify`                         | Public (challenge token) |
| POST   | `/identity/mfa/enroll`                     | JWT                      |
| POST   | `/identity/mfa/confirm`                    | JWT                      |
| DELETE | `/identity/mfa`                            | JWT                      |
| GET    | `/identity/mfa/backup-codes`               | JWT (regenerate)         |
| POST   | `/identity/account/verify-email/request`   | JWT                      |
| POST   | `/identity/account/verify-email/confirm`   | Public                   |
| POST   | `/identity/account/password-reset/request` | Public                   |
| POST   | `/identity/account/password-reset/confirm` | Public                   |
| GET    | `/identity/sessions`                       | JWT                      |
| DELETE | `/identity/sessions/:id`                   | JWT                      |
| POST   | `/identity/sessions/revoke-all`            | JWT                      |
| POST   | `/identity/invitations`                    | JWT + permission         |
| GET    | `/identity/invitations`                    | JWT + permission         |
| POST   | `/auth/invitations/accept`                 | Public                   |
| GET    | `/identity/security/login-events`          | JWT + permission         |
| GET    | `/identity/security/events`                | JWT + permission         |

## Dependencies

- `otplib` — TOTP generation/verification (RFC 6238)
- `ioredis` — distributed rate limiting (existing)

## ADRs (Sprint 2B)

- **ADR-S2B-001:** TOTP secrets encrypted at rest (AES-256-GCM)
- **ADR-S2B-002:** RLS via `SET LOCAL app.current_tenant_id` in transaction scope
- **ADR-S2B-003:** MFA step-up via short-lived challenge tokens (5 min, hashed in DB)
