# Sprint 2C Report — Platform Hardening & Communication Foundation

**Status:** ✅ Complete  
**Date:** 2026-07-12  
**Scope:** Tenant isolation wiring, production email foundation, tenant security policies, production hardening, security monitoring  
**Out of scope (unchanged):** Students, attendance, grades, finance, parent portal, academic modules

---

## Executive Summary

Sprint 2C closes the identity and security foundation started in Sprints 2A–2B. Tenant RLS is now enforced on every authenticated HTTP request, email delivery runs through a queue-based outbox with templates, tenants can configure MFA/password/session policies, production security controls (CORS, CSRF mitigation, Redis-required mode, secrets audit) are in place, and admins get security dashboard APIs.

All required validation passes:

| Check                                | Result                                                 |
| ------------------------------------ | ------------------------------------------------------ |
| `pnpm build`                         | ✅ Pass                                                |
| `pnpm lint`                          | ✅ Pass                                                |
| `pnpm typecheck`                     | ✅ Pass                                                |
| `pnpm test`                          | ✅ 140 tests passed (@edutrack/api)                    |
| `pnpm test:coverage` (@edutrack/api) | ✅ 86.99% statements / 86.83% lines / 91.12% functions |

---

## Features Delivered

### 1. Complete Tenant Isolation

- **`TenantRlsInterceptor`** (global `APP_INTERCEPTOR`) wraps tenant-scoped HTTP handlers in a PostgreSQL transaction with `SET LOCAL app.current_tenant_id`
- **`tenantContextStore`** (AsyncLocalStorage) propagates tenant-scoped transaction DB through the request lifecycle
- **`createTenantAwareDb()`** proxy routes all `DRIZZLE` injections to the active RLS transaction when context is set
- **`@SkipTenantRls()`** decorator exempts platform routes (tenant provisioning, security audit)
- Migration **`0005_force_row_level_security.sql`** adds `FORCE ROW LEVEL SECURITY` so table owners cannot bypass policies
- Cross-tenant integration tests validate session variable binding, forced RLS metadata, and isolation when the DB role honors RLS

### 2. Production Email Foundation

- **`NotificationModule`** with provider abstraction (`EmailProvider` interface)
- **`email_outbox`** table with status enum (`pending`, `processing`, `sent`, `failed`), retry scheduling, and max attempts
- **`EmailTemplateService`** — templates for `email_verification`, `password_reset`, `user_invitation`
- **`NotificationService.queueEmail()`** enqueues and triggers inline dispatch; **`EmailDispatchService`** processes pending with retry/failure handling
- **`ConsoleEmailProvider`** for development (logs payloads)
- Password reset, email verification, and invitation flows queue emails instead of returning tokens in production
- **`EMAIL_RETURN_TOKENS=true`** dev flag restores token-in-response behavior (non-breaking for existing dev workflows)

### 3. Tenant Security Policies

- **`tenant_security_policies`** table with per-tenant MFA, password, and session settings
- **`TenantSecurityPolicyService`** with defaults created on tenant provisioning
- **`GET/PUT /identity/security/settings`** for tenant admins (RBAC: `identity.security.settings.read/write`)
- **Enforcement:**
  - Login blocks users when tenant requires MFA but user has not enrolled
  - Password reset validates tenant `passwordMinLength`
  - Session creation respects `maxActiveSessions`

### 4. Production Security Hardening

- **`REDIS_REQUIRED`** — boot fails when true and `REDIS_URL` is missing (`RedisRateLimiterService`, `PermissionCacheService`)
- **CORS** enabled from `CORS_ORIGINS` in `main.ts`
- **`OriginValidationMiddleware`** — CSRF mitigation via Origin/Referer validation on state-changing requests; bearer clients without Origin allowed; auth/public routes exempt
- **`SecurityBootstrapService`** — audits JWT keys, CORS, Redis, and `APP_PUBLIC_URL` on startup; **`GET /platform/security/audit`** exposes findings
- **`api-env.schema.ts`** extended with `REDIS_REQUIRED`, `APP_PUBLIC_URL`, `EMAIL_RETURN_TOKENS`

### 5. Security Monitoring Dashboard

- **`SecurityDashboardService`** aggregates sessions, login outcomes, and critical events
- New endpoints under **`/identity/security`**:
  - `GET /dashboard` — summary (active sessions, 24h login stats, critical events, MFA challenges)
  - `GET /analytics/logins` — login outcome breakdown over configurable days
  - `GET /reports/failed-logins` — recent failed login events
  - `GET /sessions/active` — active session listing

---

## Database Migrations

| Migration                           | Purpose                                                  |
| ----------------------------------- | -------------------------------------------------------- |
| `0004_platform_hardening.sql`       | `email_outbox`, `tenant_security_policies`, RLS policies |
| `0005_force_row_level_security.sql` | `FORCE ROW LEVEL SECURITY` on all tenant-scoped tables   |

