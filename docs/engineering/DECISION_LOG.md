# Architecture Decision Log

## ADR-S1-001 — NestJS + Drizzle for Platform API

**Status:** Accepted (Sprint 1)  
**Context:** EDU-ARCH-005 TDR-001 (NestJS), need type-safe SQL with RLS path  
**Decision:** `apps/api` uses NestJS 10 + Drizzle ORM + postgres.js  
**Consequences:** Manual migration runner; RLS policies added in Sprint 2

## ADR-S1-002 — In-memory PermissionEngine until Sprint 2

**Status:** Accepted (Sprint 1)  
**Context:** FR-SET-003 full RBAC scheduled Sprint 2  
**Decision:** Seed permissions on tenant create; enforce via guard when permissions seeded  
**Consequences:** Replace with DB-backed roles in Sprint 2

## ADR-S1-003 — OpenTelemetry metrics-only bootstrap

**Status:** Accepted (Sprint 1)  
**Context:** NFR-LOG-002, ARCH-005 observability  
**Decision:** `@edutrack/observability` exports Prometheus metrics; tracing in Sprint 2  
**Consequences:** Metrics port 9464; enable via `OTEL_ENABLED`

## ADR-S2A-001 — DB-backed RBAC replaces in-memory PermissionEngine

**Status:** Accepted (Sprint 2A)  
**Context:** FR-SET-003, ADR-S1-002 superseded  
**Decision:** Permissions resolved from `user_roles` → `role_permissions` → `permissions` with Redis cache (60s TTL)  
**Consequences:** ADR-S1-002 deprecated; tenant bootstrap creates `tenant_admin` role in DB

## ADR-S2A-002 — JWT RS256 + opaque refresh token rotation

**Status:** Accepted (Sprint 2A)  
**Context:** TDR-011  
**Decision:** Access tokens via `jsonwebtoken` RS256; refresh tokens stored as SHA-256 hashes with family rotation  
**Consequences:** Requires `EDUTRACK_JWT_PRIVATE_KEY` / `EDUTRACK_JWT_PUBLIC_KEY` at runtime

## ADR-S2A-003 — Global JwtAuthGuard with @Public() opt-out

**Status:** Accepted (Sprint 2A)  
**Context:** NFR-SEC-005, replace header-only actor context  
**Decision:** All routes require Bearer JWT unless `@Public()`; JWT claims set tenant + actor headers  
**Consequences:** Platform operator endpoints for tenant list/create remain public; all tenant-scoped routes need login
