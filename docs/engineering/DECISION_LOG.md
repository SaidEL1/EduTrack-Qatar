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
