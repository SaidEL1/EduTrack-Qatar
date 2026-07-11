# Sprint 1 Report — Platform Foundation

**Sprint:** 1 (BP-MS-01)  
**Date:** 2026-07-11  
**Status:** Complete — pending engineering sign-off

## Summary

Sprint 1 delivered the EduTrack **Platform Core** as a NestJS modular monolith in `apps/api`, with PostgreSQL schema, tenant/school/campus/academic-year APIs, audit logging, observability foundations, health endpoints, RBAC skeleton, and OpenAPI documentation.

## Requirements implemented

| ID                      | Description                          | Implementation                                      |
| ----------------------- | ------------------------------------ | --------------------------------------------------- |
| FR-SET-001              | Academic year and term configuration | `POST/GET /v1/platform/academic-years`              |
| FR-SET-004              | School profile                       | `PUT/GET /v1/platform/school`                       |
| FR-SET-007              | Multi-campus settings                | `POST/GET /v1/platform/campuses`                    |
| FR-SET-008              | Audit log                            | `GET /v1/platform/audit-logs` + append on mutations |
| FR-SET-003 (skeleton)   | RBAC permissions                     | `PermissionEngine`, `@RequirePermission`            |
| NFR-LOG-002             | Sensitive mutation logging           | Audit service on all config changes                 |
| AC-SET-002              | Audit on config change               | Covered by audit append + integration test          |
| AC-SET tenant isolation | Tenant-scoped queries                | `tenant_id` on all tables + integration test        |

## Validation

| Command              | Result                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pnpm build`         | Pass (18 workspaces)                                                                                          |
| `pnpm lint`          | Pass (21 workspaces)                                                                                          |
| `pnpm test`          | Pass (integration skipped without `DATABASE_URL`)                                                             |
| `pnpm typecheck`     | Pass (21 workspaces)                                                                                          |
| `pnpm format:check`  | Pass                                                                                                          |
| `pnpm test:coverage` | Partial — 13.5% global; permission engine & audit helper at 100%; platform service needs DB integration tests |
| Docker               | Not available locally — migration SQL + runbook provided                                                      |

## Tests added

| Suite       | File                                                     | Coverage focus                               |
| ----------- | -------------------------------------------------------- | -------------------------------------------- |
| Unit        | `test/unit/permission-engine.spec.ts`                    | FR-SET-003 skeleton — 100%                   |
| Unit        | `test/unit/platform-audit.helper.spec.ts`                | AC-SET-002 audit entries — 100%              |
| Unit        | `packages/shared/src/utils/correlation-id.test.ts`       | NFR-LOG-002 correlation IDs                  |
| Unit        | `packages/observability/src/otel/init-telemetry.test.ts` | OpenTelemetry bootstrap                      |
| Integration | `test/integration/platform.integration.spec.ts`          | Tenant isolation + audit (requires Postgres) |

## Coverage summary

| Area               | Statement coverage | Notes                                                        |
| ------------------ | ------------------ | ------------------------------------------------------------ |
| `PermissionEngine` | 100%               | Meets Sprint 1 DoD for RBAC skeleton                         |
| `buildAuditEntry`  | 100%               | Meets audit helper DoD                                       |
| `PlatformService`  | ~13%               | Requires integration tests with Docker Postgres              |
| Global API         | ~13%               | Controller/guard/middleware E2E deferred to Sprint 2 harness |

**Target:** ≥80% on platform domain logic per EDU-BP-007 — achieved for security skeleton; `PlatformService` coverage blocked until Postgres integration runs in CI.

## Remaining risks

| Risk                                   | Mitigation                                                      |
| -------------------------------------- | --------------------------------------------------------------- |
| RLS policies not active until Sprint 2 | Application-layer tenant scoping + RLS enabled without policies |
| Auth not implemented                   | Sprint 2 JWT + MFA                                              |
| Docker unavailable locally             | CI + runbook document migrate/seed steps                        |
| Permission engine in-memory only       | Persist roles in Sprint 2                                       |

## Ready for Sprint 2?

**Yes**, pending sign-off — proceed to Authentication & RBAC (FR-SET-002/003, NFR-SEC-001–005).
