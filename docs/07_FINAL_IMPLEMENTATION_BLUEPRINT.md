# EduTrack — Final Implementation Blueprint

| Field | Value |
|-------|-------|
| **Document ID** | EDU-BP-007 |
| **Version** | 1.0.0 |
| **Status** | Draft — Pending G7 Stakeholder Approval |
| **Phase** | Phase 7 — Final Implementation Blueprint |
| **Authority** | EDU-MPS-006 (Single Source of Truth) |
| **Author** | EduTrack Executive Engineering Delivery Board |
| **Last Updated** | 2026-07-08 |
| **Classification** | Internal — Confidential |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-08 | Engineering Delivery Board | Initial implementation blueprint |

### Blueprint Convention

| Prefix | Meaning |
|--------|---------|
| `BP-S##` | Sprint identifier |
| `BP-PH-*` | Development phase (A–I) |
| `BP-MS-*` | Engineering milestone |

**Constraint:** No source code, API specifications, SQL/DDL, or infrastructure-as-code in this document. Those artifacts are produced during Sprint 0+ after G7 approval.

### Approval Gate — G7: Blueprint Approval

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Chief Technology Officer | | | | Pending |
| Chief Architect | | | | Pending |
| VP Engineering | | | | Pending |
| Principal Backend Engineer | | | | Pending |
| Principal Frontend Engineer | | | | Pending |
| DevOps Lead | | | | Pending |
| QA Lead | | | | Pending |
| Security Lead | | | | Pending |
| AI Lead | | | | Pending |
| Product Manager | | | | Pending |
| Scrum Master | | | | Pending |

**Gate criteria:** Sprint plan mapped to MPS modules and PRD requirement IDs; team RACI agreed; CI/CD and environment strategy approved; QA/security checklists accepted; no new business scope; engineering capacity validated.

