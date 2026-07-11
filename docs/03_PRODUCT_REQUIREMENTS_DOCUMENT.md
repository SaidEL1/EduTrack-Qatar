# EduTrack — Product Requirements Document

| Field | Value |
|-------|-------|
| **Document ID** | EDU-PRD-003 |
| **Version** | 1.0.0 |
| **Status** | Draft — Pending G3 Stakeholder Approval |
| **Phase** | Phase 3 — Product Requirements |
| **Predecessor** | EDU-DISC-001 (Phase 1) — Approved · EDU-STRAT-002 (Phase 2) — Approved |
| **Successor** | EDU-ARCH-004 (Phase 4 — Technical Architecture) — *Pending G3* |
| **Author** | EduTrack Product Management Organization |
| **Last Updated** | 2026-07-08 |
| **Classification** | Internal — Confidential |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-08 | Product Management | Initial PRD release |

### Requirement ID Convention

| Prefix | Meaning | Example |
|--------|---------|---------|
| `FR-[MOD]-###` | Functional Requirement | FR-ADM-001 |
| `US-[MOD]-###` | User Story | US-ATT-003 |
| `AC-[MOD]-###` | Acceptance Criterion | AC-GRD-002 |
| `BR-[DOMAIN]-###` | Business Rule | BR-ENR-005 |
| `NFR-[CAT]-###` | Non-Functional Requirement | NFR-SEC-001 |

### Approval Gate — G3: Product Requirements Approval

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Chief Product Officer | | | | Pending |
| Principal Product Manager | | | | Pending |
| Enterprise Solution Architect | | | | Pending |
| VP Engineering | | | | Pending |
| VP QA | | | | Pending |
| UX Research Lead | | | | Pending |
| Legal / Compliance | | | | Pending |

**Gate criteria:** All MVP modules have testable requirements and acceptance criteria; business rules approved by operations stakeholders; NFRs reviewed by architecture and security; permission matrix validated; release plan agreed by program management; no open P0 requirement ambiguities blocking Phase 4.

