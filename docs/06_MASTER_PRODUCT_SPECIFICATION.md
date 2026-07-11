# EduTrack — Master Product Specification

| Field | Value |
|-------|-------|
| **Document ID** | EDU-MPS-006 |
| **Version** | 1.0.0 |
| **Status** | Master Draft — Pending G6 Stakeholder Approval |
| **Phase** | Phase 6 — Master Specification (Consolidation) |
| **Role** | **Single Source of Truth** for the EduTrack platform |
| **Author** | EduTrack Executive Documentation Office |
| **Last Updated** | 2026-07-08 |
| **Classification** | Internal — Confidential |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-08 | Executive Documentation Office | Initial master consolidation |

### Consolidated Source Documents (All Approved)

| Phase | Document ID | Title | File |
|-------|-------------|-------|------|
| 1 | EDU-DISC-001 | Product Discovery | `docs/01_PRODUCT_DISCOVERY.md` |
| 2 | EDU-STRAT-002 | Product Strategy | `docs/02_PRODUCT_STRATEGY.md` |
| 3 | EDU-PRD-003 | Product Requirements Document | `docs/03_PRODUCT_REQUIREMENTS_DOCUMENT.md` |
| 4 | EDU-PX-004 | Product Experience Specification | `docs/04_PRODUCT_EXPERIENCE_SPECIFICATION.md` |
| 5 | EDU-ARCH-005 | Technical Architecture | `docs/05_TECHNICAL_ARCHITECTURE.md` |

**This document consolidates approved content only. It does not introduce new requirements, change business decisions, or redesign the platform.**

### Approval Gate — G6: Master Specification Approval

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| CEO / Executive Sponsor | | | | Pending |
| Chief Product Officer | | | | Pending |
| Chief Technology Officer | | | | Pending |
| VP Product Experience | | | | Pending |
| VP Engineering | | | | Pending |
| VP Go-To-Market | | | | Pending |
| Chief Financial Officer | | | | Pending |
| Legal / Compliance | | | | Pending |

**Gate criteria:** Consolidation complete; conflicts resolved or explicitly deferred; traceability matrix validated; readiness scores acknowledged; no new scope introduced; executive team confirms MPS as implementation authority.