**Post-G7:** Begin **Sprint 0** only after G7 approval is recorded.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Engineering Vision](#2-engineering-vision)
3. [Repository Strategy](#3-repository-strategy)
4. [Development Phases](#4-development-phases)
5. [Sprint Plan](#5-sprint-plan)
6. [Module Delivery Order](#6-module-delivery-order)
7. [Engineering Milestones](#7-engineering-milestones)
8. [QA Strategy](#8-qa-strategy)
9. [Testing Strategy](#9-testing-strategy)
10. [CI/CD Strategy](#10-cicd-strategy)
11. [Branching Strategy](#11-branching-strategy)
12. [Release Strategy](#12-release-strategy)
13. [Deployment Strategy](#13-deployment-strategy)
14. [Feature Flag Strategy](#14-feature-flag-strategy)
15. [Environment Strategy](#15-environment-strategy)
16. [Migration Strategy](#16-migration-strategy)
17. [Rollback Strategy](#17-rollback-strategy)
18. [Monitoring Checklist](#18-monitoring-checklist)
19. [Security Checklist](#19-security-checklist)
20. [Performance Checklist](#20-performance-checklist)
21. [Documentation Checklist](#21-documentation-checklist)
22. [Technical Debt Strategy](#22-technical-debt-strategy)
23. [Team Responsibilities](#23-team-responsibilities)
24. [RACI Matrix](#24-raci-matrix)
25. [Delivery KPIs](#25-delivery-kpis)
26. [Risk Register](#26-risk-register)
27. [Launch Checklist](#27-launch-checklist)
28. [Post Launch Plan](#28-post-launch-plan)
29. [Hypercare Plan](#29-hypercare-plan)
30. [Future Expansion](#30-future-expansion)
31. [Open Questions](#31-open-questions)
32. [Executive Recommendation](#32-executive-recommendation)
33. [Readiness Assessment](#33-readiness-assessment)

---

## 1. Executive Summary

This Final Implementation Blueprint translates **EDU-MPS-006** and all approved Phase 1–6 documents into an **executable engineering delivery plan** for EduTrack v1.0 MVP through v2.0 foundation.

| Attribute | Blueprint Position |
|-----------|-------------------|
| **Delivery model** | 2-week Scrum sprints; modular monolith first |
| **MVP target** | v1.0 at Sprint 16 (≈32 weeks from Sprint 0) |
| **Sprint 0 start** | Post-G7 approval only |
| **Team size (Y1)** | 25–35 engineers (per EDU-STRAT-002) |
| **First pilots** | Sprint 15–16 (design partners → paying pilots) |
| **v1.1** | Sprints 17–20 |
| **v2.0 Finance + AI basic** | Sprints 21–26 (Y2 Q1–Q2) |

**No new business requirements** are introduced. All deliverables trace to PRD requirement IDs (`FR-*`, `AC-*`, `NFR-*`) and MPS §22 MVP definition.

---

## 2. Engineering Vision

> **Ship a secure, bilingual, multi-tenant School OS MVP in 8 months — with weekly production deployments, zero cross-tenant defects, and pilot schools live by Sprint 16.**

### Delivery Principles

1. **MPS is law** — Scope changes require change control back to PRD  
2. **Vertical slices** — Each sprint delivers testable end-to-end capability  
3. **Tenant-first** — No feature merges without tenant isolation tests  
4. **API before UI** — Backend contract stub before portal integration  
5. **Observability day one** — Metrics, logs, traces from Sprint 0  
6. **Quality gates** — No sprint closes without DoD (§5 per sprint)  

### Success Definition (v1.0 GA)

All MPS §22 GA criteria met: P0 AC pass, ≥3 pilots, 99.9% uptime, 0 P0 defects, parent activation ≥55%, teacher WAU ≥70%, pen test clean.

---

## 3. Repository Strategy

### Monorepo Structure

**Decision:** Turborepo monorepo (*resolves MPS OD-02 for execution*)

```
edutrack/
├── apps/
│   ├── api/                 # NestJS modular monolith
│   ├── admin-portal/        # Next.js
│   ├── teacher-portal/      # Next.js + PWA
│   ├── parent-portal/       # Next.js + PWA
│   ├── student-portal/      # Next.js (v1.1)
│   ├── parent-mobile/       # React Native
│   ├── teacher-mobile/      # React Native
│   └── operator-console/    # Next.js (internal)
├── packages/
│   ├── shared/              # Types, constants, utils
│   ├── domain/              # Shared value objects (optional)
│   ├── ui/                  # Design system components
│   ├── i18n/                # AR/EN translations
│   ├── api-client/          # Generated + hand-written client
│   └── config/              # ESLint, TS, Tailwind presets
├── workers/
│   ├── notification-worker/
│   └── report-worker/
├── infra/                   # Terraform (post Sprint 0)
├── docs/                    # Approved phase documents
└── turbo.json
```

### Package Boundaries

| Package | Owns | May Not Import |
|---------|------|----------------|
| `apps/api` | All bounded contexts as NestJS modules | Portal apps |
| `apps/*-portal` | UI only | Direct DB access |
| `packages/ui` | Presentational components | API or domain logic |
| `packages/shared` | DTOs, enums, validation schemas | App-specific code |
| `workers/*` | Async job handlers | UI |

**Enforcement:** ESLint `import/no-restricted-paths` + CI boundary check (Sprint 0).

### Shared Libraries

| Library | Purpose | Owner |
|---------|---------|-------|
| `@edutrack/ui` | Design system (PX-CMP-001–021) | Frontend Lead |
| `@edutrack/i18n` | AR/EN strings, RTL helpers | Frontend Lead |
| `@edutrack/shared` | Cross-cutting types | Architect |
| `@edutrack/api-client` | Typed API consumer | Backend Lead |

### Coding Ownership

| Bounded Context | Backend Owner | Frontend Owner |
|-----------------|---------------|----------------|
| Platform / Identity | Team Alpha | Team Alpha |
| Student Lifecycle | Team Beta | Team Beta |
| Academics | Team Beta | Team Gamma |
| Engagement | Team Gamma | Team Gamma |
| Insights | Team Alpha | Team Gamma |
| Finance (v2.0) | Team Delta | Team Delta |
| AI (v2.0) | Team Epsilon | Team Gamma |

---

## 4. Development Phases

Phases map to MPS modules. **No new requirements** — execution sequencing only.

### Phase A — Platform Foundation (Sprints 0–1)

| Item | Detail |
|------|--------|
| **Scope** | Monorepo, CI/CD skeleton, local dev, tenant model, audit foundation, observability baseline |
| **PRD refs** | FR-SET-008, NFR-MNT-001, NFR-MON-001, NFR-LOG-001 |
| **MPS** | §17 Architecture, §15 Multi-Tenant |
| **Exit** | Tenant provisioned in dev; health endpoint live; CI green |

### Phase B — Authentication (Sprint 2)

| Item | Detail |
|------|--------|
| **Scope** | Auth, JWT, refresh, MFA, RBAC, user management, parent activation |
| **PRD refs** | FR-SET-001–003, FR-SET-007, NFR-SEC-002–005 |
| **PX refs** | PX-SCR-001–006, PX-SCR-120–121 |
| **Exit** | All roles authenticate; RBAC enforced; MFA for admin roles |

### Phase C — Student Lifecycle (Sprints 3–4)

| Item | Detail |
|------|--------|
| **Scope** | Student Management, Admissions, Enrollment, Documents (admissions) |
| **PRD refs** | FR-STU-*, FR-ADM-*, FR-ENR-*, FR-DOC-* |
| **PX refs** | PX-SCR-020–035, PX-SCR-040–044, PX-FLW-005 |
| **Exit** | Admissions → enrollment zero re-entry (AC-ADM-002) |

### Phase D — Academics (Sprints 5–7)

| Item | Detail |
|------|--------|
| **Scope** | Scheduling, Attendance, Gradebook, Academic Records |
| **PRD refs** | FR-SCH-*, FR-ATT-*, FR-GRD-*, FR-ACR-* |
| **PX refs** | PX-SCR-050–064, PX-SCR-132, PX-FLW-003 |
| **Exit** | Teacher daily workflow ≤15 min; grade audit complete |

### Phase E — Parent Portal (Sprints 8–9)

| Item | Detail |
|------|--------|
| **Scope** | Teacher Portal, Parent Portal (web + mobile), dashboards |
| **PRD refs** | FR-TCH-*, FR-PAR-* |
| **PX refs** | PX-SCR-010–013, PX-DSH-002–003, PX-FLW-002 |
| **Exit** | Parent activation flow; multi-child; RTL verified |

### Phase F — Communication (Sprint 10)

| Item | Detail |
|------|--------|
| **Scope** | Messaging, Notifications (email, SMS, push, in-app), Calendar |
| **PRD refs** | FR-COM-*, FR-NOT-*, FR-CAL-* |
| **PX refs** | PX-SCR-128–130, PX-FLW-003 (absence notify) |
| **Exit** | Absence notification <5 min (AC-ATT-001) |

### Phase G — Analytics (Sprints 11–12)

| Item | Detail |
|------|--------|
| **Scope** | Reports, compliance templates, Analytics dashboards, Documents (full) |
| **PRD refs** | FR-RPT-*, FR-ANL-*, FR-DOC-* |
| **PX refs** | PX-SCR-090–093, PX-FLW-004 |
| **Exit** | Inspection pack <2 hours (MPS BG-05) |

### Phase H — Finance (Sprints 21–24, v2.0)

| Item | Detail |
|------|--------|
| **Scope** | Fees, Finance, Accounting, QPay integration |
| **PRD refs** | FR-FEE-*, FR-FIN-*, FR-ACC-* |
| **Exit** | Payment reconcile <1 min (AC-FEE-001) |

### Phase I — AI Layer (Sprints 25–26+, v2.0)

| Item | Detail |
|------|--------|
| **Scope** | AI Service, at-risk detection, attendance insights, report narratives |
| **PRD refs** | FR-AI-001–004, AC-AI-001 |
| **ARCH** | TDR-010, AI Service separation |
| **Exit** | Human approval enforced; confidence scores visible |

---

## 5. Sprint Plan

**Cadence:** 2-week sprints · **Total to MVP:** Sprint 0–16 (≈34 weeks)

### Sprint Summary Table

| Sprint | Phase | Focus | Duration | Milestone |
|--------|-------|-------|----------|-----------|
| 0 | A | Foundation | 2 wk | BP-MS-00 |
| 1 | A | Tenant + platform | 2 wk | BP-MS-01 |
| 2 | B | Auth + RBAC | 2 wk | BP-MS-02 |
| 3 | C | Student + admissions | 2 wk | — |
| 4 | C | Enrollment + documents | 2 wk | BP-MS-03 |
| 5 | D | Scheduling + attendance | 2 wk | — |
| 6 | D | Gradebook | 2 wk | — |
| 7 | D | Academic records | 2 wk | BP-MS-04 |
| 8 | E | Teacher portal | 2 wk | — |
| 9 | E | Parent portal + mobile | 2 wk | BP-MS-05 |
| 10 | F | Comms + notifications | 2 wk | BP-MS-06 |
| 11 | G | Reports | 2 wk | — |
| 12 | G | Analytics + documents | 2 wk | BP-MS-07 |
| 13 | — | Integrations + hardening | 2 wk | — |
| 14 | — | QA + security prep | 2 wk | BP-MS-08 |
| 15 | — | Pilot prep | 2 wk | BP-MS-09 |
| 16 | — | MVP GA / pilots live | 2 wk | **v1.0 GA** |
| 17–18 | — | v1.1 homework + assessments | 4 wk | — |
| 19–20 | — | v1.1 student portal, CMS, certs | 4 wk | **v1.1** |
| 21–24 | H | Finance module | 8 wk | **v2.0** |
| 25–26+ | I | AI basic | 4+ wk | AI GA |

---

### Sprint 0 — Foundation

| Field | Detail |
|-------|--------|
| **Objectives** | Monorepo live; CI pipeline; local dev; coding standards enforced |
| **Deliverables** | Turborepo scaffold; ESLint/Prettier; Jest config; GitHub Actions (lint+test); Docker Compose (Postgres, Redis); `docs/runbooks/` stub; health check endpoint skeleton |
| **Dependencies** | G7 approval; AWS account (OTQ-06); GitHub org |
| **PRD/NFR** | NFR-MNT-001, NFR-LOG-001 |
| **Acceptance Criteria** | `turbo build` passes; CI green on `main`; developer onboarding <4 hours |
| **Definition of Done** | README per app; branch protection on `main`; no secrets in repo |
| **Duration** | 2 weeks |
| **Risks** | Monorepo tool friction → Turborepo docs + architect pairing |

---

### Sprint 1 — Platform Foundation

| Field | Detail |
|-------|--------|
| **Objectives** | Tenant model, academic year config, audit log, observability |
| **Deliverables** | Platform module; tenant CRUD; campus model; academic year API; append-only audit; OpenTelemetry + structured logging; correlation IDs |
| **Dependencies** | Sprint 0 |
| **PRD** | FR-SET-001, FR-SET-004, FR-SET-008; NFR-LOG-002 |
| **Acceptance Criteria** | AC-SET-002 audit entries on config change; tenant isolated in integration tests |
| **DoD** | ≥80% unit coverage on platform domain; integration tests pass |
| **Duration** | 2 weeks |
| **Risks** | RLS policy complexity → Security pairing in Sprint 2 |

---

### Sprint 2 — Authentication & RBAC

| Field | Detail |
|-------|--------|
| **Objectives** | Complete auth stack; RBAC; MFA; parent activation |
| **Deliverables** | Login, refresh, logout; Argon2id; JWT RS256; MFA TOTP; role/permission CRUD; parent invite activation (PX-SCR-005) |
| **Dependencies** | Sprint 1 |
| **PRD** | FR-SET-002–003, FR-SET-007; NFR-SEC-001–005 |
| **PX** | PX-SCR-001–006, PX-FLW-008 |
| **Acceptance Criteria** | AC-SET-001 permissions <1 min; MFA blocks admin without setup |
| **DoD** | Security review checklist; pen test scope doc started |
| **Duration** | 2 weeks |
| **Risks** | Auth bugs → mandatory security review before merge |

---

### Sprint 3 — Student Management & Admissions

| Field | Detail |
|-------|--------|
| **Objectives** | Student record; admissions pipeline |
| **Deliverables** | Student CRUD, guardians, medical alerts; admissions pipeline, public form, offers, waitlist |
| **Dependencies** | Sprint 2 |
| **PRD** | FR-STU-001–006; FR-ADM-001–006 |
| **PX** | PX-SCR-020–024, PX-SCR-030–034 |
| **Acceptance Criteria** | AC-STU-001 allergy on roster; AC-ADM-001 inquiry <1 min |
| **DoD** | Admin portal student list + admissions pipeline UI (stub OK if API complete) |
| **Duration** | 2 weeks |
| **Risks** | Scope creep on pipeline customization → configurable stages only |

---

### Sprint 4 — Enrollment & Documents

| Field | Detail |
|-------|--------|
| **Objectives** | Zero re-entry enrollment; document upload |
| **Deliverables** | Enrollment wizard; bulk re-enroll; section capacity; parent auto-provision; document upload (S3); admissions doc checklist |
| **Dependencies** | Sprint 3 |
| **PRD** | FR-ENR-001–007; FR-DOC-001–003; FR-ADM-007 |
| **PX** | PX-SCR-040–044, PX-FLW-005 |
| **Acceptance Criteria** | AC-ADM-002, AC-ENR-001, AC-ENR-002 |
| **DoD** | E2E test: applicant → enrolled → parent account |
| **Duration** | 2 weeks |
| **Risks** | Bulk import edge cases → validation report required |

---

### Sprint 5 — Scheduling & Attendance

| Field | Detail |
|-------|--------|
| **Objectives** | Timetables; daily attendance; parent notify path |
| **Deliverables** | Timetable builder; conflict detection; attendance marking; bulk mark; lock; notification event publish |
| **Dependencies** | Sprint 4 |
| **PRD** | FR-SCH-001–006; FR-ATT-001–006 |
| **PX** | PX-SCR-050–053, PX-SCR-132 |
| **Acceptance Criteria** | AC-SCH-001; AC-ATT-002 lock |
| **DoD** | Teacher mobile attendance (web responsive minimum) |
| **Duration** | 2 weeks |
| **Risks** | Morning spike → queue notification dispatch |

---

### Sprint 6 — Gradebook

| Field | Detail |
|-------|--------|
| **Objectives** | Grades, weights, lock, audit |
| **Deliverables** | Gradebook grid; categories; term calculation; lock/override; grade history; parent publish workflow |
| **Dependencies** | Sprint 5 |
| **PRD** | FR-GRD-001–008; BR-GRD-001–002 |
| **PX** | PX-SCR-060–064 |
| **Acceptance Criteria** | AC-GRD-001, AC-GRD-002, AC-GRD-003 |
| **DoD** | Grade change audit query <2s |
| **Duration** | 2 weeks |
| **Risks** | Grading policy variants → configurable weights only in MVP |

---

### Sprint 7 — Academic Records

| Field | Detail |
|-------|--------|
| **Objectives** | Promotion, retention, history |
| **Deliverables** | Year history; promotion wizard; retention; transfer package data |
| **Dependencies** | Sprint 6 |
| **PRD** | FR-ACR-001–005; BR-PRO-001, BR-REP-001 |
| **PX** | PX-SCR-044 |
| **Acceptance Criteria** | AC-ACR-001 promotion validation report |
| **DoD** | Integration with locked grades only |
| **Duration** | 2 weeks |
| **Risks** | Bulk promotion performance → batch job if >500 students |

---

### Sprint 8 — Teacher Portal

| Field | Detail |
|-------|--------|
| **Objectives** | Teacher dashboard; quick actions; RTL |
| **Deliverables** | Teacher portal app; dashboard (PX-DSH-003); quick attendance/grade; class roster; AR/EN i18n |
| **Dependencies** | Sprints 5–7 APIs |
| **PRD** | FR-TCH-001–005 |
| **PX** | PX-SCR-012, PX-FLW-003 |
| **Acceptance Criteria** | AC-TCH-001; dashboard <2s |
| **DoD** | axe-core pass on teacher dashboard |
| **Duration** | 2 weeks |
| **Risks** | RTL layout bugs → Arabic QA every PR |

---

### Sprint 9 — Parent Portal & Mobile

| Field | Detail |
|-------|--------|
| **Objectives** | Parent web + mobile; activation; multi-child |
| **Deliverables** | Parent portal; parent-mobile RN app; activation flow; child switcher; attendance/grade views |
| **Dependencies** | Sprint 8; Firebase project |
| **PRD** | FR-PAR-001–008 |
| **PX** | PX-SCR-013, PX-SCR-005, PX-FLW-002 |
| **Acceptance Criteria** | AC-PAR-001, AC-PAR-002 |
| **DoD** | Push notification received on test device |
| **Duration** | 2 weeks |
| **Risks** | App store delay → PWA fallback for pilot |

---

### Sprint 10 — Communication & Notifications

| Field | Detail |
|-------|--------|
| **Objectives** | Messaging; multi-channel notifications; calendar |
| **Deliverables** | Message threads; notification worker; Twilio SMS; FCM push; SES email; in-app center; academic calendar (Hijri+Gregorian) |
| **Dependencies** | Sprint 9; Twilio, SES, FCM configured |
| **PRD** | FR-COM-001–006; FR-NOT-001–006; FR-CAL-001–003 |
| **PX** | PX-SCR-128–130 |
| **Acceptance Criteria** | AC-ATT-001 absence <5 min; AC-COM-001 scoped messaging |
| **DoD** | Notification delivery rate ≥95% in staging |
| **Duration** | 2 weeks |
| **Risks** | SMS regional delivery → Twilio fallback routing |

---

### Sprint 11 — Reports & Compliance

| Field | Detail |
|-------|--------|
| **Objectives** | Report catalog; KHDA/ADEK/MOEHE templates |
| **Deliverables** | Report worker; PDF generation; template engine; compliance packs |
| **Dependencies** | Sprint 7 data |
| **PRD** | FR-RPT-001–005 |
| **PX** | PX-SCR-090–092, PX-FLW-004 |
| **Acceptance Criteria** | AC-RPT-001 inspection pack <2 hours |
| **DoD** | Report queue does not block API (async only) |
| **Duration** | 2 weeks |
| **Risks** | Template accuracy → 3 school validations |

---

### Sprint 12 — Analytics & Documents

| Field | Detail |
|-------|--------|
| **Objectives** | Principal dashboard; document library |
| **Deliverables** | Analytics API + dashboard; principal/registrar dashboards; document library; consent flags |
| **Dependencies** | Sprints 1–11 |
| **PRD** | FR-ANL-001–005; FR-DOC-004–006 |
| **PX** | PX-SCR-010–011, PX-SCR-017–018, PX-SCR-131 |
| **Acceptance Criteria** | AC-ANL-001 dashboard <3s |
| **DoD** | WASS event instrumentation live |
| **Duration** | 2 weeks |
| **Risks** | Dashboard query perf → materialized views |

---

### Sprint 13 — Integrations & Hardening

| Field | Detail |
|-------|--------|
| **Objectives** | Cloudinary; Postgres FTS search; performance pass |
| **Deliverables** | Media upload; student search <2s; load test k6 (attendance peak); staging on AWS Bahrain |
| **Dependencies** | Sprint 12 |
| **PRD** | FR-STU-005; NFR-PER-001–007 |
| **NFR** | NFR-SCL-004 horizontal scale test |
| **Acceptance Criteria** | NFR-PER-005 search <2s for 5K students |
| **DoD** | k6 report: 500 RPS sustained 5 min |
| **Duration** | 2 weeks |
| **Risks** | AWS Bahrain service limits → early quota request |

---

### Sprint 14 — QA & Security

| Field | Detail |
|-------|--------|
| **Objectives** | Full regression; penetration test; accessibility audit |
| **Deliverables** | Playwright E2E suite (10 flows); OWASP ZAP scan; WCAG 2.2 audit; bug bash; SOC 2 control mapping started |
| **Dependencies** | Sprint 13 |
| **PRD** | All P0 AC; NFR-ACC-001; NFR-SEC-007 |
| **Acceptance Criteria** | Zero open critical/high pen findings |
| **DoD** | QA sign-off document |
| **Duration** | 2 weeks |
| **Risks** | P0 defects found → Sprint 15 buffer absorbs |

---

### Sprint 15 — Pilot Preparation

| Field | Detail |
|-------|--------|
| **Objectives** | Migrate 3 pilot schools; training; go-live runbooks |
| **Deliverables** | Data migration tooling; pilot tenant config; EduTrack Academy admin training; support runbooks; status page live |
| **Dependencies** | Sprint 14 QA pass; pilot agreements (MPS OD-07) |
| **MPS** | BG-06, §22 GA criteria prep |
| **Acceptance Criteria** | 3 tenants provisioned; IM assigned each |
| **DoD** | Onboarding CSAT dry-run ≥4.5 |
| **Duration** | 2 weeks |
| **Risks** | Migration data quality → validation report per school |

---

### Sprint 16 — MVP GA & Pilot Launch

| Field | Detail |
|-------|--------|
| **Objectives** | v1.0 GA; pilots live; production deploy |
| **Deliverables** | Production release v1.0.0; 3+ pilots active; monitoring dashboards; hypercare roster |
| **Dependencies** | Sprint 15; G7+GA executive sign-off |
| **MPS** | §22 all GA criteria |
| **Acceptance Criteria** | All MPS §22 boxes checked |
| **DoD** | Release notes; rollback tested; 99.9% SLO monitoring active |
| **Duration** | 2 weeks |
| **Risks** | Launch day incident → hypercare plan §29 |

---

### Sprints 17–20 — v1.1 (Summary)

| Sprint | Deliverables | PRD Modules |
|--------|-------------|-------------|
| **17** | Homework module; teacher/parent views | FR-HW-* |
| **18** | Assessments; exam schedule; results publish | FR-ASM-* |
| **19** | Student portal; offline attendance queue | FR-STP-*; FR-ATT-008 |
| **20** | CMS; certificates; Google SSO; OpenSearch migration | FR-CMS-*, FR-CER-*; MPS C-07 |

---

### Sprints 21–26+ — v2.0 Finance & AI (Summary)

| Sprint | Deliverables | PRD Modules |
|--------|-------------|-------------|
| **21–22** | Fee structure, invoicing, parent fee view | FR-FEE-* |
| **23** | QPay webhooks, reconciliation | AC-FEE-001 |
| **24** | Finance, accounting, HR, payroll foundation | FR-FIN-*, FR-HR-* |
| **25–26** | AI Service; at-risk; attendance insights; narratives | FR-AI-001–004 |

---

## 6. Module Delivery Order

| Order | Module | Sprint | Phase | PRD Priority |
|-------|--------|--------|-------|--------------|
| 1 | Settings / Platform | 1–2 | A, B | P0 |
| 2 | Student Management | 3 | C | P0 |
| 3 | Admissions | 3–4 | C | P0 |
| 4 | Enrollment | 4 | C | P0 |
| 5 | Documents | 4, 12 | C, G | P0 |
| 6 | Scheduling | 5 | D | P0 |
| 7 | Attendance | 5 | D | P0 |
| 8 | Gradebook | 6 | D | P0 |
| 9 | Academic Records | 7 | D | P0 |
| 10 | Teacher Portal | 8 | E | P0 |
| 11 | Parent Portal | 9 | E | P0 |
| 12 | Communication | 10 | F | P0 |
| 13 | Notifications | 10 | F | P0 |
| 14 | Calendar | 10 | F | P0 |
| 15 | Reports | 11 | G | P0 |
| 16 | Analytics | 12 | G | P0 |
| 17 | Homework | 17 | v1.1 | P1 |
| 18 | Assessments | 18 | v1.1 | P1 |
| 19 | Student Portal | 19 | v1.1 | P1 |
| 20 | CMS / Certificates | 20 | v1.1 | P1 |
| 21 | Fees / Finance / Accounting | 21–24 | H | P2 |
| 22 | HR / Payroll | 24 | H | P2 |
| 23 | AI | 25–26 | I | P2 |

---

## 7. Engineering Milestones

| ID | Milestone | Sprint | Criteria |
|----|-----------|--------|----------|
| BP-MS-00 | Dev environment ready | 0 | CI green; local docker up |
| BP-MS-01 | Tenant platform live | 1 | Tenant + audit in staging |
| BP-MS-02 | Auth complete | 2 | RBAC + MFA pass security review |
| BP-MS-03 | Student lifecycle E2E | 4 | AC-ADM-002, AC-ENR-001 |
| BP-MS-04 | Academics complete | 7 | AC-GRD-*, AC-ATT-* |
| BP-MS-05 | Portals beta | 9 | Parent + teacher usable |
| BP-MS-06 | Notifications live | 10 | AC-ATT-001 |
| BP-MS-07 | Insights complete | 12 | AC-RPT-001, AC-ANL-001 |
| BP-MS-08 | Security & QA gate | 14 | Pen test clean |
| BP-MS-09 | Pilot ready | 15 | 3 tenants migrated |
| BP-MS-10 | **v1.0 GA** | 16 | MPS §22 all criteria |
| BP-MS-11 | v1.1 GA | 20 | P1 modules + OpenSearch |
| BP-MS-12 | v2.0 GA | 26 | Finance + AI basic |

---

## 8. QA Strategy

| Principle | Implementation |
|-----------|----------------|
| **Shift left** | QA involved in sprint planning; AC review before dev |
| **Tenant isolation** | Every integration test uses 2+ tenants |
| **Bilingual** | AR + EN test paths for all P0 portals |
| **Automation first** | E2E for 10 critical flows by Sprint 14 |
| **Gate** | No production deploy without QA sign-off |

**QA team engagement:** Sprint 0 (test strategy); Sprint 3+ (story test cases); Sprint 14 (full regression); Sprint 16 (GA sign-off).

---

## 9. Testing Strategy

| Level | Scope | Target | Tool | When |
|-------|-------|--------|------|------|
| **Unit** | Domain logic, use cases | ≥80% domain | Jest | Every PR |
| **Integration** | API endpoints, DB, RLS | 100% P0 endpoints | Supertest + test DB | Every PR |
| **E2E** | Critical user flows | 10+ flows | Playwright | Sprint 8+; full Sprint 14 |
| **Accessibility** | WCAG 2.2 AA P0 | 100% core flows | axe-core + manual | Sprint 8+; audit Sprint 14 |
| **Performance** | Attendance peak, search | NFR-PER targets | k6 | Sprint 13, 16 |
| **Security** | OWASP Top 10 | Zero critical open | ZAP + manual pen test | Sprint 14 |
| **Mobile** | Parent/teacher apps | Core flows | Detox or Maestro | Sprint 9+ |

### Critical E2E Flows (map to PX-FLW)

1. Parent activation (PX-FLW-002)  
2. Teacher attendance (PX-FLW-003)  
3. Admissions → enrollment (PX-FLW-005)  
4. Grade entry + publish + parent view  
5. Inspection report (PX-FLW-004)  
6. RBAC denial (unauthorized access)  
7. Cross-tenant isolation negative test  
8. MFA login  
9. Message teacher → parent  
10. Bulk re-enrollment  

---

## 10. CI/CD Strategy

| Stage | Trigger | Steps | Target |
|-------|---------|-------|--------|
| **PR** | Pull request | Lint, typecheck, unit, integration | <10 min |
| **Merge to develop** | Push | Above + build images + deploy dev | <20 min |
| **Merge to main** | Push | Above + deploy staging + E2E smoke | <30 min |
| **Release tag** | `v*.*.*` | Staging E2E full + manual approval + prod blue-green | <45 min |

**Quality gates:** No merge with failing tests; security scan (Dependabot + Snyk); container image scan (Trivy).

---

## 11. Branching Strategy

Per EDU-ARCH-005 §17: `main` ← `release/*` ← `develop` ← `feature/*` | `fix/*`

| Rule | Detail |
|------|--------|
| Hotfix | `fix/*` from `main` → merge to `main` + `develop` |
| Release branch | `release/v1.0.0` created Sprint 15; code freeze 1 week before GA |
| Branch protection | `main` + `develop`: 1 approval, CI pass, no force push |

---

## 12. Release Strategy

| Version | Sprint | Type | Rollout |
|---------|--------|------|---------|
| v0.9.0 | 12 | Alpha | Internal + design partners |
| v1.0.0-rc | 15 | Release candidate | Pilot schools only |
| v1.0.0 | 16 | **GA** | Feature flags 10% → 50% → 100% |
| v1.1.0 | 20 | Minor | All tenants |
| v2.0.0 | 26 | Major | Finance opt-in per tenant |

**Cadence post-GA:** Minor monthly; patch as needed; major quarterly+.

---

## 13. Deployment Strategy

| Environment | Method | Strategy |
|-------------|--------|----------|
| Dev | Auto on merge to `develop` | Rolling update |
| Staging | Auto on merge to `main` | Blue-green |
| Production | Manual approval post-tag | Blue-green; smoke test; auto-rollback on failure |

**Database migrations:** Forward-only; run before app deploy; backward-compatible one release.

---

## 14. Feature Flag Strategy

| Flag Type | Tool | Example |
|-----------|------|---------|
| **Release** | LaunchDarkly or custom DB flags | `parent_portal_v1` |
| **Tenant** | Tenant settings | `enable_sms_notifications` |
| **Kill switch** | Global flag | `disable_attendance_write` |

**Rules:** All new P1+ features behind flags until stable; flags removed within 2 releases of 100% rollout.

---

## 15. Environment Strategy

| Env | Purpose | Data | URL |
|-----|---------|------|-----|
| **Local** | Developer machine | Docker seed | `localhost` |
| **Dev** | Integration | Synthetic | `dev.edutrack.internal` |
| **QA** | QA team | Anonymized | `qa.edutrack.io` |
| **Staging** | Pre-prod | Prod-like anonymized | `staging.edutrack.io` |
| **Production** | Live tenants | Real | `{tenant}.edutrack.com` |
| **Sandbox** | Sales demos | Demo seed | `sandbox.edutrack.io` |

**Isolation:** Separate AWS accounts recommended (MPS OTQ-05); minimum separate VPCs per env.

---

## 16. Migration Strategy

| Type | Approach | Sprint |
|------|----------|--------|
| **Schema** | Sequential migrations; reviewed in PR | Ongoing |
| **School data import** | CSV templates + validation report | 4, 15 |
| **Legacy SIS** | Professional services playbook; per-school mapping | 15 |
| **Tenant onboarding** | Automated provision + IM checklist | 15 |

**Rollback:** Migrations must be backward-compatible; destructive migrations require maintenance window + backup.

---

## 17. Rollback Strategy

| Scenario | Action | RTO |
|----------|--------|-----|
| Bad deploy | Blue-green revert to previous image | <15 min |
| Bad migration | Restore DB PITR + revert app | <2 hours |
| Feature bug | Disable feature flag | <5 min |
| Security incident | Kill switch + isolate tenant | <30 min |

**Requirement:** Rollback drill in Sprint 15 before GA.

---

## 18. Monitoring Checklist

| Item | Owner | Sprint |
|------|-------|--------|
| ☐ API latency P95 dashboard | SRE | 1 |
| ☐ Error rate alerts (P0/P1) | SRE | 1 |
| ☐ Uptime synthetic checks (login, attendance) | SRE | 10 |
| ☐ Queue depth alerts | DevOps | 10 |
| ☐ WASS business metric dashboard | PM + SRE | 12 |
| ☐ DB connection pool monitoring | DBA | 13 |
| ☐ Status page (public) | DevOps | 15 |
| ☐ On-call rotation + PagerDuty | SRE | 15 |
| ☐ Runbooks linked from alerts | SRE | 16 |

---

## 19. Security Checklist

| Item | Owner | Sprint |
|------|-------|--------|
| ☐ RLS on all tenant tables | DBA + Security | 2 |
| ☐ Secrets in Secrets Manager only | DevOps | 0 |
| ☐ MFA enforced admin roles | Security | 2 |
| ☐ Audit log 100% sensitive actions | Backend | 1 |
| ☐ Dependabot + SCA in CI | Security | 0 |
| ☐ WAF enabled staging/prod | DevOps | 13 |
| ☐ Penetration test (external) | Security | 14 |
| ☐ PDPL privacy impact assessment | Legal | 14 |
| ☐ Incident response drill | Security | 15 |
| ☐ SOC 2 control mapping started | Security | 14 |

---

## 20. Performance Checklist

| NFR | Target | Verified Sprint |
|-----|--------|---------------|
| NFR-PER-001 P95 portal | <2s | 13, 16 |
| NFR-PER-002 P95 API read | <500ms | 13 |
| NFR-PER-003 Attendance 30 students | <3s | 5, 13 |
| NFR-PER-005 Search 5K | <2s | 13 |
| NFR-PER-006 500 concurrent/school | Pass | 13 |
| Load test 500 RPS platform | Pass | 13 |
| CDN static assets | Configured | 13 |

---

## 21. Documentation Checklist

| Document | Owner | Sprint |
|----------|-------|--------|
| ☐ Developer onboarding README | Architect | 0 |
| ☐ API changelog process | Backend Lead | 2 |
| ☐ Runbooks (deploy, rollback, incident) | DevOps | 15 |
| ☐ Admin user guide (MVP modules) | PM + CS | 15 |
| ☐ Release notes template | PM | 14 |
| ☐ OpenAPI published staging | Backend | 12 |
| ☐ Architecture decision log (ongoing) | Architect | 0+ |

---

## 22. Technical Debt Strategy

| Category | Policy |
|----------|--------|
| **Allocation** | 15% sprint capacity post-Sprint 16 |
| **Logging** | `tech-debt` GitHub label; reviewed monthly |
| **Threshold** | No more than 10 open P2 debt items per team |
| **Allowed MVP debt** | OpenSearch deferred to v1.1; WebSocket deferred; Google SSO v1.1 |
| **Forbidden debt** | Tenant isolation shortcuts; skipped audit logs; hardcoded secrets |

---

## 23. Team Responsibilities

| Role | Responsibility |
|------|----------------|
| **CTO** | Architecture authority; G7/G gates; escalation |
| **Chief Architect** | Module boundaries; TDR compliance; review |
| **Principal Backend** | API module delivery; data integrity |
| **Principal Frontend** | Portals, RTL, design system |
| **DevOps Lead** | CI/CD, AWS, monitoring, deployments |
| **QA Lead** | Test strategy; regression; GA sign-off |
| **Security Lead** | Reviews; pen test; RLS validation |
| **AI Lead** | Phase I delivery (Sprint 25+) |
| **Product Manager** | Sprint priorities; AC clarity; scope control |
| **Scrum Master** | Ceremonies; impediments; velocity tracking |

---

## 24. RACI Matrix

| Activity | CTO | Architect | BE | FE | DevOps | QA | Security | PM | SM |
|----------|:---:|:---------:|:--:|:--:|:------:|:--:|:--------:|:--:|:--:|
| Sprint planning | I | C | R | R | C | C | I | A | R |
| Architecture review | A | R | C | C | C | I | C | I | I |
| Feature development | I | C | R | R | I | C | C | A | I |
| CI/CD pipeline | I | C | C | C | R/A | I | C | I | I |
| Security review | A | C | C | C | C | I | R | I | I |
| QA sign-off | I | I | C | C | I | R/A | C | A | I |
| Production deploy | A | I | C | I | R | C | C | I | I |
| Incident response | A | C | R | R | R | I | R | I | C |
| Scope change | A | C | I | I | I | I | I | R | C |

*R=Responsible, A=Accountable, C=Consulted, I=Informed*

---

## 25. Delivery KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Sprint velocity stability | ±15% after Sprint 4 | Story points |
| Sprint goal success rate | ≥85% | Sprints meeting committed goals |
| CI pass rate | ≥95% | Main branch |
| PR review turnaround | <24h | Business hours |
| Change failure rate | <5% | Deploys causing rollback |
| Mean time to recovery | <1h | Incidents |
| Test automation coverage (P0 APIs) | 100% by Sprint 14 | Integration tests |
| P0 defect escape | <2 per release | Production |
| On-time milestone rate | ≥85% | BP-MS-* dates |

---

## 26. Risk Register

| ID | Risk | Prob | Impact | Mitigation | Owner |
|----|------|------|--------|------------|-------|
| DR-01 | Sprint 16 slip | Med | High | 2-week buffer in S14–15; scope lock | SM |
| DR-02 | Pilot migration failure | Med | High | Validation reports; IM per school | PM |
| DR-03 | Security finding at Sprint 14 | Med | High | Continuous security review | Security |
| DR-04 | Key hire delay | Med | Med | Contractor backfill | CTO |
| DR-05 | AWS Bahrain quota | Low | High | Early quota request Sprint 0 | DevOps |
| DR-06 | RTL defect volume | High | Med | Arabic QA every sprint | FE Lead |
| DR-07 | Notification delivery failures | Med | Med | Retry + DLQ + monitoring | BE Lead |
| DR-08 | Scope creep in sprints | High | High | PM gate; MPS change control | PM |
| DR-09 | Mobile app store delay | Med | Med | PWA fallback | FE Lead |
| DR-10 | Funding/runway | Med | Critical | Executive track (business) | CEO |

---

## 27. Launch Checklist

| # | Item | Owner | Sprint |
|---|------|-------|--------|
| 1 | All MPS §22 GA criteria met | PM | 16 |
| 2 | Pen test zero critical | Security | 14 |
| 3 | 3+ pilots migrated | CS | 15 |
| 4 | Production deploy rollback tested | DevOps | 15 |
| 5 | Status page live | DevOps | 15 |
| 6 | Support runbooks complete | CS | 15 |
| 7 | Legal PDPL sign-off | Legal | 14 |
| 8 | Executive GA approval | CEO | 16 |
| 9 | Marketing launch assets | GTM | 16 |
| 10 | Hypercare roster staffed | CS + Eng | 16 |

---

## 28. Post Launch Plan

| Period | Activities |
|--------|------------|
| **Week 1–2** | Hypercare (§29); daily standups with pilots |
| **Week 3–4** | NPS survey; activation metrics review |
| **Month 2** | v1.0.1 patch; begin Sprint 17 (v1.1) |
| **Month 3** | Retrospective; case study publication |
| **Q4 Y1** | 15 paying schools target (MPS BG-02) |

---

## 29. Hypercare Plan

| Element | Detail |
|---------|--------|
| **Duration** | 4 weeks post-GA |
| **Coverage** | 12×5 dedicated support; on-call 24×7 for P0 |
| **Team** | 2 engineers + 1 CS + IM per pilot |
| **Response SLA** | P0: 1h; P1: 4h |
| **Cadence** | Daily pilot check-in; weekly executive summary |
| **Exit criteria** | <5 P1 tickets/week; NPS ≥40; activation ≥55% |

---

## 30. Future Expansion

| Horizon | Blueprint Extension |
|---------|---------------------|
| **v1.1** | Sprints 17–20 (documented above) |
| **v2.0** | Sprints 21–26 Finance, HR, AI |
| **v3.0** | New blueprint revision BP-007 v2.0 — Operations modules |
| **v4.0** | Marketplace, developer portal |
| **Scale** | OpenSearch cluster; read replica expansion; optional service extraction |

---

## 31. Open Questions

| ID | Question | Decision By | Sprint |
|----|----------|-------------|--------|
| OQ-BP-01 | WebSocket vs polling for in-app notifications | Principal BE | Sprint 10 |
| OQ-BP-02 | Detox vs Maestro for mobile E2E | QA Lead | Sprint 9 |
| OQ-BP-03 | LaunchDarkly vs custom feature flags | Architect | Sprint 0 |
| OQ-BP-04 | Separate AWS accounts per env | DevOps | Sprint 0 |
| OQ-BP-05 | Pilot school data formats (3 schools) | CS + PM | Sprint 14 |
| OQ-BP-06 | App store release timing vs PWA-only pilot | PM + FE | Sprint 9 |

*Inherited from MPS §28 OD-01–OD-07 remain open at business/architecture level.*

---

## 32. Executive Recommendation

### Summary

The Final Implementation Blueprint delivers a **34-week path to v1.0 GA** across 17 sprints (0–16), with clear phase boundaries, PRD traceability, and enterprise QA/security gates. The plan aligns with MPS MVP definition, ARCH technology stack, and PX experience targets.

### Recommendation

## **GO**

Approve G7 and begin **Sprint 0** upon:
1. Engineering team staffed to ≥80% of Y1 plan  
2. AWS account + GitHub org provisioned  
3. Pilot school agreements in progress (≥2 signed by Sprint 12)  

### **HOLD** if:
- G6/MPS not formally approved (prerequisite)  
- Seed funding not secured  

### **NO GO** if:
- Scope expansion requested without PRD change control  

---

## 33. Readiness Assessment

| Dimension | Score (1–5) | Notes |
|-----------|-------------|-------|
| **Engineering Readiness** | 4.7 | Blueprint complete; team hiring in progress |
| **Operational Readiness** | 3.8 | AWS/pilots pending |
| **Release Readiness** | 4.5 | Clear GA criteria and launch checklist |
| **Security Readiness** | 4.6 | Checklists defined; pen test scheduled Sprint 14 |
| **QA Readiness** | 4.5 | Test strategy + E2E flows mapped |

| Metric | Value |
|--------|-------|
| Engineering Readiness | **4.7 / 5.0** |
| Operational Readiness | **3.8 / 5.0** |
| Release Readiness | **4.5 / 5.0** |
| Security Readiness | **4.6 / 5.0** |
| QA Readiness | **4.5 / 5.0** |
| **Overall Delivery Readiness** | **4.4 / 5.0** |

---

### Approval Gate: G7 — Blueprint Approval

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Sprint plan maps to MPS modules and PRD IDs | ☐ |
| 2 | No new business scope introduced | ☐ |
| 3 | CI/CD and environment strategy approved | ☐ |
| 4 | QA and security checklists accepted | ☐ |
| 5 | RACI and team responsibilities agreed | ☐ |
| 6 | Engineering capacity validated for Y1 | ☐ |
| 7 | Pilot and launch plans accepted by CS/GTM | ☐ |
| 8 | Executive signatures recorded | ☐ |

**Upon G7 approval:** Begin Sprint 0. Do not write production application code before Sprint 0 kickoff.

| Role | Approval | Date |
|------|----------|------|
| CTO | ☐ | |
| Chief Architect | ☐ | |
| VP Engineering | ☐ | |
| DevOps Lead | ☐ | |
| QA Lead | ☐ | |
| Security Lead | ☐ | |
| Product Manager | ☐ | |
| Scrum Master | ☐ | |

---

*End of Document — EDU-BP-007 v1.0.0*