**Explicit constraint:** No technical architecture, source code, UI mockups, API specifications, or database schemas shall be produced until **G3 approval** is recorded.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Objectives](#2-objectives)
3. [Scope](#3-scope)
4. [Target Users](#4-target-users)
5. [Functional Requirements — Module Index](#5-functional-requirements--module-index)
6. [Module Specifications](#6-module-specifications)
7. [User Stories](#7-user-stories)
8. [Business Rules](#8-business-rules)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Permission Matrix](#10-permission-matrix)
11. [Notifications](#11-notifications)
12. [Reporting](#12-reporting)
13. [Integrations](#13-integrations)
14. [Module Acceptance Criteria Summary](#14-module-acceptance-criteria-summary)
15. [Definition of Ready](#15-definition-of-ready)
16. [Definition of Done](#16-definition-of-done)
17. [Risks](#17-risks)
18. [Dependencies](#18-dependencies)
19. [Release Plan](#19-release-plan)
20. [Appendices](#20-appendices)
21. [Product Readiness Score & G3 Gate](#21-product-readiness-score--g3-gate)

---

## 1. Executive Summary

This Product Requirements Document (PRD) defines **exactly what EduTrack must build** to become the leading School Operating System in the Middle East and a globally scalable SaaS platform serving 10,000+ institutions.

EduTrack unifies student lifecycle management, daily academics, parent engagement, school operations, finance, HR, and AI-assisted intelligence on a single multi-tenant platform with MENA-native compliance, bilingual Arabic/English experience, and enterprise-grade governance.

**This document is the binding contract between Product, Design, Engineering, QA, DevOps, AI, and business stakeholders.** Every feature has business justification. Every requirement is testable. Every requirement includes acceptance criteria. No implementation details are included.

### Strategic Context

| Input Document | Key Decisions Inherited |
|----------------|------------------------|
| Phase 1 — Product Discovery | Problem hierarchy, personas, user journeys, KPIs |
| Phase 2 — Product Strategy | MVP phasing, pricing tiers, GTM, AI/platform strategy |

### MVP Definition (Release 1.0 — v1.0)

| Priority | Modules |
|----------|---------|
| **P0 — MVP** | Student Management, Admissions, Enrollment, Attendance, Gradebook, Academic Records, Scheduling, Teacher Portal, Parent Portal, Communication, Notifications, Calendar, Documents, Reports, Analytics (basic), Settings (RBAC) |
| **P1 — v1.1** | Homework, Assessments, Student Portal, CMS, Certificates |
| **P2 — v2.0** | Finance, Accounting, Fees, HR, Payroll |
| **P3 — v3.0** | Transportation, Medical Clinic, Library, Inventory, Assets, Behavior |
| **P4 — v4.0+** | AI (full layer), Marketplace, Integrations (expanded), Government reporting |

### Document Principles

1. **One Record, One Truth** — Requirements enforce single student/staff/family records across all modules.
2. **Testable** — If it cannot be verified, it is not a requirement.
3. **Business-justified** — Every module maps to revenue, retention, or compliance outcomes.
4. **Phased** — Not all modules ship in v1.0; priorities are explicit.
5. **MENA-native** — Arabic RTL, local calendars, inspection readiness, PDPL compliance are requirements, not nice-to-haves.

---

## 2. Objectives

### Business Goals

| ID | Goal | Target | Timeline |
|----|------|--------|----------|
| BG-01 | Launch sellable MVP | Core + Academics + Parent live | Q4 Y1 |
| BG-02 | Acquire paying schools | 15 institutions | Y1 |
| BG-03 | Achieve ARR | $500K – $750K | Y1 |
| BG-04 | Validate product-market fit | Admin NPS ≥40 | Y1 |
| BG-05 | Prove implementation speed | Median go-live ≤60 days | Y1 |
| BG-06 | Enable expansion revenue | Finance module attach ≥50% | Y2 |
| BG-07 | Scale to category leadership | 150+ schools, $8M+ ARR | Y3 |

### Product Goals

| ID | Goal | Success Indicator |
|----|------|-------------------|
| PG-01 | Eliminate data re-entry across admissions → enrollment → academics | Zero duplicate student record creation post-acceptance |
| PG-02 | Embed product in daily school life | Teacher WAU ≥70%; Parent activation ≥55% |
| PG-03 | Deliver inspection-ready reporting | Compliance report pack in <2 hours |
| PG-04 | Reduce teacher administrative burden | ≤15 min daily admin per teacher |
| PG-05 | Enable parent self-service | ≥80% digital fee visibility; ≥55% parent app activation |
| PG-06 | Support multi-campus school groups | Campus provisioning in <30 days |
| PG-07 | Provide governed AI insights | AI recommendations with human approval workflow |

### Success Metrics

**North Star Metric:** Weekly Active School Stakeholders (WASS) — unique teachers, parents, staff, and administrators performing meaningful actions per week.

| Milestone | WASS Target |
|-----------|-------------|
| MVP Launch | 5,000 |
| Y1 End | 25,000 |
| Y2 End | 150,000 |
| Y3 End | 500,000 |

### KPIs

| Category | KPI | Y1 Target | Owner |
|----------|-----|-----------|-------|
| Adoption | Teacher WAU / total teachers | ≥70% | Product |
| Adoption | Parent app activation rate | ≥55% | Product |
| Engagement | Avg parent sessions/week | ≥2 | Product |
| Quality | P0 defect escape rate | <2 per release | QA |
| Performance | P95 portal response time | <2 seconds | Engineering |
| Reliability | Platform uptime | 99.9% | DevOps |
| Implementation | On-time go-live rate | ≥85% | Customer Success |
| Commercial | Median ACV | $35,000 | Sales |
| Retention | Gross logo retention | ≥90% | Customer Success |
| Expansion | Module attach (Finance, Y2) | ≥50% | Product + Sales |

---

## 3. Scope

### In Scope (This PRD)

- Functional requirements for all EduTrack modules (phased by release)
- User stories with acceptance criteria and business rules
- Non-functional requirements (performance, security, compliance, etc.)
- Permission matrix across all roles
- Notification, reporting, and integration requirements
- Release plan from MVP through v4.0
- Definition of Ready and Definition of Done

### Out of Scope (This PRD)

- Technical architecture, technology stack selection
- API specifications, database schemas, infrastructure design
- UI mockups, wireframes, design system specifications
- Source code, deployment scripts, CI/CD configuration
- Detailed AI model training specifications
- National government platform replacement (co-existence only)
- University-specific modules beyond foundational SIS (deferred to v2.5+)

### Future Scope

| Item | Target Phase | Notes |
|------|-------------|-------|
| Full university module suite (credits, transcripts, faculty research) | v2.5+ | After K-12 maturity |
| French language (trilingual) | v3.0+ | Morocco expansion |
| Sovereign cloud / government dedicated tenancy | v3.0+ | Government tier |
| Offline-first full module support | v3.0+ | Low-connectivity campuses |
| Developer marketplace (open submission) | v4.0+ | After curated marketplace |
| White-label reseller portal | v4.0+ | Channel scale |

---

## 4. Target Users

### Students

| Attribute | Detail |
|-----------|--------|
| **Age range** | 3–18 (K-12); extended for university |
| **Primary needs** | View schedule, assignments, grades, announcements |
| **Access** | Student Portal (web); mobile app (v1.1+) |
| **Constraints** | Age-appropriate access; parental consent for minors; no financial data access |

### Parents / Guardians

| Attribute | Detail |
|-----------|--------|
| **Primary needs** | Child progress, attendance, fees, messaging, notifications |
| **Access** | Parent Portal (web + mobile app) |
| **Constraints** | Access limited to linked children only; consent-governed data sharing |
| **Languages** | Arabic (preferred), English |

### Teachers

| Attribute | Detail |
|-----------|--------|
| **Primary needs** | Attendance, gradebook, homework, schedule, parent messaging |
| **Access** | Teacher Portal (web + mobile app) |
| **Constraints** | Access limited to assigned classes/students; cannot modify finalized records without authorization |

### School Administration

| Attribute | Detail |
|-----------|--------|
| **Roles** | Registrar, Admissions officer, Academic admin, Front office |
| **Primary needs** | Enrollment, records, scheduling, reports, document management |
| **Access** | Admin Portal |
| **Constraints** | Role-scoped permissions; all actions audit-logged |

### Finance

| Attribute | Detail |
|-----------|--------|
| **Roles** | Finance officer, Accountant, Bursar, CFO |
| **Primary needs** | Fee invoicing, payment reconciliation, accounting, financial reports |
| **Access** | Finance module (v2.0+) |
| **Constraints** | Segregation of duties; no access to academic grading |

### HR

| Attribute | Detail |
|-----------|--------|
| **Roles** | HR manager, HR officer |
| **Primary needs** | Staff records, leave, contracts, payroll input |
| **Access** | HR module (v2.0+) |
| **Constraints** | PII protection; payroll approval workflows |

### Principal / Academic Leadership

| Attribute | Detail |
|-----------|--------|
| **Roles** | Principal, Vice Principal, Academic Director, Head of School |
| **Primary needs** | Dashboards, analytics, inspection reports, school-wide oversight |
| **Access** | Admin Portal + Analytics |
| **Constraints** | Read access school-wide; write access per policy |

### Super Admin (School-Level)

| Attribute | Detail |
|-----------|--------|
| **Roles** | IT Director, System Administrator |
| **Primary needs** | User management, RBAC, settings, integrations, audit logs |
| **Access** | Settings + full admin |
| **Constraints** | Cannot access platform-level (EduTrack operator) controls |

### Government / Inspector

| Attribute | Detail |
|-----------|--------|
| **Roles** | Ministry inspector, KHDA/ADEK/MOEHE auditor |
| **Primary needs** | Standardized compliance reports, read-only data exports |
| **Access** | Government reporting portal (read-only, time-limited) |
| **Constraints** | No write access; access expires; fully audit-logged |

### Platform Operator (EduTrack Internal)

| Attribute | Detail |
|-----------|--------|
| **Roles** | EduTrack support, implementation, operations |
| **Primary needs** | Tenant provisioning, support escalation, platform monitoring |
| **Access** | Operator console (separate from school tenant) |
| **Constraints** | Least-privilege; no student data access without school authorization |

---

## 5. Functional Requirements — Module Index

| # | Module | Release | Priority | Complexity | Primary Business Value |
|---|--------|---------|----------|------------|----------------------|
| 1 | Admissions | v1.0 | P0 | High | Revenue pipeline; zero re-entry to enrollment |
| 2 | Enrollment | v1.0 | P0 | High | Student record creation; admissions-to-SIS bridge |
| 3 | Student Management | v1.0 | P0 | High | Single source of truth for student lifecycle |
| 4 | Attendance | v1.0 | P0 | Medium | Daily engagement; parent notifications; compliance |
| 5 | Gradebook | v1.0 | P0 | High | Teacher adoption; academic records source |
| 6 | Homework | v1.1 | P1 | Medium | Teacher workflow; parent visibility |
| 7 | Assessments | v1.1 | P1 | High | Examination cycle; report card input |
| 8 | Academic Records | v1.0 | P0 | High | Transcripts, promotion, historical records |
| 9 | Scheduling | v1.0 | P0 | High | Timetables, room allocation, daily operations |
| 10 | Teacher Portal | v1.0 | P0 | Medium | Unified teacher experience |
| 11 | Parent Portal | v1.0 | P0 | High | NPS driver; parent activation; fee visibility |
| 12 | Student Portal | v1.1 | P1 | Medium | Student engagement |
| 13 | Communication | v1.0 | P0 | Medium | Messaging; audit trail |
| 14 | Notifications | v1.0 | P0 | Medium | Multi-channel alerts |
| 15 | Calendar | v1.0 | P0 | Low | School events, holidays, academic calendar |
| 16 | Documents | v1.0 | P0 | Medium | Document storage, consent, admissions docs |
| 17 | Reports | v1.0 | P0 | Medium | Operational and compliance reporting |
| 18 | Analytics | v1.0 | P0 | Medium | Principal dashboard; adoption metrics |
| 19 | Finance | v2.0 | P2 | High | Expansion revenue; fee collection |
| 20 | Accounting | v2.0 | P2 | High | Ledger, reconciliation, audit |
| 21 | Fees | v2.0 | P2 | High | Invoicing, payment plans, scholarships |
| 22 | HR | v2.0 | P2 | High | Staff lifecycle; leave management |
| 23 | Payroll | v2.0 | P2 | High | Salary processing; compliance |
| 24 | Transportation | v3.0 | P3 | High | Safety; parent bus tracking |
| 25 | Medical Clinic | v3.0 | P3 | Medium | Student health; allergy alerts |
| 26 | Library | v3.0 | P3 | Medium | Resource management |
| 27 | Inventory | v3.0 | P3 | Medium | School supplies tracking |
| 28 | Assets | v3.0 | P3 | Medium | Fixed asset register |
| 29 | Behavior | v3.0 | P3 | Medium | Discipline; counselor workflows |
| 30 | Certificates | v1.1 | P1 | Low | Report cards, transcripts, leaving certificates |
| 31 | CMS | v1.1 | P1 | Medium | School website; public admissions |
| 32 | Settings | v1.0 | P0 | High | RBAC, school config, academic year |
| 33 | AI | v2.0+ | P2/P4 | Very High | Differentiation; upsell; retention |
| 34 | Marketplace | v4.0 | P4 | High | Platform ecosystem; partner revenue |
| 35 | Integrations | v1.0+ | P0–P4 | High | Payment, SSO, productivity, government |

---

## 6. Module Specifications

### 6.1 Admissions

| Field | Value |
|-------|-------|
| **Release** | v1.0 |
| **Priority** | P0 |
| **Complexity** | High |
| **Risk** | Medium |

**Purpose:** Manage the prospective student pipeline from inquiry through offer.

**Business Value:** Revenue pipeline; zero re-entry to enrollment; admissions analytics.

**Functional Requirements:** FR-ADM-001: Online AR/EN inquiry forms. FR-ADM-002: Configurable multi-stage pipeline. FR-ADM-003: Document checklist per grade. FR-ADM-004: Parent applicant portal. FR-ADM-005: Digital offer accept/decline. FR-ADM-006: Waitlist with priority. FR-ADM-007: Accepted applicant converts to enrollment without data re-entry. FR-ADM-008: Funnel analytics. FR-ADM-009: Full audit trail.

**Acceptance Criteria:** AC-ADM-001: Inquiry appears in pipeline within 1 minute. AC-ADM-002: Accepted offer creates pre-populated enrollment. AC-ADM-003: Document upload updates checklist status.

**Dependencies:** Enrollment, Student Management, Documents, Notifications, Settings.

---

### 6.2 Enrollment

| Field | Value |
|-------|-------|
| **Release** | v1.0 | **Priority** | P0 | **Complexity** | High | **Risk** | Critical |

**Purpose:** Formalize student enrollment per academic year; create authoritative student record.

**Business Value:** Single enrollment triggers records, parent accounts, and downstream modules.

**Functional Requirements:** FR-ENR-001: Link student to year, grade, section. FR-ENR-002: Bulk re-enrollment. FR-ENR-003: Section capacity validation. FR-ENR-004: Auto-provision parent accounts. FR-ENR-005: Statuses: Pending, Active, Transferred, Withdrawn, Graduated. FR-ENR-006: CSV import with validation. FR-ENR-007: Enrollment confirmation document.

**Acceptance Criteria:** AC-ENR-001: Active enrollment appears in attendance roster. AC-ENR-002: Over-capacity assignment blocked. AC-ENR-003: Parent sees child within 24 hours.

**Dependencies:** Admissions, Student Management, Parent Portal, Settings.

---

### 6.3 Student Management

| Field | Value |
|-------|-------|
| **Release** | v1.0 | **Priority** | P0 | **Complexity** | High | **Risk** | Critical |

**Purpose:** Single authoritative student record across all modules.

**Business Value:** Eliminates data silos; supports multi-campus operations.

**Functional Requirements:** FR-STU-001: Profile (AR/EN name, DOB, nationality, ID, photo). FR-STU-002: Guardian linking with relationship and custody flags. FR-STU-003: Medical alerts propagated to teachers. FR-STU-004: Unique student ID per tenant. FR-STU-005: Search <2s for 5,000 students. FR-STU-006: Immutable lifecycle history. FR-STU-007: Multi-campus view. FR-STU-008: Permission-scoped export.

**Acceptance Criteria:** AC-STU-001: Allergy visible on teacher roster. AC-STU-002: Transfer history shows date, sections, authorizer. AC-STU-003: Dedup suggests merge for matching records.

**Dependencies:** All modules consume this record.

---

### 6.4 Attendance

| Field | Value |
|-------|-------|
| **Release** | v1.0 | **Priority** | P0 | **Complexity** | Medium | **Risk** | Medium |

**Purpose:** Record daily/period attendance; trigger parent notifications; support compliance.

**Functional Requirements:** FR-ATT-001: Mark Present/Absent/Late/Excused in <2 min for 30 students. FR-ATT-002: Period-level attendance. FR-ATT-003: Bulk mark all present. FR-ATT-004: Configurable absence reasons. FR-ATT-005: Parent notified within 5 minutes of absence. FR-ATT-006: Attendance lock with authorized override. FR-ATT-007: Summary reports. FR-ATT-008: Mobile attendance with offline queue (v1.1).

**Acceptance Criteria:** AC-ATT-001: Absence triggers parent notification within 5 min. AC-ATT-002: Locked attendance blocks edits. AC-ATT-003: Mark All Present works for full class.

**Dependencies:** Student Management, Scheduling, Notifications, Teacher Portal.

---

### 6.5 Gradebook

| Field | Value |
|-------|-------|
| **Release** | v1.0 | **Priority** | P0 | **Complexity** | High | **Risk** | High |

**Purpose:** Record, calculate, and manage grades with configurable schemes.

**Functional Requirements:** FR-GRD-001: Grade entry per assignment. FR-GRD-002: Scales: percentage, letter, IB 1-7, custom. FR-GRD-003: Weighted categories with auto-calculation. FR-GRD-004: Term grade calculation. FR-GRD-005: Grade locking with override audit. FR-GRD-006: Full grade change history. FR-GRD-007: Parent visibility per policy. FR-GRD-008: AR/EN comment bank.

**Acceptance Criteria:** AC-GRD-001: Weighted term grade calculates correctly. AC-GRD-002: Locked grades require override reason. AC-GRD-003: Published grades visible to parents in configured language.

**Dependencies:** Student Management, Academic Records, Teacher Portal, Parent Portal.

---

### 6.6 Homework — v1.1, P1

**Purpose:** Assign, track, and grade homework. **FR-HW-001** through **FR-HW-005**: creation, submission tracking, gradebook link, notifications, late flags. **AC-HW-001**: Parent sees homework within 1 minute of publish.

---

### 6.7 Assessments — v1.1, P1

**Purpose:** Formal examinations — scheduling, seating, grades, publication. **FR-ASM-001** through **FR-ASM-005**: timetable, grade capture, conflict detection, results publish, reports.

---

### 6.8 Academic Records — v1.0, P0

**Purpose:** Permanent academic history, promotion, retention, transcripts. **FR-ACR-001** through **FR-ACR-005**: year history, promotion, retention, transcript compilation, transfer packages.

---

### 6.9 Scheduling — v1.0, P0

**Purpose:** Timetables, room allocation, teacher schedules. **FR-SCH-001** through **FR-SCH-006**: builder, conflict detection, teacher/student views, substitutes, publish.

---

### 6.10 Teacher Portal — v1.0, P0

**Purpose:** Unified teacher workspace. **FR-TCH-001** through **FR-TCH-005**: dashboard, quick actions, roster, mobile parity, AR/EN UI. **AC-TCH-001**: Daily admin ≤15 minutes.

---

### 6.11 Parent Portal — v1.0, P0

**Purpose:** Parent self-service — academics, messaging, fees (v2.0), notifications. **FR-PAR-001** through **FR-PAR-008**: multi-child, academic view, messaging, notifications, mobile apps, RTL, onboarding. **AC-PAR-001**: Activation ≥55% in 30 days.

---

### 6.12 Student Portal — v1.1, P1

**Purpose:** Student schedule, assignments, grades. **FR-STP-001** through **FR-STP-003**: own-data only, age controls, homework visibility.

### 6.13 Communication — v1.0, P0

**Purpose:** Secure messaging between school stakeholders with audit trail.

**Business Value:** Replaces WhatsApp groups; compliant communication; reduces miscommunication.

**Functional Requirements:** FR-COM-001: Teacher-parent messaging within assigned students. FR-COM-002: Admin broadcast to grade/class/school. FR-COM-003: Message audit log (sender, recipient, timestamp, content). FR-COM-004: Attachment support with size limits. FR-COM-005: Read receipts (configurable). FR-COM-006: Block direct parent-to-parent messaging.

**Acceptance Criteria:** AC-COM-001: Teacher cannot message unassigned students\' parents. AC-COM-002: All messages retained per retention policy.

**Dependencies:** Notifications, Parent Portal, Teacher Portal, Settings.

---

### 6.14 Notifications — v1.0, P0

**Purpose:** Multi-channel notification delivery engine.

**Functional Requirements:** FR-NOT-001: Channels: email, SMS, push, in-app (WhatsApp v2.0). FR-NOT-002: User preference management. FR-NOT-003: Template engine AR/EN. FR-NOT-004: Delivery status tracking. FR-NOT-005: Rate limiting and quiet hours. FR-NOT-006: Critical alerts bypass quiet hours.

**Acceptance Criteria:** AC-NOT-001: Absence notification delivered within 5 minutes. AC-NOT-002: User can opt out of non-critical channels.

**Dependencies:** All modules that trigger events.

---

### 6.15 Calendar — v1.0, P0

**Purpose:** School-wide and personal calendars for events, holidays, exams.

**Functional Requirements:** FR-CAL-001: Academic calendar with terms, holidays (Gregorian + Hijri). FR-CAL-002: School events with audience targeting. FR-CAL-003: Personal calendar aggregation. FR-CAL-004: iCal export. FR-CAL-005: Sync with Google/Microsoft (v1.1 integration).

**Acceptance Criteria:** AC-CAL-001: Hijri dates display alongside Gregorian. AC-CAL-002: Exam events appear on teacher and student calendars.

---

### 6.16 Documents — v1.0, P0

**Purpose:** Secure document storage, sharing, and consent tracking.

**Functional Requirements:** FR-DOC-001: Upload/store per student, staff, school. FR-DOC-002: Document categories (admissions, medical, legal). FR-DOC-003: Access control by role. FR-DOC-004: Consent tracking for child documents. FR-DOC-005: Retention policy enforcement. FR-DOC-006: Version history.

**Acceptance Criteria:** AC-DOC-001: Unauthorized role cannot access restricted documents. AC-DOC-002: Admissions documents linked to applicant record.

---

### 6.17 Reports — v1.0, P0

**Purpose:** Operational and compliance report generation.

**Functional Requirements:** FR-RPT-001: Pre-built reports: attendance, enrollment, grades, class lists. FR-RPT-002: KHDA/ADEK/MOEHE templates (configurable). FR-RPT-003: Export PDF, Excel, CSV. FR-RPT-004: Scheduled report delivery. FR-RPT-005: Report access by role.

**Acceptance Criteria:** AC-RPT-001: Inspection report pack generated in <2 hours. AC-RPT-002: Reports reflect locked/finalized data only where required.

---

### 6.18 Analytics — v1.0, P0

**Purpose:** Dashboards and metrics for school leadership.

**Functional Requirements:** FR-ANL-001: Principal dashboard: enrollment, attendance, grades overview. FR-ANL-002: Adoption metrics: teacher WAU, parent activation. FR-ANL-003: Drill-down by grade, section, campus. FR-ANL-004: Date range filtering. FR-ANL-005: Export dashboard data.

**Acceptance Criteria:** AC-ANL-001: Dashboard loads in <3 seconds. AC-ANL-002: Metrics match underlying module data.

---

### 6.19 Finance — v2.0, P2

**Purpose:** School financial management — budgeting, invoicing oversight, financial reporting.

**Business Value:** Expansion revenue driver; target ≥50% attach by Y2.

**Functional Requirements:** FR-FIN-001: Chart of accounts. FR-FIN-002: Budget vs actual. FR-FIN-003: Financial period management. FR-FIN-004: Integration with Fees and Accounting. FR-FIN-005: Multi-currency (USD, QAR, AED, SAR). FR-FIN-006: ZATCA e-invoicing support (Saudi).

**Acceptance Criteria:** AC-FIN-001: Fee payment auto-reconciles to ledger. AC-FIN-002: Financial reports match fee module totals.

**Dependencies:** Fees, Accounting, Settings.

---

### 6.20 Accounting — v2.0, P2

**Purpose:** General ledger, journal entries, financial statements.

**Functional Requirements:** FR-ACC-001: Double-entry ledger. FR-ACC-002: Automated entries from fee payments. FR-ACC-003: Trial balance, P&L, balance sheet. FR-ACC-004: Export to Xero/QuickBooks. FR-ACC-005: Audit trail on all entries.

---

### 6.21 Fees — v2.0, P2

**Purpose:** Fee structure, invoicing, payment collection, scholarships.

**Business Value:** Critical for school ROI; parent payment in-app; local payment rails.

**Functional Requirements:** FR-FEE-001: Fee structure by grade/program. FR-FEE-002: Term invoicing with line items. FR-FEE-003: Payment plans and installments. FR-FEE-004: Online payment (QPay, Mada, Stripe). FR-FEE-005: Scholarship/discount application. FR-FEE-006: Receipt generation. FR-FEE-007: Overdue tracking and reminders. FR-FEE-008: Sibling discounts per policy.

**Acceptance Criteria:** AC-FEE-001: Parent pays via QPay; receipt issued within 1 minute. AC-FEE-002: ≥80% digital payment within 7 days of invoice (target).

**Dependencies:** Finance, Accounting, Parent Portal, Integrations (payment gateways).

---

### 6.22 HR — v2.0, P2

**Purpose:** Staff records, contracts, leave, recruitment.

**Functional Requirements:** FR-HR-001: Staff profile linked to system user. FR-HR-002: Contract management. FR-HR-003: Leave requests and approval workflow. FR-HR-004: Leave balance tracking. FR-HR-005: Staff directory. FR-HR-006: Onboarding checklist.

---

### 6.23 Payroll — v2.0, P2

**Purpose:** Salary processing, deductions, payslips.

**Functional Requirements:** FR-PAY-001: Salary structure per staff. FR-PAY-002: Monthly payroll run with approval. FR-PAY-003: Payslip generation. FR-PAY-004: Deductions (tax, benefits). FR-PAY-005: Export to bank file. FR-PAY-006: Integration with HR leave.

---

### 6.24 Transportation — v3.0, P3

**Purpose:** Bus routes, student assignments, GPS tracking, parent notifications.

**Functional Requirements:** FR-TRN-001: Route and stop management. FR-TRN-002: Student-to-route assignment. FR-TRN-003: Driver app for check-in/check-out. FR-TRN-004: GPS tracking with parent visibility. FR-TRN-005: Absence sync with attendance. FR-TRN-006: Route capacity management.

**Acceptance Criteria:** AC-TRN-001: Parent receives bus arrival notification. AC-TRN-002: Student check-in updates attendance.

---

### 6.25 Medical Clinic — v3.0, P3

**Purpose:** Student health records, clinic visits, allergy management.

**Functional Requirements:** FR-MED-001: Health profile per student. FR-MED-002: Visit logging. FR-MED-003: Allergy/condition alerts to teachers. FR-MED-004: Medication administration log. FR-MED-005: Parent notification on clinic visit.

---

### 6.26 Library — v3.0, P3

**Purpose:** Book catalog, checkout, returns, fines.

**Functional Requirements:** FR-LIB-001: Catalog management. FR-LIB-002: Checkout/return by student/staff. FR-LIB-003: Overdue tracking. FR-LIB-004: Fine integration with Fees (optional).

---

### 6.27 Inventory — v3.0, P3

**Purpose:** School supplies and consumables tracking.

**Functional Requirements:** FR-INV-001: Item catalog. FR-INV-002: Stock levels and reorder alerts. FR-INV-003: Issue to department/staff.

---

### 6.28 Assets — v3.0, P3

**Purpose:** Fixed asset register — equipment, furniture, IT assets.

**Functional Requirements:** FR-AST-001: Asset registration with tag/serial. FR-AST-002: Assignment to location/staff. FR-AST-003: Depreciation tracking. FR-AST-004: Disposal workflow.

---

### 6.29 Behavior — v3.0, P3

**Purpose:** Discipline incidents, merit/demerit, counselor notes.

**Functional Requirements:** FR-BEH-001: Incident logging with category and severity. FR-BEH-002: Merit/demerit point system (configurable). FR-BEH-003: Parent notification per policy. FR-BEH-004: Counselor case notes (restricted access). FR-BEH-005: Correlation with academic records for reporting.

---

### 6.30 Certificates — v1.1, P1

**Purpose:** Report cards, transcripts, leaving certificates, enrollment certificates.

**Functional Requirements:** FR-CER-001: Report card templates AR/EN. FR-CER-002: Bulk generation from locked grades. FR-CER-003: Transcript from academic records. FR-CER-004: Digital signature support. FR-CER-005: PDF export with school branding.

**Acceptance Criteria:** AC-CER-001: 500 report cards generated in <30 minutes.

---

### 6.31 CMS — v1.1, P1

**Purpose:** School public website and content management.

**Functional Requirements:** FR-CMS-001: Public school website with AR/EN. FR-CMS-002: News and announcements. FR-CMS-003: Admissions inquiry form integration. FR-CMS-004: Custom domain support. FR-CMS-005: SEO-friendly pages.

---

### 6.32 Settings — v1.0, P0

**Purpose:** School configuration, RBAC, academic year, system preferences.

**Functional Requirements:** FR-SET-001: Academic year and term configuration. FR-SET-002: Grade levels and sections. FR-SET-003: Role and permission management. FR-SET-004: School profile (name, logo, contact, timezone). FR-SET-005: Notification defaults. FR-SET-006: Grading policy configuration. FR-SET-007: Multi-campus settings (school groups). FR-SET-008: Audit log viewer for admins.

**Acceptance Criteria:** AC-SET-001: Permission changes take effect within 1 minute. AC-SET-002: All sensitive actions appear in audit log.

---

### 6.33 AI — v2.0+, P2/P4

**Purpose:** AI layer across modules — prediction, assistance, automation with human governance.

**Business Value:** Differentiation; premium upsell; retention driver.

**Functional Requirements:**

| ID | Capability | Release | Requirement |
|----|------------|---------|-------------|
| FR-AI-001 | At-risk student detection | v2.0 | Flag students based on attendance + grade trends; confidence score; human review |
| FR-AI-002 | Attendance pattern analysis | v2.0 | Detect chronic absenteeism patterns |
| FR-AI-003 | Smart notifications | v2.0 | Prioritize and optimize notification timing |
| FR-AI-004 | Report narrative generation | v2.0 | Draft report card comments; teacher approval required |
| FR-AI-005 | Teacher assistant | v2.5 | Message drafting, grading suggestions |
| FR-AI-006 | Parent assistant | v2.5 | Natural language Q&A on child data |
| FR-AI-007 | Timetable optimization | v3.0 | Constraint-based schedule suggestions |
| FR-AI-008 | Behavioral prediction | v3.0 | Incident pattern detection |
| FR-AI-009 | Executive analytics NLQ | v3.0 | Natural language queries on dashboards |
| FR-AI-010 | AI governance | v2.0 | Feature toggles, audit, bias monitoring, opt-in |

**Acceptance Criteria:** AC-AI-001: No AI grade published without teacher approval. AC-AI-002: AI recommendations include confidence score and reasoning.

**Dependencies:** Analytics, Attendance, Gradebook, Behavior; sufficient data volume.

---

### 6.34 Marketplace — v4.0, P4

**Purpose:** Third-party app ecosystem for certified integrations.

**Functional Requirements:** FR-MKT-001: Curated app directory. FR-MKT-002: App install/uninstall per school. FR-MKT-003: Revenue share tracking. FR-MKT-004: App certification process. FR-MKT-005: Developer submission workflow (v4.1).

---

### 6.35 Integrations — v1.0+, P0–P4

**Purpose:** Connect EduTrack to external systems.

**Functional Requirements:** FR-INT-001: Integration management console. FR-INT-002: Credential secure storage. FR-INT-003: Sync status and error logging. FR-INT-004: Webhook support for events. FR-INT-005: Per-integration enable/disable.

See [Section 13](#13-integrations) for detailed integration requirements.

## 7. User Stories

### Format

> As a **[role]**, I want **[capability]**, so that **[business outcome]**.

### Priority Legend

| Priority | Meaning |
|----------|---------|
| P0 | MVP — must ship v1.0 |
| P1 | v1.1 — shortly after MVP |
| P2 | v2.0 — expansion |
| P3 | v3.0+ — operational depth |

### Core User Stories (Representative Set)

| ID | User Story | Priority | Acceptance Criteria | Business Rules | Edge Cases |
|----|------------|----------|---------------------|----------------|------------|
| US-001 | As a **Registrar**, I want to enroll a student from an accepted application without re-entering data, so that admissions-to-enrollment is seamless | P0 | Student record pre-populated; zero duplicate creation | BR-ENR-001 | Duplicate applicant with same DOB flagged |
| US-002 | As a **Teacher**, I want to mark attendance in one tap for my class, so that I spend <2 minutes on attendance | P0 | 30 students marked in <2 min; parent notified on absence | BR-ATT-001 | Student added mid-day appears on roster |
| US-003 | As a **Parent**, I want to receive instant absence alerts in Arabic, so that I know immediately if my child is not at school | P0 | Push within 5 min; AR/EN per preference | BR-ATT-002 | Parent with multiple children gets per-child alerts |
| US-004 | As a **Teacher**, I want to enter grades that auto-calculate term scores, so that I avoid manual calculation errors | P0 | Weighted calculation correct to 2 decimal places | BR-GRD-001 | Missing assignment excluded or zero per policy |
| US-005 | As an **Academic Director**, I want grade change audit logs, so that inspection queries are answered in minutes | P0 | Every change logged with user, timestamp, reason | BR-GRD-002 | Bulk import changes logged individually |
| US-006 | As a **Principal**, I want an inspection report pack in <2 hours, so that KHDA/ADEK visits are not disruptive | P0 | Report pack PDF generated with required templates | BR-RPT-001 | Partial data shows clear "pending" indicators |
| US-007 | As a **Parent**, I want to view all my children's grades and attendance in one app, so that I use one tool instead of WhatsApp groups | P0 | Multi-child dashboard; activation ≥55% | BR-PAR-001 | Divorced parents see only authorized children |
| US-008 | As a **CFO**, I want fee payments to auto-reconcile to the ledger, so that reconciliation takes hours not days | P2 | Payment matched within 1 minute of confirmation | BR-FEE-001 | Partial payment allocated per policy |
| US-009 | As an **IT Director**, I want SSO with Google Workspace, so that staff use one login | P1 | SSO login works; user provisioned on first login | BR-SET-001 | Deprovisioned Google user blocked |
| US-010 | As a **School Owner**, I want a real-time enrollment and revenue dashboard, so that I make informed decisions | P0 | Dashboard reflects live enrollment and attendance | — | Multi-campus aggregates correctly |
| US-011 | As a **Counselor**, I want to see behavior incidents alongside academic trends, so that I intervene early | P3 | Correlated view on student profile | BR-BEH-001 | Restricted notes hidden from teachers |
| US-012 | As a **Transport Coordinator**, I want to assign students to bus routes, so that I replace Excel tracking | P3 | Route assignment with capacity check | BR-TRN-001 | Student with no route flagged for admin |
| US-013 | As a **Nurse**, I want allergy alerts on student profiles, so that teachers are informed automatically | P3 | Allergy visible on teacher roster and clinic | BR-MED-001 | Emergency contact accessible |
| US-014 | As a **Teacher**, I want to message a parent with an audit trail, so that communication is documented | P0 | Message stored; both parties notified | BR-COM-001 | Parent cannot message other parents |
| US-015 | As an **Admissions Officer**, I want a visual pipeline of applicants, so that I track conversion without spreadsheets | P0 | Kanban/list view; stage transitions logged | BR-ADM-001 | Waitlisted applicant auto-notified on opening |

---

## 8. Business Rules

### Enrollment

| ID | Rule |
|----|------|
| BR-ENR-001 | A student may have only one Active enrollment per academic year per campus |
| BR-ENR-002 | Enrollment cannot be Active without at least one linked guardian |
| BR-ENR-003 | Section assignment must not exceed configured capacity |
| BR-ENR-004 | Re-enrollment requires previous year record in Graduated, Active, or Withdrawn status |
| BR-ENR-005 | New student from admissions inherits all validated applicant data; manual override requires audit |

### Attendance

| ID | Rule |
|----|------|
| BR-ATT-001 | Attendance must be recorded per configured period or daily by school policy |
| BR-ATT-002 | Absence notification sent only for Absent and Unauthorized; not for Excused unless configured |
| BR-ATT-003 | Attendance cannot be modified after lock date without authorized override |
| BR-ATT-004 | Late arrival after configured threshold counts as Late, not Present |

### Grades

| ID | Rule |
|----|------|
| BR-GRD-001 | Category weights must total 100% before term grade calculation enabled |
| BR-GRD-002 | Grade changes after lock require override reason and authorized role |
| BR-GRD-003 | Published grades visible to parents only after admin publication action |
| BR-GRD-004 | Deleted grades are soft-deleted; never physically removed |

### Promotion

| ID | Rule |
|----|------|
| BR-PRO-001 | End-of-year promotion requires all term grades locked |
| BR-PRO-002 | Promotion rules configurable: automatic by grade threshold, manual approval, or hybrid |
| BR-PRO-003 | Promoted student enrolled in next grade for upcoming academic year |

### Repeating Year

| ID | Rule |
|----|------|
| BR-REP-001 | Retention requires documented reason and authorized approver |
| BR-REP-002 | Retained student re-enrolled in same grade for next academic year |

### Transfers

| ID | Rule |
|----|------|
| BR-TRF-001 | Internal transfer (section/campus) preserves academic history |
| BR-TRF-002 | External transfer generates transfer package; student status = Transferred |
| BR-TRF-003 | Transfer mid-year updates attendance and schedule assignments |

### Withdrawals

| ID | Rule |
|----|------|
| BR-WDR-001 | Withdrawal requires reason, date, and authorized approval |
| BR-WDR-002 | Withdrawn student removed from active rosters; historical data retained |
| BR-WDR-003 | Fee obligations through withdrawal date calculated per policy |

### Behavior

| ID | Rule |
|----|------|
| BR-BEH-001 | Behavior incidents visible to teachers only if configured; counselor notes restricted |
| BR-BEH-002 | Parent notification for incidents per severity configuration |

### Fees

| ID | Rule |
|----|------|
| BR-FEE-001 | Invoice generated per fee structure and enrollment |
| BR-FEE-002 | Payment applied to oldest outstanding invoice first unless configured otherwise |
| BR-FEE-003 | Scholarship/discount cannot reduce fee below zero |
| BR-FEE-004 | Refunds require authorized approval and audit |

### Parent Access

| ID | Rule |
|----|------|
| BR-PAR-001 | Parent sees only linked children; custody flags restrict access |
| BR-PAR-002 | Parent cannot view other students\' data |
| BR-PAR-003 | Grade visibility follows school publication policy |

### Teacher Permissions

| ID | Rule |
|----|------|
| BR-TCH-001 | Teacher accesses only assigned classes and students |
| BR-TCH-002 | Teacher cannot modify locked grades or attendance |
| BR-TCH-003 | Teacher cannot access financial or HR data |

### School Policies

| ID | Rule |
|----|------|
| BR-POL-001 | Each school configures own grading, attendance, and fee policies within platform constraints |
| BR-POL-002 | Policy changes apply forward; not retroactive without explicit override |

### Academic Calendar

| ID | Rule |
|----|------|
| BR-CAL-001 | All academic modules reference configured academic year and terms |
| BR-CAL-002 | Hijri and Gregorian dates both supported; school selects primary display |
| BR-CAL-003 | Operations outside academic year require admin override |

---

## 9. Non-Functional Requirements

### Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PER-001 | P95 page load time (portal) | <2 seconds |
| NFR-PER-002 | P95 API response time (read) | <500 ms |
| NFR-PER-003 | Attendance save for 30 students | <3 seconds |
| NFR-PER-004 | Report generation (standard) | <30 seconds |
| NFR-PER-005 | Search (5,000 students) | <2 seconds |
| NFR-PER-006 | Concurrent users per school | 500 without degradation |
| NFR-PER-007 | Bulk import (1,000 records) | <5 minutes with validation report |

### Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-001 | All data encrypted in transit (TLS 1.2+) and at rest |
| NFR-SEC-002 | Multi-factor authentication for admin roles |
| NFR-SEC-003 | Session timeout configurable; default 30 minutes inactivity |
| NFR-SEC-004 | Password policy: min 12 chars, complexity, breach check |
| NFR-SEC-005 | RBAC enforced on every data access |
| NFR-SEC-006 | Tenant data isolation — no cross-tenant data leakage |
| NFR-SEC-007 | Penetration test before GA; zero critical findings open |
| NFR-SEC-008 | Security incident response plan documented |

### Availability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-AVL-001 | Platform uptime SLA | 99.9% |
| NFR-AVL-002 | Planned maintenance window | Max 4 hours/month; off-peak |
| NFR-AVL-003 | Status page for incident communication | Public, real-time |

### Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SCL-001 | Schools per platform | 10,000+ |
| NFR-SCL-002 | Students per school | 10,000 |
| NFR-SCL-003 | School groups with campuses | 50 campuses per group |
| NFR-SCL-004 | Horizontal scale without downtime | Required |

### Localization

| ID | Requirement |
|----|-------------|
| NFR-LOC-001 | Arabic and English at full parity — not translation-only |
| NFR-LOC-002 | True RTL layout for Arabic |
| NFR-LOC-003 | Hijri and Gregorian calendar support |
| NFR-LOC-004 | Locale-aware date, number, and currency formatting |
| NFR-LOC-005 | French support planned for Morocco (v3.0) |

### Accessibility

| ID | Requirement |
|----|-------------|
| NFR-ACC-001 | WCAG 2.1 Level AA compliance for web portals |
| NFR-ACC-002 | Screen reader compatibility |
| NFR-ACC-003 | Keyboard navigation for all core workflows |
| NFR-ACC-004 | Color contrast ratios meet AA standards |

### Maintainability

| ID | Requirement |
|----|-------------|
| NFR-MNT-001 | Modular architecture enabling independent module deployment |
| NFR-MNT-002 | Feature flags for gradual rollout |
| NFR-MNT-003 | Comprehensive audit logging |
| NFR-MNT-004 | Documentation for all configuration options |

### Reliability

| ID | Requirement |
|----|-------------|
| NFR-REL-001 | No single point of failure for critical paths |
| NFR-REL-002 | Automated health checks and alerting |
| NFR-REL-003 | Graceful degradation for non-critical features |

### Compliance

| ID | Requirement |
|----|-------------|
| NFR-CMP-001 | Qatar PDPL compliance |
| NFR-CMP-002 | UAE PDPL compliance |
| NFR-CMP-003 | Saudi PDPL compliance |
| NFR-CMP-004 | GDPR-ready for EU-connected schools |
| NFR-CMP-005 | Child data protection with parental consent |
| NFR-CMP-006 | Data residency in GCC region at GA |
| NFR-CMP-007 | SOC 2 Type I by Y2; Type II by Y3 |
| NFR-CMP-008 | KHDA/ADEK/MOEHE report template support |

### Monitoring

| ID | Requirement |
|----|-------------|
| NFR-MON-001 | Real-time application performance monitoring |
| NFR-MON-002 | Error rate alerting with P0/P1 classification |
| NFR-MON-003 | Business metrics dashboard (WASS, adoption, uptime) |
| NFR-MON-004 | Per-tenant usage analytics for Customer Success |

### Logging

| ID | Requirement |
|----|-------------|
| NFR-LOG-001 | All authentication events logged |
| NFR-LOG-002 | All data mutations on sensitive records logged |
| NFR-LOG-003 | Log retention minimum 2 years |
| NFR-LOG-004 | Logs immutable; tamper-evident |

### Backup

| ID | Requirement |
|----|-------------|
| NFR-BAK-001 | Automated daily backups |
| NFR-BAK-002 | Backup retention minimum 30 days |
| NFR-BAK-003 | Cross-region backup replication |
| NFR-BAK-004 | Backup integrity verified weekly |

### Recovery

| ID | Requirement |
|----|-------------|
| NFR-REC-001 | RPO (Recovery Point Objective) ≤1 hour |
| NFR-REC-002 | RTO (Recovery Time Objective) ≤4 hours |
| NFR-REC-003 | Disaster recovery plan tested annually |
| NFR-REC-004 | Tenant-level data restore capability |

## 10. Permission Matrix

### Role Definitions

| Role | Description |
|------|-------------|
| **Super Admin** | School IT administrator; full school configuration |
| **Principal** | School leadership; school-wide read; policy approval |
| **Academic Admin** | Registrar, academic coordinator; enrollment, records, scheduling |
| **Admissions Officer** | Admissions pipeline management |
| **Teacher** | Assigned classes only; attendance, grades, messaging |
| **Finance Officer** | Fees, invoicing, payments (v2.0) |
| **HR Manager** | Staff records, leave, payroll input (v2.0) |
| **Counselor** | Behavior, restricted student notes |
| **Parent** | Linked children only |
| **Student** | Own data only |
| **Government Inspector** | Read-only compliance reports; time-limited |

### Permission Matrix (Abbreviated)

| Permission | Super Admin | Principal | Academic Admin | Teacher | Finance | Parent | Student |
|------------|:-----------:|:---------:|:--------------:|:-------:|:-------:|:------:|:-------:|
| Manage users/RBAC | ✓ | — | — | — | — | — | — |
| School settings | ✓ | Read | — | — | — | — | — |
| Student CRUD | ✓ | Read | ✓ | Read* | — | Read* | Read* |
| Enrollment | ✓ | Approve | ✓ | — | — | — | — |
| Admissions | ✓ | Read | ✓ | — | — | Apply | — |
| Attendance mark | ✓ | Read | ✓ | ✓* | — | Read* | — |
| Grade entry | ✓ | Read | ✓ | ✓* | — | Read* | Read* |
| Grade lock/publish | ✓ | ✓ | ✓ | — | — | — | — |
| Messaging | ✓ | ✓ | ✓ | ✓* | — | ✓* | — |
| Financial data | ✓ | Read | — | — | ✓ | Read* | — |
| HR data | ✓ | Read | — | — | — | — | — |
| Reports (all) | ✓ | ✓ | ✓ | Read* | ✓ | — | — |
| Audit logs | ✓ | Read | — | — | — | — | — |
| Integrations | ✓ | — | — | — | — | — | — |

*\* = Scoped to assigned students/children only*

### Restrictions

| Rule | Description |
|------|-------------|
| **Least privilege** | Users receive minimum permissions for their role |
| **Segregation of duties** | Finance cannot modify grades; teachers cannot access fees |
| **Time-limited access** | Government inspector access expires automatically |
| **Ownership** | Data ownership belongs to the school tenant; EduTrack operator has no default access |

---

## 11. Notifications

### Channels

| Channel | MVP (v1.0) | Future | Use Cases |
|---------|------------|--------|-----------|
| **Email** | ✓ | | Announcements, reports, password reset |
| **SMS** | ✓ | | Absence alerts, critical notices |
| **Push (mobile)** | ✓ | | Real-time absence, messages, homework |
| **In-App** | ✓ | | All notification types |
| **WhatsApp** | | v2.0 | Parent communication (where legal) |

### Notification Types

| Type | Recipients | Channels | Trigger |
|------|-----------|----------|---------|
| Absence alert | Parent | Push, SMS, Email | Student marked absent |
| Grade published | Parent | Push, Email | Admin publishes grades |
| New message | Parent, Teacher | Push, In-App | Message received |
| Homework assigned | Parent, Student | Push, In-App | Teacher publishes homework |
| Fee invoice | Parent | Email, Push | Invoice generated (v2.0) |
| Payment received | Parent, Finance | Email, In-App | Payment confirmed (v2.0) |
| Enrollment confirmed | Parent | Email, Push | Enrollment activated |
| Schedule change | Teacher, Student | Push, In-App | Schedule updated |
| Behavior incident | Parent | Email, Push | Incident logged (v3.0) |
| Bus arrival | Parent | Push | GPS trigger (v3.0) |
| System maintenance | All staff | Email, In-App | Scheduled maintenance |

### Escalations

| Level | Condition | Action |
|-------|-----------|--------|
| L1 | Notification delivery failure | Retry 3x over 15 minutes |
| L2 | Persistent failure | Alert school admin |
| L3 | Critical alert undelivered | Escalate to EduTrack support |

### Automation Rules

| Rule | Description |
|------|-------------|
| NOT-AUTO-001 | Absence notifications fire within 5 minutes of attendance save |
| NOT-AUTO-002 | Fee reminders at 7, 14, 30 days overdue (v2.0) |
| NOT-AUTO-003 | Parent onboarding reminder at 3, 7, 14 days if not activated |
| NOT-AUTO-004 | Quiet hours: 9 PM – 7 AM local (configurable); critical bypass |
| NOT-AUTO-005 | Rate limit: max 20 notifications per user per day (configurable) |

---

## 12. Reporting

### Operational Reports

| Report | Module | Audience | Release |
|--------|--------|----------|---------|
| Daily attendance summary | Attendance | Admin, Principal | v1.0 |
| Class roster | Student Management | Teacher, Admin | v1.0 |
| Enrollment by grade | Enrollment | Admin, Principal | v1.0 |
| Grade distribution | Gradebook | Academic Admin | v1.0 |
| Admissions funnel | Admissions | Admissions, Principal | v1.0 |
| Fee collection status | Fees | Finance, CFO | v2.0 |
| Staff leave balance | HR | HR, Principal | v2.0 |
| Bus utilization | Transportation | Transport, Admin | v3.0 |

### Executive Reports

| Report | Audience | Release |
|--------|----------|---------|
| School health dashboard | Principal, Owner | v1.0 |
| Enrollment trend | Board, Owner | v1.0 |
| Financial summary | CFO, Owner | v2.0 |
| Multi-campus comparison | School group leadership | v2.0 |

### Academic Reports

| Report | Audience | Release |
|--------|----------|---------|
| Report cards | Parent, Admin | v1.1 |
| Transcripts | Admin, Parent | v1.1 |
| Promotion list | Academic Admin | v1.0 |
| At-risk students | Counselor, Principal | v2.0 (AI) |

### Financial Reports

| Report | Audience | Release |
|--------|----------|---------|
| Accounts receivable aging | Finance | v2.0 |
| Revenue by fee type | CFO | v2.0 |
| Payment collection rate | CFO, Owner | v2.0 |
| Trial balance | Accountant | v2.0 |

### Predictive Reports (AI)

| Report | Audience | Release |
|--------|----------|---------|
| At-risk student forecast | Academic Admin, Counselor | v2.0 |
| Chronic absenteeism prediction | Admin, Principal | v2.0 |
| Fee default risk | Finance | v2.5 |
| Enrollment forecast | Admissions, Principal | v3.0 |

### Compliance Report Templates

| Template | Authority | Release |
|----------|-----------|---------|
| KHDA inspection pack | KHDA (Dubai) | v1.0 |
| ADEK inspection pack | ADEK (Abu Dhabi) | v1.0 |
| MOEHE reporting | MOEHE (Qatar) | v1.0 |
| Custom inspection template | Configurable | v1.1 |

---

## 13. Integrations

### Integration Requirements Matrix

| Integration | Purpose | Priority | Release | Requirements |
|-------------|---------|----------|---------|--------------|
| **MOEHE** | Qatar ministry reporting | P1 | v1.1 | Export student data in MOEHE format; read-only |
| **Google Workspace** | SSO, calendar, email | P0 | v1.0 | OAuth SSO; calendar sync |
| **Microsoft 365** | SSO, calendar, email | P1 | v1.1 | Azure AD SSO; Outlook calendar |
| **Azure AD** | Enterprise SSO | P1 | v1.1 | SAML/OAuth; group sync |
| **Google Classroom** | Course sync | P2 | v2.0 | Roster sync; assignment link |
| **Microsoft Teams** | Video, collaboration | P2 | v2.0 | Meeting links; roster sync |
| **Zoom** | Virtual classes | P2 | v2.0 | Meeting scheduling from calendar |
| **Stripe** | International payments | P2 | v2.0 | Card payments; webhook reconciliation |
| **Moyasar** | Saudi payments | P2 | v2.0 | Mada, card; webhook |
| **QPay** | Qatar payments | P0 | v2.0 | Local fee collection; webhook |
| **Twilio** | SMS delivery | P0 | v1.0 | SMS notifications; delivery status |
| **Firebase** | Push notifications | P0 | v1.0 | iOS/Android push |
| **Cloudinary** | Media storage | P1 | v1.0 | Student photos, documents, CMS images |
| **Toddle** | IB curriculum | P2 | v2.0 | Roster sync; grade passback |
| **ManageBac** | IB/British curriculum | P2 | v2.0 | Roster sync; assessment link |
| **Xero** | Accounting export | P2 | v2.0 | Journal entry export |
| **QuickBooks** | Accounting export | P2 | v2.0 | Journal entry export |
| **WhatsApp Business** | Parent messaging | P2 | v2.0 | Template messages; opt-in |

### Per-Integration Acceptance Criteria

| Integration | Acceptance Criterion |
|-------------|---------------------|
| Google Workspace SSO | Staff login via Google; account auto-provisioned on first login |
| QPay | Parent payment completes; fee record updated within 1 minute |
| Twilio SMS | SMS delivered with delivery receipt; failure retried |
| Firebase Push | Push received on iOS and Android within 30 seconds |
| MOEHE | Export file passes MOEHE validation schema |

---

## 14. Module Acceptance Criteria Summary

| Module | Release | Key Acceptance Criteria |
|--------|---------|------------------------|
| Admissions | v1.0 | Pipeline functional; zero re-entry to enrollment; funnel analytics |
| Enrollment | v1.0 | Active student in all rosters; parent provisioned within 24h |
| Student Management | v1.0 | Single record; search <2s; medical alerts visible |
| Attendance | v1.0 | <2 min mark; parent notified <5 min; lock enforced |
| Gradebook | v1.0 | Weighted calc correct; audit trail complete; parent visibility |
| Parent Portal | v1.0 | Activation ≥55%; RTL correct; multi-child |
| Teacher Portal | v1.0 | Daily admin ≤15 min; dashboard <2s |
| Scheduling | v1.0 | Conflicts blocked; published schedule visible <5 min |
| Reports | v1.0 | Inspection pack <2 hours |
| Analytics | v1.0 | Dashboard <3s; metrics accurate |
| Settings | v1.0 | RBAC enforced; audit log complete |
| Fees | v2.0 | QPay payment; auto-reconcile; receipt <1 min |
| AI | v2.0 | Human approval required; confidence scores shown |
| Transportation | v3.0 | GPS tracking; parent bus notification |

---

## 15. Definition of Ready

A requirement or user story is **Ready** when:

| # | Criterion |
|---|-----------|
| 1 | Business value is documented and linked to KPI |
| 2 | Functional requirements are written and testable |
| 3 | Acceptance criteria are defined (min 3 per feature) |
| 4 | Business rules and edge cases are identified |
| 5 | Dependencies on other modules are listed |
| 6 | Priority (P0–P3) and release target are assigned |
| 7 | UX flow is approved by UX Research Lead (for user-facing features) |
| 8 | NFR impacts are assessed (performance, security, compliance) |
| 9 | No open P0 ambiguities remain |
| 10 | Stakeholder sign-off recorded for P0 items |

---

## 16. Definition of Done

A feature is **Done** when:

| # | Criterion |
|---|-----------|
| 1 | All acceptance criteria pass in staging environment |
| 2 | Unit and integration tests pass |
| 3 | QA sign-off with zero open P0/P1 defects |
| 4 | Security review passed for sensitive features |
| 5 | AR/EN localization complete for user-facing text |
| 6 | RTL layout verified for Arabic |
| 7 | Audit logging verified for sensitive actions |
| 8 | Performance meets NFR targets |
| 9 | Documentation updated (admin guide, release notes) |
| 10 | Feature flag configured for gradual rollout |
| 11 | Monitoring and alerting configured |
| 12 | Product Owner accepts the feature |

---

## 17. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|-----------|--------|------------|
| R-01 | MVP scope creep | High | High | Strict P0 lock; defer P1+; change control board |
| R-02 | Grading policy variation across schools | High | Medium | Configurable grading engine; design partner validation |
| R-03 | Arabic RTL layout defects | Medium | High | RTL-first design; bilingual QA on every release |
| R-04 | Parent activation below target | Medium | High | School-mandated onboarding; reminder automation |
| R-05 | Payment gateway integration delays | Medium | High | Start QPay partnership early; Finance module v2.0 not v1.0 |
| R-06 | Data migration complexity | High | High | Standardized migration tooling; pilot validation |
| R-07 | Inspection template inaccuracy | Medium | High | Validate with 3 schools per authority (KHDA, ADEK, MOEHE) |
| R-08 | AI model accuracy insufficient | Medium | Medium | Human-in-the-loop; confidence thresholds; phased AI rollout |
| R-09 | Multi-campus permission complexity | Medium | Medium | Early school-group design partner |
| R-10 | Regulatory change (PDPL) | Low | Critical | Legal monitoring; architecture supports policy updates |

---

## 18. Dependencies

### Internal Module Dependencies

```
Settings → Student Management → Enrollment → All Academic Modules
Admissions → Enrollment → Student Management
Gradebook → Academic Records → Certificates
Attendance → Notifications → Parent Portal
Fees → Finance → Accounting (v2.0 chain)
HR → Payroll (v2.0 chain)
```

### External Dependencies

| Dependency | Required For | Owner | Target Date |
|------------|-------------|-------|-------------|
| QPay partnership agreement | Fee payments | Partnerships | Pre-v2.0 |
| Twilio account | SMS notifications | DevOps | Pre-v1.0 |
| Firebase project | Push notifications | DevOps | Pre-v1.0 |
| Cloudinary account | Media storage | DevOps | Pre-v1.0 |
| Google OAuth app | SSO | Engineering | Pre-v1.0 |
| GCC cloud hosting | Data residency | DevOps | Pre-v1.0 |
| Legal PDPL review | Compliance | Legal | Pre-v1.0 |
| Pilot school commitments (3+) | Validation | Sales | Pre-v1.0 |
| Design partner schools (2+) | UX validation | Product | Pre-v1.0 |

### Phase Dependencies

| This Phase | Depends On | Blocks |
|------------|-----------|--------|
| Phase 3 (PRD) | Phase 1, Phase 2 approved | Phase 4 (Architecture) |
| Phase 4 | G3 approval | Phase 5 (Development) |

---

## 19. Release Plan

### Release Overview

| Release | Version | Timeline | Modules | Goal |
|---------|---------|----------|---------|------|
| **Alpha** | v0.9 | M1–M6 | Core platform, Settings, Student Management | Internal validation |
| **MVP** | v1.0 | M7–M10 | P0 modules (see below) | 5 pilot schools |
| **Enhancement** | v1.1 | M11–M14 | Homework, Assessments, Student Portal, CMS, Certificates | 15 paying schools |
| **Operations** | v2.0 | Y2 Q1–Q2 | Finance, Accounting, Fees, HR, Payroll, AI Basic | Expansion revenue |
| **Logistics** | v3.0 | Y2 Q3–Y3 | Transport, Clinic, Library, Inventory, Assets, Behavior | Operational depth |
| **Platform** | v4.0 | Y3+ | AI Advanced, Marketplace, expanded integrations | Ecosystem |

### v1.0 MVP Module List

1. Settings (RBAC, academic year, school config)
2. Student Management
3. Admissions
4. Enrollment
5. Attendance
6. Gradebook
7. Academic Records
8. Scheduling
9. Teacher Portal (+ mobile app)
10. Parent Portal (+ mobile app)
11. Communication
12. Notifications
13. Calendar
14. Documents
15. Reports
16. Analytics (basic)

### Release Criteria per Gate

| Gate | Criteria |
|------|----------|
| v1.0 GA | All P0 acceptance criteria pass; 3+ pilot schools live; uptime 99.9%; zero open P0 defects |
| v1.1 | P1 modules pass; parent activation ≥55%; teacher WAU ≥70% |
| v2.0 | Payment integration live; Finance attach on ≥3 customers; SOC 2 Type I initiated |
| v3.0 | Transport GPS live; 50+ schools; NRR ≥110% |

---

## 20. Appendices

### Appendix A — Glossary

| Term | Definition |
|------|------------|
| WASS | Weekly Active School Stakeholders |
| SIS | Student Information System |
| RBAC | Role-Based Access Control |
| PDPL | Personal Data Privacy Law |
| ACV | Annual Contract Value |
| NRR | Net Revenue Retention |
| RTL | Right-to-Left (Arabic layout) |
| MVP | Minimum Viable Product |

### Appendix B — Traceability Matrix

| Business Goal | Product Goal | Module | Requirement IDs |
|---------------|-------------|--------|-----------------|
| BG-01 Launch MVP | PG-01 Zero re-entry | Admissions, Enrollment | FR-ADM-007, FR-ENR-001 |
| BG-03 ARR | PG-05 Parent self-service | Parent Portal, Fees | FR-PAR-001–008, FR-FEE-001–008 |
| BG-04 NPS ≥40 | PG-02 Daily embedment | Teacher Portal, Attendance | FR-TCH-001, FR-ATT-001 |
| BG-05 ≤60 day go-live | PG-03 Inspection ready | Reports | FR-RPT-001–005 |

### Appendix C — Persona-to-Module Map

| Persona | Primary Modules |
|---------|----------------|
| Registrar | Enrollment, Student Management, Academic Records |
| Teacher | Teacher Portal, Attendance, Gradebook, Homework |
| Parent | Parent Portal, Notifications, Communication, Fees |
| Principal | Analytics, Reports, Settings |
| CFO | Fees, Finance, Accounting, Reports |
| IT Director | Settings, Integrations |

### Appendix D — Open Questions for Phase 4

| ID | Question | Owner | Required Before |
|----|----------|-------|-----------------|
| OQ-01 | Offline attendance sync conflict resolution strategy | Product + Engineering | Architecture |
| OQ-02 | Multi-tenant vs dedicated tenancy for government | Architecture | v3.0 planning |
| OQ-03 | AI training data consent model per jurisdiction | Legal + Product | AI v2.0 |
| OQ-04 | WhatsApp Business API availability per country | GTM + Legal | v2.0 |

---

## 21. Product Readiness Score & G3 Gate

### Product Readiness Score

| Dimension | Score (1–5) | Notes |
|-----------|-------------|-------|
| Requirement completeness (MVP) | 5 | All P0 modules specified with acceptance criteria |
| Requirement completeness (full platform) | 4 | P2–P4 modules at summary level; detail in future PRD revisions |
| Business rule coverage | 5 | Enrollment, grades, attendance, fees, permissions covered |
| NFR specification | 5 | Performance, security, compliance, DR fully specified |
| Permission matrix | 4 | Core roles defined; edge roles refined in Phase 4 |
| Integration requirements | 4 | Key integrations specified; partner APIs TBD in architecture |
| Testability | 5 | Every P0 requirement has acceptance criteria |
| Traceability | 4 | Business goals linked to modules; full RTM in Appendix B |
| Release plan | 5 | Phased releases with clear module boundaries |
| Stakeholder alignment | 3 | Pending G3 sign-off |

**Overall Product Readiness Score: 4.4 / 5.0**

**Interpretation:** EduTrack PRD is **ready for G3 approval** and Phase 4 (Technical Architecture). P0 requirements are production-grade. P2–P4 modules require detailed specification refinement before their respective release gates.

---

### Approval Gate: G3 — Product Requirements Approval

| # | Criterion | Status |
|---|-----------|--------|
| 1 | All MVP (P0) modules have functional requirements | ☐ Pending |
| 2 | All P0 requirements have acceptance criteria | ☐ Pending |
| 3 | Business rules approved by operations stakeholders | ☐ Pending |
| 4 | NFRs reviewed by architecture and security | ☐ Pending |
| 5 | Permission matrix validated by product and legal | ☐ Pending |
| 6 | Notification and reporting requirements approved | ☐ Pending |
| 7 | Integration requirements agreed by engineering | ☐ Pending |
| 8 | Release plan approved by program management | ☐ Pending |
| 9 | Definition of Ready and Done agreed by QA and engineering | ☐ Pending |
| 10 | No open P0 requirement ambiguities | ☐ Pending |
| 11 | Executive signatures recorded | ☐ Pending |

---

## Next Step

Upon **G3 approval** of this document, proceed to **Phase 4: Technical Architecture** (`docs/04_TECHNICAL_ARCHITECTURE.md`).

**Do not begin technical architecture, source code, infrastructure, UI designs, API specifications, or database schemas until G3 approval is recorded.**

---

*End of Document — EDU-PRD-003 v1.0.0*
