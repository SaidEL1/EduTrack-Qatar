# Sprint 2A Report — Identity Core Platform

**Sprint:** 2A  
**Scope:** Identity Core only (no academic/business modules)  
**Status:** Complete — pending CI green on push  
**References:** FR-SET-003, NFR-SEC-001–005, NFR-LOG-001, TDR-007, TDR-011, AC-SET-001

---

## Objective

Deliver a production-grade Identity Platform reusable as a standalone authentication service: domain models, persisted RBAC, JWT auth, user lifecycle APIs, and security foundations.

---

## Deliverables

| #   | Deliverable                                                           | Status |
| --- | --------------------------------------------------------------------- | ------ |
| 1   | Identity domain (User, Membership, Role, Permission, Status, Profile) | ✅     |
| 2   | Database schema + migration `0002_identity_core.sql`                  | ✅     |
| 3   | Authentication (JWT RS256, refresh rotation, Argon2id, lockout)       | ✅     |
| 4   | Authorization (persisted RBAC, Redis cache, guards)                   | ✅     |
| 5   | User management APIs                                                  | ✅     |
| 6   | REST `/v1` + Swagger                                                  | ✅     |
| 7   | Security (Helmet, throttler foundation, password policy)              | ✅     |
| 8   | Tests ≥85% identity/security coverage                                 | ✅     |
| 9   | Documentation                                                         | ✅     |

---

## Requirements Traceability

| ID          | Implementation                                                                |
| ----------- | ----------------------------------------------------------------------------- |
| FR-SET-003  | Persisted RBAC: `roles`, `user_roles`, `role_permissions`, `PermissionEngine` |
| NFR-SEC-004 | `validatePasswordPolicy` (12+ chars, complexity), Argon2id hashing            |
| NFR-SEC-005 | `@RequirePermission` + JWT tenant claims on every protected route             |
| NFR-LOG-001 | Auth audit events: `auth.login.success`, `auth.logout`, user lifecycle        |
| TDR-007     | `PermissionCacheService` — Redis with in-memory fallback                      |
| TDR-011     | RS256 JWT access tokens + opaque refresh token rotation                       |
| AC-SET-001  | Permission cache TTL 60s + invalidation on role assign/remove                 |

---

## API Endpoints (`/v1`)

### Auth (public)

| Method | Path            | Description                       |
| ------ | --------------- | --------------------------------- |
| POST   | `/auth/login`   | Email/password login → token pair |
| POST   | `/auth/refresh` | Rotate refresh token              |
| POST   | `/auth/logout`  | Revoke refresh token              |

### Identity (Bearer JWT required)

| Method | Path                                    | Permission                 |
| ------ | --------------------------------------- | -------------------------- |
| POST   | `/identity/users`                       | `identity.user.write`      |
| GET    | `/identity/users`                       | `identity.user.read`       |
| GET    | `/identity/users/:userId`               | `identity.user.read`       |
| PATCH  | `/identity/users/:userId`               | `identity.user.write`      |
| POST   | `/identity/users/:userId/deactivate`    | `identity.user.deactivate` |
| POST   | `/identity/users/:userId/reactivate`    | `identity.user.deactivate` |
| POST   | `/identity/users/:userId/roles`         | `identity.role.assign`     |
| DELETE | `/identity/users/:userId/roles/:roleId` | `identity.role.assign`     |
| GET    | `/identity/roles`                       | `identity.role.read`       |

---

## Database Changes

Migration: `apps/api/drizzle/migrations/0002_identity_core.sql`

| Table                  | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `users`                | Credentials, status, lockout, soft delete |
| `user_profiles`        | Profile data                              |
| `organization_members` | Tenant membership                         |
| `user_roles`           | RBAC assignments                          |
| `refresh_tokens`       | Token rotation families                   |

---

## Coverage Summary

Identity + security module coverage (Jest):

| Metric     | Result |
| ---------- | ------ |
| Statements | 85.51% |
| Lines      | 86.17% |
| Functions  | 91.52% |
| Branches   | 59.34% |

**Tests:** 55 passing (14 suites) — unit + integration

---

## Security Review (Pre-Production Gate)

### JWT

| Check                   | Status | Notes                                                                                              |
| ----------------------- | ------ | -------------------------------------------------------------------------------------------------- |
| Private key not in Git  | ✅     | `.gitignore` excludes `.env`, `.env.local`, `*.pem`; only commented placeholders in `.env.example` |
| Public key via env only | ✅     | `SecretsProvider` reads `EDUTRACK_JWT_PUBLIC_KEY` at runtime                                       |
| RS256 signing           | ✅     | `JwtTokenService` uses `jsonwebtoken` with PKCS#8 private key                                      |
| Access token expiry     | ✅     | **15 minutes** (`ACCESS_TOKEN_TTL_SECONDS = 900`) embedded in JWT `exp`                            |
| Refresh token expiry    | ✅     | **7 days** (`REFRESH_TOKEN_TTL_SECONDS = 604_800`) — env-configurable TTL deferred to Sprint 2B    |

### Refresh Tokens

| Check                       | Status       | Notes                                                      |
| --------------------------- | ------------ | ---------------------------------------------------------- |
| Hash stored (not plaintext) | ✅           | SHA-256 via `hashToken()` → `refresh_tokens.token_hash`    |
| Rotation on refresh         | ✅           | Old token revoked; new token issued in same `familyId`     |
| Family revocation           | ✅           | `revokeFamily()` on invalid user during refresh            |
| Reuse detection             | ⏳ Sprint 2B | Revoked token reuse does not yet auto-revoke entire family |

### Additional Controls

| Control                                        | Status |
| ---------------------------------------------- | ------ |
| Argon2id password hashing                      | ✅     |
| Account lockout (5 failures / 15 min)          | ✅     |
| Timing-safe compare utility                    | ✅     |
| Helmet (existing)                              | ✅     |
| Rate limiting foundation (`@nestjs/throttler`) | ✅     |
| Auth events audited                            | ✅     |

---

## Remaining Risks

1. **RLS policies** — enabled at DB level in Sprint 1; JWT session context for RLS deferred to Sprint 2B
2. **MFA / parent activation** — explicitly out of Sprint 2A scope
3. **Redis required in production** — falls back to in-memory cache in dev/test
4. **Platform endpoints** — now require JWT; operator tenant bootstrap remains public

---

## Ready for Sprint 2B?

**Yes — with approval.** Sprint 2A identity core is functionally complete. Sprint 2B should cover MFA, RLS session context, parent portal activation, and cookie-based sessions.

---

## Validation Commands

```powershell
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @edutrack/api run test:coverage
pnpm format:check

# Local Docker (after compose up)
pnpm --filter @edutrack/api db:migrate
pnpm --filter @edutrack/api db:seed
pnpm --filter @edutrack/api test -- --testPathPattern=integration
```

Set `EDUTRACK_JWT_PRIVATE_KEY` and `EDUTRACK_JWT_PUBLIC_KEY` before starting the API.