---

## Architecture Notes

### RLS Request Flow (ADR-S2C-001)

```
HTTP Request (x-tenant-id)
  → TenantRlsInterceptor
    → TenantRlsService.runInTenantContext(tenantId)
      → BEGIN transaction
      → SET LOCAL app.current_tenant_id = tenantId
      → tenantContextStore.run({ tenantId, db: tx })
        → Handler / Repository (via createTenantAwareDb proxy)
      → COMMIT
```

Platform routes annotated with `@SkipTenantRls()` bypass this flow.

### Email Outbox Flow

```
AccountSecurity / InvitationService
  → NotificationService.queueEmail()
    → EmailOutboxRepository.enqueue()
    → EmailDispatchService.processPending() [async]
      → EmailProvider.send()
      → markSent / markFailed (with retry delay)
```

---

## API Additions (Non-Breaking)

| Method | Path                                       | Description                           |
| ------ | ------------------------------------------ | ------------------------------------- |
| GET    | `/platform/security/audit`                 | Platform security configuration audit |
| GET    | `/identity/security/settings`              | Read tenant security policy           |
| PUT    | `/identity/security/settings`              | Update tenant security policy         |
| GET    | `/identity/security/dashboard`             | Security dashboard summary            |
| GET    | `/identity/security/analytics/logins`      | Login analytics                       |
| GET    | `/identity/security/reports/failed-logins` | Failed login report                   |
| GET    | `/identity/security/sessions/active`       | Active sessions                       |

**Behavior change (dev-safe):** Password reset, email verification, and invitation create endpoints no longer return raw tokens unless `EMAIL_RETURN_TOKENS=true`.

---

## Tests Added / Extended

| File                                                    | Coverage                      |
| ------------------------------------------------------- | ----------------------------- |
| `test/unit/tenant-rls.interceptor.spec.ts`              | RLS interceptor wiring        |
| `test/unit/tenant-rls.service.spec.ts`                  | RLS transaction context       |
| `test/integration/tenant-isolation.integration.spec.ts` | Cross-tenant security (DB)    |
| `test/unit/notification.service.spec.ts`                | Email queue + dispatch        |
| `test/unit/email-template.service.spec.ts`              | Template rendering            |
| `test/unit/email-outbox.repository.spec.ts`             | Outbox CRUD + retry           |
| `test/unit/console-email.provider.spec.ts`              | Dev email provider            |
| `test/unit/tenant-security-policy.service.spec.ts`      | Policy service                |
| `test/unit/tenant-security-policy.repository.spec.ts`   | Policy repository             |
| `test/unit/security-bootstrap.service.spec.ts`          | Secrets/CORS/Redis audit      |
| `test/unit/security-dashboard.service.spec.ts`          | Dashboard aggregation         |
| `test/unit/origin-validation.middleware.spec.ts`        | CSRF origin validation        |
| `test/unit/redis-rate-limiter.service.spec.ts`          | Rate limiter + REDIS_REQUIRED |

Extended: `auth.service.spec.ts`, `account-security.service.spec.ts`, `invitation.service.spec.ts`, `session-management.service.spec.ts`, `platform.integration.spec.ts`

---

## Environment Variables (New)

| Variable              | Default                 | Purpose                                   |
| --------------------- | ----------------------- | ----------------------------------------- |
| `REDIS_REQUIRED`      | `false`                 | Fail boot if Redis unavailable            |
| `APP_PUBLIC_URL`      | `http://localhost:3000` | Base URL for email links                  |
| `EMAIL_RETURN_TOKENS` | `false`                 | Return tokens in API responses (dev only) |
| `CORS_ORIGINS`        | `*`                     | Allowed browser origins (comma-separated) |

---

## Standards Compliance

- **EDU-MPS-006** — DDD module boundaries preserved; identity, notification, and platform concerns separated
- **NestJS architecture** — global interceptor, middleware, module imports unchanged in shape
- **No breaking API changes** — existing endpoints retain contracts; tokens hidden by default with opt-in dev flag
- **ADR-S2B-002 / ADR-S2C-001** — PostgreSQL RLS tenant context

---

## Deferred (Post–Sprint 2C)

| Item                                  | Reason                                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| Dedicated notification worker process | Outbox processed inline in API for 2C foundation; worker shell exists              |
| External SMTP/SES provider            | `ConsoleEmailProvider` sufficient for dev; interface ready for production provider |
| Academic modules                      | Explicitly out of scope per sprint charter                                         |

---

## Next Sprint Boundary

Sprint 2C completes the **identity/security foundation**. Do **not** begin academic modules (students, attendance, grades, finance, parent portal) until explicitly planned in a future sprint.

---

_Report generated for EduTrack Qatar — Sprint 2C Platform Hardening & Communication Foundation._