**Post-G6:** Proceed to **Final Implementation Blueprint** (not before G6 approval).

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Product Vision](#2-product-vision)
3. [Business Objectives](#3-business-objectives)
4. [Product Scope](#4-product-scope)
5. [Personas](#5-personas)
6. [Product Modules](#6-product-modules)
7. [Functional Requirements Summary](#7-functional-requirements-summary)
8. [Non-Functional Requirements Summary](#8-non-functional-requirements-summary)
9. [User Experience Summary](#9-user-experience-summary)
10. [Information Architecture](#10-information-architecture)
11. [Screen Inventory Summary](#11-screen-inventory-summary)
12. [User Journey Summary](#12-user-journey-summary)
13. [AI Strategy Summary](#13-ai-strategy-summary)
14. [Platform Strategy](#14-platform-strategy)
15. [Multi-Tenant Strategy](#15-multi-tenant-strategy)
16. [Security Summary](#16-security-summary)
17. [Architecture Summary](#17-architecture-summary)
18. [Domain Model Summary](#18-domain-model-summary)
19. [Integration Summary](#19-integration-summary)
20. [Infrastructure Summary](#20-infrastructure-summary)
21. [Release Roadmap](#21-release-roadmap)
22. [MVP Definition](#22-mvp-definition)
23. [Version Roadmap](#23-version-roadmap)
24. [KPIs](#24-kpis)
25. [Success Metrics](#25-success-metrics)
26. [Risks](#26-risks)
27. [Dependencies](#27-dependencies)
28. [Open Decisions & Detected Conflicts](#28-open-decisions--detected-conflicts)
29. [Traceability Matrix](#29-traceability-matrix)
30. [Approval Matrix](#30-approval-matrix)
31. [Document Index](#31-document-index)
32. [Glossary](#32-glossary)
33. [Executive Recommendation](#33-executive-recommendation)
34. [Readiness Assessment](#34-readiness-assessment)

---

## 1. Executive Overview

**EduTrack** is an enterprise-grade, multi-tenant B2B SaaS **School Operating System** — tagline: *The Operating System for Modern Schools* — unifying academics, parent engagement, school operations, finance, HR, and AI-assisted intelligence for private and international schools across Qatar, the GCC, MENA, and global markets.

| Attribute | Consolidated Position |
|-----------|----------------------|
| **Category** | School Operating System (SIS + ERP + engagement) |
| **Model** | Annual subscription SaaS; per-student pricing |
| **Launch market** | Qatar (primary), UAE (secondary) — EDU-STRAT-002 |
| **MVP target** | Q4 Y1; 15 paying schools; $500K–$750K ARR |
| **Scale target** | 10,000+ schools; 3M+ WASS by Y5 |
| **Architecture** | Modular monolith; API-first; AWS Bahrain; PostgreSQL + RLS |
| **Differentiation** | MENA-native (RTL, PDPL, local payments); one-record architecture; 30–60 day go-live |

**Phases 1–5** produced discovery, strategy, requirements, experience, and architecture. **This Master Specification (Phase 6)** is the authoritative reference for engineering, design, QA, AI, DevOps, and management during implementation.

---

## 2. Product Vision

### Vision Statement
> **EduTrack empowers every school to run with the clarity, connection, and intelligence of a world-class institution — in any language, any curriculum, any country.**

### Mission
Deliver the most complete, commercially viable education management platform that solves real operational problems for schools — not a bespoke website for a single institution.

### Core Values

| Value | Imperative |
|-------|------------|
| Integrity | Immutable audit trails; inspection-grade reporting |
| Clarity | Role-based UX; progressive disclosure |
| Inclusion | Arabic and English at parity; true RTL |
| Trust | Security-by-design; PDPL/GDPR posture |
| Partnership | White-glove onboarding; time-to-value SLAs |
| Craft | Enterprise quality in every core workflow |

### Product Philosophy (Consolidated)

1. One Record, One Truth  
2. Land Narrow, Expand Deep (academics + parent → finance, HR, AI)  
3. MENA-Native, Globally Portable  
4. API-First Platform  
5. AI with Human Governance  
6. Enterprise SaaS Discipline  

### North Star Metric
**Weekly Active School Stakeholders (WASS)** — unique teachers, parents, staff, and administrators performing meaningful actions per week.

| Year | WASS Target |
|------|-------------|
| Y1 | 25,000 |
| Y2 | 150,000 |
| Y3 | 500,000 |
| Y5 | 3,000,000 |

*Source: EDU-STRAT-002, EDU-PRD-003*

---

## 3. Business Objectives

### Year 1 (Foundation)

| ID | Objective | Target | Source |
|----|-----------|--------|--------|
| BG-01 | Launch sellable MVP | Q4 Y1 | PRD, Strategy |
| BG-02 | Paying schools | 15 | Strategy |
| BG-03 | ARR | $500K–$750K | Strategy |
| BG-04 | Admin NPS | ≥40 | Discovery, PRD |
| BG-05 | Implementation time | ≤60 days median | Discovery, Strategy |
| BG-06 | Pilot references | 3+ case studies | Strategy GTM |

### Years 2–5 (Consolidated)

| Year | Schools | ARR | Key Milestone |
|------|---------|-----|---------------|
| Y2 | 60 | $2.5M–$3.5M | Finance attach ≥50%; Saudi launch |
| Y3 | 150+ | $8M–$12M | 6+ countries; SOC 2 Type II |
| Y5 | 1,000+ | $80M–$120M | MENA category leader; marketplace |

### Commercial Model (Authoritative — EDU-STRAT-002)

| Tier | Price (USD/student/year) | Min Annual |
|------|--------------------------|------------|
| Starter | $28 | $12,000 |
| Professional | $48 | $25,000 |
| Enterprise | $72 | $60,000 |
| Government | Custom | $250,000+ |
| University | $55–$85 | $80,000 |

*See Section 28 for tier naming conflict resolution (Essentials vs Starter).*

---

## 4. Product Scope

### In Scope (Platform)

| Domain | Modules | First Release |
|--------|---------|---------------|
| Student lifecycle | Admissions, Enrollment, Student Management, Academic Records, Certificates | v1.0 / v1.1 |
| Daily academics | Attendance, Gradebook, Homework, Assessments, Scheduling | v1.0 / v1.1 |
| Engagement | Teacher/Parent/Student Portals, Communication, Notifications, Calendar | v1.0 / v1.1 |
| Insight | Reports, Analytics, AI | v1.0 / v2.0+ |
| Operations | Finance, HR, Payroll, Transport, Clinic, Library, Inventory, Assets, Behavior | v2.0 / v3.0 |
| Platform | Settings, Integrations, CMS, Marketplace | v1.0 / v4.0 |

### Out of Scope (Consolidated)

- National government platform replacement (co-existence only)
- Source code, API specs, DDL, UI designs (deferred to Implementation Blueprint post-G6)
- University full suite in v1.0 (deferred to v2.5+)
- French language (v3.0 — Morocco)
- Open marketplace submission (v4.0+)

### Future Scope
Sovereign cloud tenancy; offline-first full modules; white-label reseller portal; global international expansion beyond MENA.

*Source: EDU-PRD-003 §3*

---

## 5. Personas

| Persona | Role | Primary Need | Buying Role | Primary Modules |
|---------|------|--------------|-------------|-----------------|
| Sarah Mitchell | Academic Director | IB readiness, teacher efficiency | Champion | Academics, Reports |
| Mohammed Al-Kuwari | School Owner (Qatar) | Fee collection, MOEHE alignment | Economic buyer | Finance, Parent Portal |
| Fatima Hassan | Teacher | Less admin, Arabic UX | End user | Teacher Portal, Attendance |
| Layla Al-Mansouri | Parent | One app, Arabic, fees | Influencer | Parent Portal |
| James Okafor | IT Director | SSO, API, uptime, data residency | Technical buyer | Settings, Integrations |
| Dr. Amina Benali | University Registrar | Cloud SIS, trilingual | Champion | SIS (future) |
| Khalid Rahman | CFO | Invoicing, VAT, payroll | Economic buyer | Finance, Accounting |

*Source: EDU-DISC-001 §10; mapped in EDU-PRD-003 Appendix C*

---

## 6. Product Modules

| # | Module | Release | Priority | Bounded Context |
|---|--------|---------|----------|-----------------|
| 1 | Settings (RBAC) | v1.0 | P0 | Identity & Platform |
| 2 | Student Management | v1.0 | P0 | Student Lifecycle |
| 3 | Admissions | v1.0 | P0 | Student Lifecycle |
| 4 | Enrollment | v1.0 | P0 | Student Lifecycle |
| 5 | Attendance | v1.0 | P0 | Academics |
| 6 | Gradebook | v1.0 | P0 | Academics |
| 7 | Academic Records | v1.0 | P0 | Academics |
| 8 | Scheduling | v1.0 | P0 | Academics |
| 9 | Teacher Portal | v1.0 | P0 | Engagement |
| 10 | Parent Portal | v1.0 | P0 | Engagement |
| 11 | Communication | v1.0 | P0 | Engagement |
| 12 | Notifications | v1.0 | P0 | Engagement |
| 13 | Calendar | v1.0 | P0 | Engagement |
| 14 | Documents | v1.0 | P0 | Platform |
| 15 | Reports | v1.0 | P0 | Insights |
| 16 | Analytics | v1.0 | P0 | Insights |
| 17 | Homework | v1.1 | P1 | Academics |
| 18 | Assessments | v1.1 | P1 | Academics |
| 19 | Student Portal | v1.1 | P1 | Engagement |
| 20 | CMS | v1.1 | P1 | Platform |
| 21 | Certificates | v1.1 | P1 | Academics |
| 22 | Finance / Accounting / Fees | v2.0 | P2 | Finance |
| 23 | HR / Payroll | v2.0 | P2 | HR |
| 24 | AI (basic) | v2.0 | P2 | Insights |
| 25 | Transportation, Clinic, Library, Inventory, Assets, Behavior | v3.0 | P3 | Operations |
| 26 | AI (advanced), Marketplace | v4.0 | P4 | Platform / Insights |

*Source: EDU-PRD-003 §5–6; aligned with EDU-ARCH-005 bounded contexts*

---

## 7. Functional Requirements Summary

**Authoritative detail:** EDU-PRD-003 (full FR, US, AC per module). Below: consolidated MVP requirements by module.

| Module | Key Requirements (P0) | Key Acceptance Criteria |
|--------|----------------------|-------------------------|
| **Admissions** | Pipeline, AR/EN forms, offers, waitlist, zero re-entry conversion | Inquiry <1 min; accepted → pre-populated enrollment |
| **Enrollment** | Year/grade/section link, bulk re-enroll, capacity, parent provision | Active in rosters; parent visible <24h |
| **Student Mgmt** | Single record, guardians, medical alerts, search <2s | Allergy on roster; lifecycle history immutable |
| **Attendance** | Daily/period mark, bulk, parent notify <5 min, lock | <2 min for 30 students; lock enforced |
| **Gradebook** | Weighted categories, term calc, lock, audit, parent publish | Calc correct; override audited |
| **Academic Records** | Year history, promotion, retention, transcripts | Promotion validation report |
| **Scheduling** | Timetable, conflicts blocked, publish | Double-booking blocked |
| **Teacher Portal** | Dashboard, quick attendance/grade, mobile | ≤15 min daily admin |
| **Parent Portal** | Multi-child, AR RTL, mobile, activation | ≥55% activation in 30 days |
| **Communication** | Teacher-parent messaging, audit, no parent-to-parent | Scoped to assigned students |
| **Notifications** | Email, SMS, push, in-app; quiet hours | Absence <5 min delivery |
| **Calendar** | Academic year, Hijri+Gregorian, events | Both calendars supported |
| **Documents** | Upload, categories, consent, RBAC | Unauthorized access blocked |
| **Reports** | Operational + KHDA/ADEK/MOEHE templates | Inspection pack <2 hours |
| **Analytics** | Principal dashboard, adoption metrics | Dashboard <3s load |
| **Settings** | RBAC, academic year, audit log | Permissions effective <1 min |

**Requirement IDs:** `FR-[MOD]-###` · **User Stories:** `US-[MOD]-###` · **Acceptance:** `AC-[MOD]-###` · **Business Rules:** `BR-[DOMAIN]-###`

---

## 8. Non-Functional Requirements Summary

*Source: EDU-PRD-003 §9; validated by EDU-ARCH-005*

| Category | Key Requirements | Target |
|----------|------------------|--------|
| **Performance** | P95 portal load; P95 API read; attendance save; search | <2s / <500ms / <3s / <2s |
| **Availability** | Platform uptime SLA | 99.9% |
| **Scalability** | Schools; students/school; campuses/group | 10,000+ / 10,000 / 50 |
| **Security** | TLS 1.3; MFA (admin); RBAC; tenant isolation; pen test | Zero critical open at GA |
| **Compliance** | PDPL (Qatar/UAE/KSA); GDPR-ready; SOC 2 | Type I Y2; Type II Y3 |
| **Accessibility** | WCAG **2.2 AA** (see §28); RTL; keyboard | 100% P0 flows |
| **Reliability** | RPO / RTO | ≤1h / ≤4h |
| **Maintainability** | Feature flags; audit 100% sensitive actions | Per PRD |
| **Localization** | AR/EN parity; Hijri/Gregorian | French v3.0 |

---

## 9. User Experience Summary

*Source: EDU-PX-004*

| Dimension | Consolidated Standard |
|-----------|----------------------|
| **Portals** | Admin, Teacher, Parent (web+mobile), Student (v1.1) |
| **Teacher daily admin** | ≤15 minutes total |
| **Parent activation** | ≥55% within 30 days |
| **Navigation** | ≤3 clicks to any P0 screen; ≤2 for daily teacher tasks |
| **RTL** | Arabic-first layout mirror; not translation-only |
| **Mobile** | Parent/Teacher mobile-first; Admin desktop-first |
| **Interaction** | Consistent forms, tables, dialogs; skeleton loading; empty states with CTA |
| **AI UX** | Assistive only; "AI Suggested" badge; human approval for grades/messages |
| **Components** | 21 core components specified (PX-CMP-001–021) |

---

## 10. Information Architecture

*Source: EDU-PX-004 §2*

| Portal | Top-Level Groups |
|--------|------------------|
| **Admin** | Home, People, Academics, Engagement, Operations*, Insights, System |
| **Teacher** | Home, Today, Classes, Messages, Calendar, More |
| **Parent** | Home, Children, Messages, Calendar, Fees*, More |
| **Student** | Home, Today, Academics, Messages, Calendar |

**Global:** Search (Cmd/Ctrl+K), Notifications, Messages, Language toggle, Profile.  
**Max depth:** 3 sidebar levels; detail views use tabs.  
**Settings:** Separate tree — School Profile, Academic Config, Users & Access, Integrations, Audit Log.

---

## 11. Screen Inventory Summary

*Source: EDU-PX-004 §3 — 80+ screens defined*

| Area | MVP Screens (v1.0) | Count |
|------|-------------------|-------|
| Authentication | Sign in, MFA, parent activation, password recovery | 6 |
| Dashboards | Principal, Registrar, Teacher, Parent, System, Analytics | 6 |
| Students & Enrollment | List, profile, guardians, enrollment, promotion | 12 |
| Admissions | Pipeline, applicant, public form, offers, waitlist | 6 |
| Attendance & Grades | Marking, register, gradebook, publish, parent view | 9 |
| Engagement | Messages, notifications, calendar, documents | 5 |
| Scheduling & Reports | Timetable, report catalog, compliance templates | 5 |
| Settings & System | RBAC, audit log, integrations hub | 4 |
| **MVP total** | | **~55** |
| v1.1+ | Homework, assessments, student portal, CMS, certificates, finance, operations | ~25 |

**Screen IDs:** `PX-SCR-###`

---

## 12. User Journey Summary

*Source: EDU-DISC-001 §11; EDU-PX-004 §4*

| Journey | Actor | Success Criteria | Flow ID |
|---------|-------|------------------|---------|
| Admission → First Day | Parent, Registrar | Zero data re-entry; parent onboarded <24h | PX-FLW-005 |
| Teacher Daily Workflow | Teacher | ≤15 min admin; attendance + grades | PX-FLW-003 |
| Parent Fee Payment | Parent, Finance | Digital payment; auto-reconcile (v2.0) | PX-FLW-006 |
| Inspection Readiness | Principal | Report pack <2 hours | PX-FLW-004 |
| School Group Provisioning | IT Director | New campus <30 days | Discovery §11.5 |
| Parent Activation | Parent | ≥55% activation | PX-FLW-002 |

---

## 13. AI Strategy Summary

*Sources: EDU-STRAT-002 §9; EDU-PRD-003 §6.33; EDU-ARCH-005 §11*

| Principle | Rule |
|-----------|------|
| Role | AI is a **platform layer**, not a single feature |
| Governance | Human approval for grades, messages, discipline |
| Privacy | Tenant-scoped; no training on tenant data without consent |
| Monetization | AI Basic (Enterprise); Prediction Suite +$8/student; Advanced +$12 |

| Capability | Release | Approval Required |
|------------|---------|-------------------|
| At-risk detection, attendance patterns | v2.0 | Review by counselor/admin |
| Report narrative drafts | v2.0 | Teacher |
| Teacher/Parent assistants | v2.5 | User before send |
| Timetable optimization, behavioral prediction | v3.0 | Admin |

**Architecture:** Separate AI Service; Azure OpenAI primary; RAG via pgvector (v2.0). *TDR-010*

---

## 14. Platform Strategy

*Source: EDU-STRAT-002 §10*

| Capability | MVP | Mature |
|------------|-----|--------|
| **Multi-tenant SaaS** | ✓ Shared schema + RLS | Dedicated option (government) |
| **API-first** | REST v1; OpenAPI | GraphQL analytics (v2.0) |
| **Public API** | Partner integrations | Developer portal (v2.0) |
| **Marketplace** | — | Curated v3.0; open v4.0 |
| **White-label** | Logo + accent | Full white-label v3.0+ |
| **Mobile apps** | Parent + Teacher (RN) | Admin, Student, Driver |
| **Offline** | Cached read (v1.0) | Attendance/grade queue (v1.1) |

---

## 15. Multi-Tenant Strategy

*Source: EDU-ARCH-005 §6; EDU-STRAT-002*

| Layer | Strategy |
|-------|----------|
| **Model** | Organization tenant; optional campus sub-scope |
| **Database** | Shared schema; `tenant_id` + PostgreSQL RLS (*TDR-003*) |
| **Application** | Tenant context on every request/job |
| **Cache/Storage/Search** | Tenant-prefixed keys and paths |
| **Data ownership** | School owns data; operator has no default access |
| **Branding** | Per-tenant logo, accent, subdomain |
| **Scale path** | Shared → dedicated DB for government/sovereign |

---

## 16. Security Summary

*Source: EDU-ARCH-005 §8; EDU-PRD-003 NFR-SEC*

| Control | Standard |
|---------|----------|
| Authentication | JWT (RS256) + refresh rotation; OIDC SSO; Argon2id passwords |
| MFA | Required: Super Admin, Principal, Finance |
| Authorization | RBAC + application permissions + RLS |
| Encryption | TLS 1.3 in transit; AES-256 at rest |
| Secrets | AWS Secrets Manager; zero secrets in code |
| Audit | Append-only; 7-year retention; 100% sensitive actions |
| Threat model | STRIDE analyzed; OWASP Top 10 mitigations documented |
| Child data | Consent flows; parental access controls; PDPL enhanced |
| Compliance | Qatar/UAE/KSA PDPL; GDPR-ready; SOC 2 path |

---

## 17. Architecture Summary

*Source: EDU-ARCH-005*

### Style
**Modular monolith** (v1.0–v2.0) with domain modules; selective service extraction when scale/compliance triggers met.

### Technology Stack (Consolidated TDRs)

| Layer | Decision |
|-------|----------|
| Frontend web | Next.js, React, TypeScript (*TDR-005*) |
| Mobile | React Native (*TDR-005*) |
| Backend | Node.js 20, TypeScript, NestJS (*TDR-001*) |
| Database | PostgreSQL 16, RDS (*TDR-004*) |
| Cache | Redis, ElastiCache (*TDR-007*) |
| Queue | AWS SQS (*TDR-006*) |
| Search | Postgres FTS (MVP) → OpenSearch v1.1 (*TDR-008*) |
| Storage | S3 + Cloudinary |
| Orchestration | Amazon EKS (*TDR-009*) |
| Cloud | AWS Bahrain primary (*TDR-002*) |
| IaC | Terraform (*TDR-012*) |
| AI | Azure OpenAI (*TDR-010*) |
| Auth | Self-managed JWT + OIDC (*TDR-011*) |

### Key Patterns
API-first · DDD bounded contexts · Clean architecture layers · Transactional outbox for domain events · Stateless API + background workers

---

## 18. Domain Model Summary

*Source: EDU-ARCH-005 §5*

| Bounded Context | Key Aggregates |
|-----------------|----------------|
| Identity & Access | User, Role |
| Student Lifecycle | Student, Applicant, Enrollment |
| Academics | AttendanceSession, GradebookEntry, Schedule |
| Engagement | MessageThread, Notification |
| Finance | Invoice, Payment |
| HR | StaffMember, LeaveRequest |
| Operations | TransportRoute, ClinicVisit, BehaviorIncident |
| Insights | ReportDefinition, AnalyticsSnapshot |
| Platform | Tenant, AuditEntry |

**Shared kernel:** TenantId, CampusId, AcademicYear, LocalizedString, Money, AuditEntry.

**Key domain events:** `StudentEnrolled`, `AttendanceRecorded`, `GradesPublished`, `InvoiceIssued`, `PaymentReceived`, `ApplicantAccepted`.

---

## 19. Integration Summary

*Sources: EDU-PRD-003 §13; EDU-ARCH-005 §12*

| Integration | Release | Direction |
|-------------|---------|-----------|
| Twilio (SMS) | v1.0 | Outbound |
| Firebase (push) | v1.0 | Outbound |
| Cloudinary (media) | v1.0 | Bidirectional |
| Google Workspace (SSO, calendar) | v1.0–v1.1 | Bidirectional |
| MOEHE export | v1.1 | Outbound |
| QPay / Moyasar / Stripe | v2.0 | Inbound webhooks |
| Microsoft 365 / Azure AD | v1.1 | Bidirectional |
| Google Classroom, Teams, Zoom | v2.0 | Bidirectional |
| Toddle / ManageBac | v2.0 | Bidirectional |
| Xero / QuickBooks | v2.0 | Outbound |
| WhatsApp Business | v2.0 | Outbound |

**Pattern:** Anti-corruption layer per adapter; idempotent webhooks; signed payloads.

---

## 20. Infrastructure Summary

*Source: EDU-ARCH-005 §9, §14*

| Element | Decision |
|---------|----------|
| **Region (MVP)** | AWS `me-south-1` (Bahrain); multi-AZ |
| **Environments** | Dev, Test, Staging, Production, Sandbox |
| **CI/CD** | GitHub Actions → ECR → EKS; blue-green production |
| **CDN/WAF** | CloudFront + AWS WAF |
| **Autoscaling** | EKS HPA; 2–20 API pods (Y1) |
| **DR** | Cross-region S3 backups; RPO 1h; RTO 4h |
| **Observability** | Prometheus/Grafana, OpenTelemetry, structured logs |
| **SLO** | 99.9% availability; P95 API <500ms |

---

## 21. Release Roadmap

| Phase | Version | Timeline | Goal |
|-------|---------|----------|------|
| Alpha | v0.9 | M1–M6 | Internal + design partners |
| **MVP** | **v1.0** | M7–M10 | 5 pilot schools; GA criteria |
| Enhancement | v1.1 | M11–M14 | 15 paying schools |
| Operations | v2.0 | Y2 Q1–Q2 | Finance, HR, AI basic |
| Logistics | v3.0 | Y2 Q3–Y3 | Transport, clinic, library |
| Platform | v4.0 | Y3+ | Marketplace, AI advanced |

*Sources: EDU-PRD-003 §19; EDU-STRAT-002 §11*

---

## 22. MVP Definition

### v1.0 Modules (16)

Settings · Student Management · Admissions · Enrollment · Attendance · Gradebook · Academic Records · Scheduling · Teacher Portal (+ mobile) · Parent Portal (+ mobile) · Communication · Notifications · Calendar · Documents · Reports · Analytics (basic)

### MVP Exclusions (Deferred)

Homework, Assessments, Student Portal, CMS, Certificates (→ v1.1)  
Finance, HR, Payroll, AI (→ v2.0)  
Transport, Clinic, Library, Inventory, Behavior (→ v3.0)  
Marketplace (→ v4.0)

### MVP GA Criteria

| Criterion | Target |
|-----------|--------|
| P0 acceptance criteria | 100% pass |
| Pilot schools live | ≥3 |
| Uptime | 99.9% |
| Open P0 defects | 0 |
| Parent activation | ≥55% |
| Teacher WAU | ≥70% |
| Penetration test | Zero critical open |

*Sources: EDU-PRD-003; EDU-PX-004; EDU-ARCH-005*

---

## 23. Version Roadmap

| Version | Additions | Experience / Tech Highlights |
|---------|-----------|------------------------------|
| **v1.0** | Core academics + parent | 55 screens; Postgres FTS; light mode only |
| **v1.1** | Homework, exams, student portal, CMS, certs | Offline attendance; OpenSearch; Google SSO |
| **v2.0** | Finance, HR, payroll, AI basic | QPay; finance dashboards; AI insights panel |
| **v3.0** | Operations modules; AI advanced | Bus GPS; French; dark mode staff |
| **v4.0** | Marketplace; ecosystem | Developer portal; white-label |

---

## 24. KPIs

### North Star
**WASS** — see §2

### Commercial (Y1)

| KPI | Target |
|-----|--------|
| ARR | $500K–$750K |
| Paying schools | 15 |
| Median ACV | $35,000 |
| Sales cycle | ≤90 days |
| Demo-to-close | ≥20% |
| CAC payback | ≤18 months |
| Logo churn | <10% |

### Product (Y1)

| KPI | Target |
|-----|--------|
| Teacher WAU / total | ≥70% |
| Parent activation | ≥55% |
| Parent sessions/week | ≥2 |
| Implementation on-time | ≥85% |
| Admin NPS | ≥40 |

### Technical (Y1)

| KPI | Target |
|-----|--------|
| Uptime | 99.9% |
| P95 page load | <2s |
| P0 bug escape | <2/release |
| Security P1 incidents | 0 |

*Source: EDU-STRAT-002 §14; EDU-PRD-003 §2*

---

## 25. Success Metrics

| Category | Metrics | Y1 Target |
|----------|---------|-----------|
| **Business** | ARR growth, NRR, LTV:CAC | NRR ≥100%; LTV:CAC ≥3:1 |
| **Customer** | NPS, renewal, CSAT, time-to-value | Renewal ≥90%; CSAT ≥4.5/5 |
| **Product** | WASS, feature adoption, mobile rating | WASS 25K; app ≥4.0 |
| **Experience** | Task completion, time on task | ≥90%; attendance <2 min |
| **Accessibility** | WCAG 2.2 AA audit pass | 100% P0 flows |
| **Compliance** | PDPL requests fulfilled; pen test | 100%; 0 critical |

---

## 26. Risks

| ID | Category | Risk | Mitigation | Source |
|----|----------|------|------------|--------|
| R-01 | Product | MVP scope creep | Strict P0 lock; change control | PRD, Strategy |
| R-02 | Security | Cross-tenant leakage | RLS + middleware + pen test | ARCH |
| R-03 | Market | Parent activation low | School-mandated onboarding | PX, Strategy |
| R-04 | Technical | Attendance spike overload | Load test; autoscaling | ARCH |
| R-05 | Operational | Implementation failure | Playbooks; dedicated IM | Strategy |
| R-06 | Commercial | Pricing resistance | Van Westendorp validation | Discovery |
| R-07 | UX | RTL layout defects | Arabic-first QA every release | PX |
| R-08 | Architecture | Monolith coupling | Module boundary CI linting | ARCH |
| R-09 | Legal | PDPL non-compliance | Legal review; DPO | PRD, ARCH |
| R-10 | AI | Model accuracy / trust | Human-in-the-loop; confidence scores | Strategy, PX |

---

## 27. Dependencies

### Internal (Release Order)
`Settings → Student Lifecycle → Academics → Engagement → Finance (v2.0) → Operations (v3.0)`

### External (Pre-GA)

| Dependency | Required For | Owner |
|------------|-------------|-------|
| Seed funding ($2M–$4M) | Development runway | CEO/CFO |
| 3+ pilot school agreements | Validation | Sales |
| QPay partnership | v2.0 fees | Partnerships |
| Twilio, Firebase, Cloudinary accounts | v1.0 notifications | DevOps |
| AWS Bahrain provisioning | Data residency | Cloud |
| Legal PDPL review | Compliance | Legal |
| G6 approval | Implementation Blueprint | Executive |

---

## 28. Open Decisions & Detected Conflicts

The Executive Documentation Office detected the following conflicts between source documents. **No decision was silently overwritten.** Preferred versions are recommended for MPS authority.

### Conflict Register

| ID | Topic | Document A | Document B | Recommended Authority | Resolution |
|----|-------|------------|------------|----------------------|------------|
| **C-01** | Pricing tier name (entry) | EDU-DISC-001: **Essentials** | EDU-STRAT-002: **Starter** | **EDU-STRAT-002** | Use **Starter** in all commercial and implementation references. Same price ($28) and modules. |
| **C-02** | Top tier naming | EDU-DISC-001: **Ultimate** | EDU-STRAT-002: **Government** + **University** (split) | **EDU-STRAT-002** | Use Government and University tiers; Ultimate deprecated. |
| **C-03** | WCAG version | EDU-PRD-003: **2.1 AA** | EDU-PX-004 / EDU-ARCH-005: **2.2 AA** | **EDU-PX-004** (later, UX-led) | MPS adopts **WCAG 2.2 AA** for all implementation. PRD to be amended on next revision. |
| **C-04** | Enterprise tier module bundle | EDU-DISC-001: Transport, Clinic in Enterprise tier | EDU-PRD-003: Transport, Clinic in **v3.0** | **EDU-PRD-003** (release phasing) | Commercial **Enterprise tier** is a *sales bundle*; module delivery follows **version roadmap** (v3.0 for transport/clinic). Sales must not promise v3.0 modules at v1.0 GA. |
| **C-05** | Phase numbering / G6 meaning | EDU-STRAT-002: Phase 3 = MPS; G6 = Private Beta | Current delivery: Phase 6 = MPS; G6 = Master Spec | **Current phase model (this document)** | Phase sequence: 1 Discovery → 2 Strategy → 3 PRD → 4 PX → 5 ARCH → **6 MPS** → Implementation Blueprint. Gate G6 = MPS approval. |
| **C-06** | Post-architecture next step | EDU-ARCH-005: Phase 6 = Implementation | User mandate: MPS before Implementation Blueprint | **G6 MPS then Blueprint** | No source code until G6 approved **and** Implementation Blueprint published. |
| **C-07** | SSO in MVP | EDU-PX-004: Google SSO v1.1 | EDU-ARCH-005: Google OAuth v1.0 integration listed | **EDU-PX-004** (experience release) | Google SSO ships **v1.1**; email/password only at v1.0 GA. |
| **C-08** | In-app notifications transport | EDU-ARCH-005 OTQ-04: WebSocket vs polling (open) | EDU-PX-004: notification center specified | **Defer to Implementation Blueprint** | Both polling (v1.0) and WebSocket (v1.1) acceptable; decision required at blueprint. |

### Open Decisions (Consolidated, Not Conflicts)

| ID | Question | Owner | Before |
|----|----------|-------|--------|
| OD-01 | Auth0 vs self-managed at scale? | Security | 100K users or v2.0 |
| OD-02 | Turborepo vs Nx monorepo? | Principal Engineer | Sprint 1 |
| OD-03 | pgvector vs dedicated vector DB for RAG? | AI Architect | v2.0 |
| OD-04 | Parent app: tabs vs drawer? | UX Research | Design kickoff |
| OD-05 | Separate AWS accounts per environment? | Cloud Architect | Infra setup |
| OD-06 | Van Westendorp pricing validation completion | CFO/Sales | Sales launch |
| OD-07 | Pilot school signed commitments (3+) | VP Sales | v1.0 GA |

---

## 29. Traceability Matrix

Maps **Business Goal → Requirement → Module → User Story → Acceptance Criteria → Architecture Decision**.

| Business Goal | Product Goal | Module | Requirement | User Story | Acceptance | Architecture |
|---------------|-------------|--------|-------------|------------|------------|--------------|
| BG-01 Launch MVP | PG-01 Zero re-entry | Admissions, Enrollment | FR-ADM-007, FR-ENR-001 | US-001 | AC-ADM-002, AC-ENR-001 | BC-LIFECYCLE; TDR-001 |
| BG-01 Launch MVP | PG-02 Daily embedment | Attendance, Teacher Portal | FR-ATT-001, FR-TCH-001 | US-002 | AC-ATT-001, AC-TCH-001 | Modular monolith; Redis cache |
| BG-04 NPS ≥40 | PG-05 Parent self-service | Parent Portal | FR-PAR-001–008 | US-007 | AC-PAR-001 | Next.js + RN; TDR-005 |
| BG-05 ≤60 day go-live | PG-03 Inspection ready | Reports | FR-RPT-001–005 | US-006 | AC-RPT-001 | Report Worker; read replica |
| BG-03 ARR | PG-05 Fee visibility | Fees (v2.0) | FR-FEE-001–008 | US-008 | AC-FEE-001 | QPay adapter; TDR-002 |
| BG-02 15 schools | PG-02 Teacher WAU ≥70% | Gradebook | FR-GRD-001–008 | US-004 | AC-GRD-001 | BC-ACADEMICS |
| Trust / compliance | — | Settings, All | NFR-SEC-006, BR-GRD-002 | US-005 | AC-GRD-002 | TDR-003 RLS; audit append-only |
| Expansion Y2 | Finance attach 50% | Finance, Fees | FR-FIN-001, FR-FEE-001 | US-008 | AC-FEE-001 | BC-FINANCE; SQS workers |
| AI differentiation Y2 | PG-07 Governed AI | AI | FR-AI-001–010 | — | AC-AI-001 | AI Service; TDR-010 |
| Scale Y5 10K schools | — | Platform | NFR-SCL-001 | — | — | EKS autoscale; TDR-009 |
| MENA-native | PG-01 | Parent Portal, Calendar | NFR-LOC-001–003 | US-003 | AC-PAR-002 | RTL Next.js; Hijri support |
| Security / PDPL | — | All | NFR-CMP-001–006 | — | — | AWS Bahrain; TDR-002 |
| Multi-campus | PG-06 | Settings, Student Mgmt | FR-STU-007, FR-SET-007 | US-010 | AC-STU-002 | CampusId in shared kernel |

**Full requirement catalog:** EDU-PRD-003 (200+ FR, 15+ US, 50+ BR, 50+ NFR).  
**Full screen trace:** EDU-PX-004 (`PX-SCR-###` → modules).  
**Full TDR list:** EDU-ARCH-005 (TDR-001–012).

---

## 30. Approval Matrix

### Phase Gate History (Consolidated)

| Gate | Phase | Document | Status |
|------|-------|----------|--------|
| G1 | 1 — Product Discovery | EDU-DISC-001 | ✓ Approved |
| G2 | 2 — Product Strategy | EDU-STRAT-002 | ✓ Approved |
| G3 | 3 — Product Requirements | EDU-PRD-003 | ✓ Approved |
| G4 | 4 — Product Experience | EDU-PX-004 | ✓ Approved |
| G5 | 5 — Technical Architecture | EDU-ARCH-005 | ✓ Approved |
| **G6** | **6 — Master Specification** | **EDU-MPS-006** | **Pending** |

### G6 Approval Checklist

| # | Criterion | Owner | Status |
|---|-----------|-------|--------|
| 1 | Consolidation complete; no new scope | CPO | ☐ |
| 2 | Conflicts documented and resolved per §28 | CTO + CPO | ☐ |
| 3 | Traceability matrix validated | Principal PM | ☐ |
| 4 | MVP definition aligned across PRD, PX, ARCH | VP Engineering | ☐ |
| 5 | NFRs and SLOs consistent | SRE Lead | ☐ |
| 6 | Security and PDPL posture accepted | Security + Legal | ☐ |
| 7 | Readiness scores reviewed by executive team | CEO | ☐ |
| 8 | Open decisions acknowledged (§28) | All VPs | ☐ |
| 9 | Implementation Blueprint scope agreed (post-G6) | CTO | ☐ |
| 10 | Executive signatures recorded | CEO | ☐ |

### RACI for Implementation (Post-G6)

| Area | Responsible | Accountable | Consulted | Informed |
|------|-------------|-------------|-----------|----------|
| Product requirements | Principal PM | CPO | UX, QA | All eng |
| Experience / design | UX Lead | VP PX | PM, Eng | Stakeholders |
| Architecture | Chief Architect | CTO | Security, DBA | Eng teams |
| Backend modules | Eng Leads | VP Engineering | Architect | PM |
| Frontend portals | Frontend Lead | VP Engineering | UX | PM |
| Infrastructure | DevOps Lead | CTO | Security | All |
| QA / release | QA Lead | VP Engineering | PM, DevOps | Stakeholders |
| AI features | AI Lead | CTO | PM, Legal | Stakeholders |

---

## 31. Document Index

| Order | ID | Title | Purpose | When to Use |
|-------|-----|-------|---------|-------------|
| 0 | **EDU-MPS-006** | **Master Product Specification** | **Single source of truth** | **Daily reference for all teams** |
| 1 | EDU-DISC-001 | Product Discovery | Market, personas, problems | Context, sales, investor |
| 2 | EDU-STRAT-002 | Product Strategy | Business model, GTM, pricing | Commercial, executive |
| 3 | EDU-PRD-003 | Product Requirements | Detailed FR, US, AC, BR, NFR | PM, QA, engineering specs |
| 4 | EDU-PX-004 | Product Experience | IA, screens, flows, components | Design, frontend |
| 5 | EDU-ARCH-005 | Technical Architecture | Engineering how-to, TDRs | Backend, DevOps, security |
| — | *Post-G6* | *Implementation Blueprint* | OpenAPI, DDL, sprints, IaC | Development execution |

**Hierarchy:** MPS (006) supersedes conflicts per §28. For detail, drill into source documents. MPS does not replace deep specs — it indexes and consolidates them.

---

## 32. Glossary

| Term | Definition |
|------|------------|
| **WASS** | Weekly Active School Stakeholders — North Star metric |
| **School OS** | School Operating System — EduTrack category |
| **Tenant** | A school or school group organization on the platform |
| **Campus** | Sub-unit within a multi-campus tenant |
| **SIS** | Student Information System |
| **RBAC** | Role-Based Access Control |
| **RLS** | Row-Level Security (PostgreSQL) |
| **PDPL** | Personal Data Privacy Law (GCC) |
| **ACV** | Annual Contract Value |
| **ARR** | Annual Recurring Revenue |
| **NRR** | Net Revenue Retention |
| **MVP** | v1.0 release — 16 core modules |
| **Bounded Context** | DDD module boundary (BC-*) |
| **TDR** | Technology Decision Record |
| **RPO/RTO** | Recovery Point/Time Objective |
| **SLO** | Service Level Objective |

---

## 33. Executive Recommendation

### Consolidation Statement

Phases 1–5 are **aligned, complete, and implementation-ready** subject to G6 approval. The Master Product Specification confirms:

- One product vision, one MVP scope, one architecture stack  
- Clear version roadmap from v1.0 through v4.0  
- Eight documented conflicts resolved with explicit authority  
- Full traceability from business goals to architecture decisions  
- No new requirements introduced in this consolidation  

### Final Recommendation

## **GO**

Proceed to **G6 approval**, then publish the **Final Implementation Blueprint** (OpenAPI contracts, data model DDL, sprint plan, IaC baseline, design system).

**HOLD conditions (none blocking G6):**
- OD-06 pricing validation and OD-07 pilot commitments are **business readiness**, not specification blockers  
- OD-02 through OD-05 are **engineering choices** for Implementation Blueprint  

### **NO GO** would apply only if:
- Executive team rejects conflict resolutions in §28  
- New scope is requested before G6 (requires change control back to PRD)  

---

## 34. Readiness Assessment

Scores inherited from source documents, adjusted for consolidation completeness.

| Dimension | Score (1–5) | Source | Notes |
|-----------|-------------|--------|-------|
| **Product Readiness** | 4.6 | PRD 4.4 + Strategy GO | P0 requirements complete; P2–P4 at summary level |
| **Engineering Readiness** | 4.8 | ARCH 4.8 | TDRs complete; DDL deferred to Blueprint |
| **UX Readiness** | 4.7 | PX 4.7 | 55 MVP screens; visual design post-G6 |
| **Business Readiness** | 3.8 | Strategy 3.8 | Pilots and funding in progress |
| **Consolidation Completeness** | 4.9 | This document | Conflicts surfaced; traceability complete |

### Overall Readiness

| Metric | Value |
|--------|-------|
| **Product Readiness Score** | **4.6 / 5.0** |
| **Engineering Readiness Score** | **4.8 / 5.0** |
| **UX Readiness Score** | **4.7 / 5.0** |
| **Business Readiness Score** | **3.8 / 5.0** |
| **Overall Readiness** | **4.5 / 5.0** |

**Interpretation:** EduTrack is **ready for G6 Master Specification approval**. Specification, experience, and architecture are enterprise-grade. Business operational readiness (pilots, funding, pricing validation) advances in parallel with Implementation Blueprint.

---

### Approval Gate: G6 — Master Specification Approval

Upon **G6 approval**:

1. This document (EDU-MPS-006) becomes the **authoritative platform reference**  
2. Proceed to **Final Implementation Blueprint**  
3. Do **not** begin source code until Implementation Blueprint is approved by CTO + CPO  

| Role | Approval | Date |
|------|----------|------|
| CEO / Executive Sponsor | ☐ | |
| Chief Product Officer | ☐ | |
| Chief Technology Officer | ☐ | |
| VP Product Experience | ☐ | |
| VP Engineering | ☐ | |
| VP Go-To-Market | ☐ | |
| CFO | ☐ | |
| Legal / Compliance | ☐ | |

---

*End of Document — EDU-MPS-006 v1.0.0 — Single Source of Truth for EduTrack*
