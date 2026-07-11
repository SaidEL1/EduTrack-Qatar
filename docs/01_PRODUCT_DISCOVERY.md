# EduTrack — Product Discovery Document

| Field | Value |
|-------|-------|
| **Document ID** | EDU-DISC-001 |
| **Version** | 1.0.0 |
| **Status** | Draft — Pending Stakeholder Approval |
| **Phase** | Phase 1 — Product Discovery |
| **Author** | EduTrack Product Team |
| **Last Updated** | 2026-07-08 |
| **Classification** | Internal — Confidential |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-07-08 | Product Team | Initial Product Discovery release |

### Approval Gate — G1: Product Discovery Sign-Off

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Executive Sponsor | | | | Pending |
| Product Owner | | | | Pending |
| Engineering Lead | | | | Pending |
| UX Lead | | | | Pending |
| Legal / Compliance | | | | Pending |

**Gate criteria:** All sections reviewed; market positioning validated with ≥3 prospect interviews; pricing model approved by finance; no open P0 questions blocking Phase 2 (Master Product Specification).

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Product Positioning](#3-product-positioning)
4. [Core Values](#4-core-values)
5. [Market Analysis](#5-market-analysis)
6. [Competitor Analysis](#6-competitor-analysis)
7. [SWOT Analysis](#7-swot-analysis)
8. [School Problems](#8-school-problems)
9. [Opportunities](#9-opportunities)
10. [User Personas](#10-user-personas)
11. [User Journeys](#11-user-journeys)
12. [Business Goals](#12-business-goals)
13. [KPIs & Success Metrics](#13-kpis--success-metrics)
14. [Revenue Model](#14-revenue-model)
15. [Pricing Strategy](#15-pricing-strategy)
16. [Assumptions & Constraints](#16-assumptions--constraints)
17. [Open Questions & Phase 2 Dependencies](#17-open-questions--phase-2-dependencies)
18. [Appendices](#18-appendices)

---

## 1. Executive Summary

**EduTrack** is an enterprise-grade, multi-tenant B2B SaaS platform positioned as **"The Operating System for Modern Schools."** It unifies academic operations, finance, HR, parent engagement, analytics, and AI-assisted decision-making into a single cloud-native product sold to private schools, international schools, universities, and educational institutions across Qatar, the GCC, Morocco, and global markets.

### Why Now

1. **Regional digital acceleration:** GCC governments are investing heavily in education digitization (Qatar National Vision 2030, UAE KHDA/ADEK frameworks, Saudi Vision 2030, national AI learning initiatives).
2. **Fragmented school operations:** Most institutions run 5–15 disconnected tools (SIS, LMS, accounting, HR, messaging, transport) with manual reconciliation and poor parent experience.
3. **Compliance pressure:** Data residency (PDPL, UAE PDPL, Saudi PDPL), child data protection, and inspection readiness demand auditable, centralized systems.
4. **Commercial gap:** Global SIS leaders (PowerSchool, Blackbaud, Veracross) are strong in North America/Europe but weak in Arabic-first, GCC-regulatory, and full-ERP depth. Regional ERP vendors (Trasealla, Skolera, Skoolia) offer breadth but often lack enterprise architecture, unified data models, or university-grade modularity.

### Strategic Recommendation

Build EduTrack as a **modular, API-first, single-tenant-logical / multi-tenant-physical** SaaS platform with:

- **One student / one staff / one family record** across all modules
- **MENA-native** compliance, payments, calendars, and RTL UX
- **Land with academics + parent portal**; **expand with finance, HR, transport, AI**

### Discovery Outcome

This document establishes the commercial, user, and strategic foundation required before any implementation. **No code, infrastructure, or UI shall be produced until G1 approval is recorded.**

---

## 2. Product Vision

### Vision Statement

> **EduTrack empowers every school to run with the clarity, connection, and intelligence of a world-class institution — in any language, any curriculum, any country.**

### Mission

Deliver the most complete, commercially viable education management platform that solves real operational problems for schools — not a custom website for a single institution.

### 10-Year North Star

Become the **default school operating system** for premium private and international institutions in MENA, with 2,000+ institutions and a recognized integration ecosystem — while remaining curriculum-agnostic and globally deployable.

### What EduTrack Is

| EduTrack Is | EduTrack Is Not |
|-------------|-----------------|
| Multi-tenant B2B SaaS | A bespoke school website |
| Unified school OS (SIS + ERP + engagement) | A standalone LMS only |
| Commercial product with SLAs | A government-mandated national portal |
| API-first integration hub | A closed monolith |
| Regionally compliant (PDPL, GDPR-ready) | A US-template with translated labels |

### Reasoning

Schools do not buy "features" — they buy **operational certainty**, **regulatory confidence**, and **stakeholder satisfaction**. A vision anchored in "complete platform" justifies premium pricing and long contract life, while "Operating System" signals modularity and extensibility to technical buyers (CIO, IT directors).

---

## 3. Product Positioning

### Positioning Statement

**For** private schools, international schools, and universities **who** struggle with fragmented systems and rising compliance demands, **EduTrack** is the **school operating system** that **unifies academics, operations, finance, and communication on one secure, bilingual platform**. Unlike **point solutions or US-centric SIS vendors**, EduTrack is **built for MENA-first operations with global scalability**, **one-record architecture**, and **enterprise-grade security**.

### Category Definition

**Primary category:** School Operating System (School OS)  
**Secondary categories:** Student Information System (SIS), School ERP, Parent Engagement Platform

*Reasoning:* "SIS" alone commoditizes the product against low-cost vendors. "School ERP" captures finance/HR buyers but undersells pedagogy. "School OS" communicates platform breadth and daily operational centrality.

### Target Segments (Priority Order)

| Priority | Segment | Geography | Rationale |
|----------|---------|-----------|-----------|
| P0 | Premium private K-12 | Qatar, UAE, Saudi | High ARPU, fast decisions, bilingual need |
| P0 | International schools (IB, British, American) | GCC, Morocco | Curriculum-agnostic demand, expat parents, premium fees |
| P1 | School groups & chains | GCC | Multi-campus contracts, highest LTV |
| P1 | Universities & colleges | GCC, Morocco | Adjacent market; shared modules (HR, finance, SIS) |
| P2 | Mid-market private schools | Kuwait, Bahrain, Oman | Price-sensitive; land with Core bundle |
| P3 | Global international schools | Asia, Africa diaspora | Long-term; English-first expansion |

### Differentiation Pillars

1. **Unified Record Architecture** — One person, one record across admissions → alumni; no sync jobs between billing and enrollment.
2. **MENA-Native by Design** — Arabic RTL default, Hijri/Gregorian, local payment rails (QPay, Mada, SADAD), inspection report templates.
3. **Full Operational Depth** — Not just grades: finance, HR, payroll, transport, clinic, library, inventory in one product.
4. **AI with Governance** — Predictive analytics and risk detection with human-in-the-loop; no black-box grading.
5. **Enterprise SaaS Discipline** — Multi-tenant isolation, audit logs, RBAC, API-first, 99.9% SLA, documented compliance posture.

### Competitive Positioning Map (Conceptual)

```
                    High Operational Breadth (ERP)
                              │
                    EduTrack ★│        Skoolia / Trasealla
                              │
         Veracross            │              Skolera
              Blackbaud       │
                              │
    Low ──────────────────────┼────────────────────── High
    Regional / Arabic Fit     │              Regional / Arabic Fit
                              │
         PowerSchool          │         Toddle (TL-focused)
              FACTS           │
                              │
                    Low Operational Breadth (SIS/LMS only)
```

---

## 4. Core Values

| Value | Definition | Product Implication |
|-------|------------|---------------------|
| **Integrity** | Data accuracy and auditability are non-negotiable | Immutable audit logs; no silent data mutations |
| **Clarity** | Every role sees what matters, nothing more | Role-based UX; progressive disclosure |
| **Inclusion** | Arabic and English are equals, not primary/secondary | True RTL; mirrored layouts; locale-aware content |
| **Trust** | Schools entrust us with children's data | Security-by-design; transparent privacy controls |
| **Partnership** | We succeed when schools succeed | Customer success baked into onboarding SLAs |
| **Craft** | Enterprise quality in every workflow | No "good enough" broken flows in core paths |

---

## 5. Market Analysis

### 5.1 Global Context

The global EdTech and school software market continues to consolidate around cloud SIS, LMS, and vertical ERP. Post-COVID, schools expect:

- Parent mobile engagement
- Real-time analytics
- Hybrid learning support
- AI-assisted administration (not replacement of educators)

Enterprise buyers increasingly evaluate **total cost of ownership (TCO)** over 3–5 years, not license sticker price.

### 5.2 Regional Market — GCC & MENA

| Country | Education Spend Context | Digital Drivers | Regulatory Notes |
|---------|-------------------------|-----------------|------------------|
| **Qatar** | QR 21.8B education budget (2026); 6–7% sector growth | National AI learning platform (MOEHE/MCIT); e-services expansion | Qatar PDPL; data localization expectations |
| **UAE** | Largest private school market in GCC; KHDA/ADEK inspections | Smart learning, premium international segment | UAE PDPL; KHDA/ADEK reporting templates |
| **Saudi Arabia** | Vision 2030 HCDP; massive private school growth | Noor/Madrasati ecosystem; digital transformation mandates | Saudi PDPL; ZATCA e-invoicing; Mada payments |
| **Kuwait, Bahrain, Oman** | Smaller but high private-school density | Government digitization programs | Local ministry reporting variations |
| **Morocco** | Growing private education; Francophone + Arabic | Digital education plans; international schools | GDPR influence; French language demand |

### 5.3 Market Sizing (TAM / SAM / SOM)

*Methodology: Bottom-up institution count × average contract value (ACV). Figures are planning estimates requiring validation in sales discovery.*

| Layer | Definition | Estimate | Notes |
|-------|------------|----------|-------|
| **TAM** | All paying K-12 + higher-ed institutions in target geographies | ~45,000 institutions | GCC + Morocco + selectable global international |
| **SAM** | Private, international, and premium institutions willing to pay for unified SaaS | ~8,500 institutions | Excludes fully government-operated national systems |
| **SOM (Year 3)** | Realistic capture with direct sales + partners | 120–180 institutions | ~1.5–2% of SAM |

**Average Contract Value (ACV) planning assumptions:**

| Segment | Students | ACV Range (Annual) |
|---------|----------|-------------------|
| Small school | 200–500 | $15,000 – $35,000 |
| Medium school | 500–1,500 | $35,000 – $120,000 |
| Large school / university college | 1,500–5,000 | $120,000 – $400,000 |
| School group (multi-campus) | 5,000+ | $400,000 – $1.5M+ |

### 5.4 Market Trends

1. **Platform consolidation** — Schools reducing vendor count from 10+ to 2–3.
2. **AI pragmatism** — Demand for prediction and automation with educator oversight.
3. **Mobile-first parents** — Parent app is a purchase trigger, not a nice-to-have.
4. **Compliance as sales lever** — PDPL/GDPR readiness shortens security review cycles.
5. **Payment localization** — Fee collection via local rails is a deal requirement in GCC.
6. **National platforms coexist** — EduTrack complements (integrates with) government systems rather than replacing them.

### 5.5 Buyer Personas (Commercial)

| Buyer | Title | Cares About |
|-------|-------|-------------|
| **Economic buyer** | Owner, Board member, CFO | ROI, fee collection, audit risk |
| **Technical buyer** | IT Director, CIO | Security, integration, uptime, data residency |
| **Champion** | Principal, Academic Director | Teacher adoption, inspection readiness, parent satisfaction |
| **Influencer** | Registrar, Admissions Head | Enrollment pipeline, data accuracy |
| **Blocker** | Legacy vendor, unions | Migration risk, change fatigue |

---

## 6. Competitor Analysis

### 6.1 Competitive Landscape Overview

| Tier | Competitors | Strengths | Weaknesses |
|------|-------------|-----------|------------|
| **Global enterprise SIS** | PowerSchool, Blackbaud, Veracross | Brand, depth, mature sales | High TCO, US-centric, weak Arabic, long implementation |
| **Regional school ERP** | Trasealla, Skolera, Skoolia, Classera | MENA focus, bilingual, local payments | Variable enterprise architecture; module depth uneven |
| **Teaching & learning** | Toddle, ManageBac | Curriculum planning, IB workflows | Not full school OS; limited finance/HR |
| **Point solutions** | FACTS (tuition), various LMS | Best-of-breed in niche | Integration tax, data silos |
| **Government / national** | Noor, Madrasati, MOEHE platforms | Mandated, scale | Not commercial SaaS for private ops |

### 6.2 Detailed Competitor Profiles

#### Trasealla
- **Positioning:** AI-powered school ERP; 500+ schools claim; 15+ languages
- **Pricing signal:** ~$2.50–$4/student/month (Growth tier); regional currency
- **Strengths:** Fast go-live (14–21 days claim), AWS Bahrain hosting, inspection templates (KHDA/ADEK), WhatsApp API
- **Weaknesses:** Brand recognition vs global players; enterprise procurement depth unproven at scale
- **EduTrack response:** Match speed-to-value; exceed on unified data model, university support, and AI governance

#### Skolera
- **Positioning:** LMS + school management; strong Saudi presence
- **Strengths:** Curriculum content, regional sales, MOE alignment narrative
- **Weaknesses:** ERP depth (payroll, transport, asset) less prominent
- **EduTrack response:** Win on operational completeness and enterprise SLAs

#### Skoolia
- **Positioning:** AI-powered school ERP; MENA expertise
- **Strengths:** Arabic RTL, regional currencies, modular ERP story
- **Weaknesses:** Newer brand; fewer public case studies
- **EduTrack response:** Differentiate on inspection-grade audit, school-group multi-campus, and open API ecosystem

#### Toddle
- **Positioning:** Teaching & learning OS for IB and progressive schools
- **Strengths:** Curriculum planning, assessment, educator UX, AI for teachers
- **Weaknesses:** Not a full finance/HR/transport platform
- **EduTrack response:** Partner or integrate for TL depth; own the operational backbone

#### Veracross
- **Positioning:** Premium unified SIS for independent schools
- **Strengths:** One-record data model (industry gold standard), admissions-to-alumni
- **Weaknesses:** Quote-based pricing; limited MENA-native compliance
- **EduTrack response:** "Veracross-class architecture, MENA-native execution"

#### PowerSchool / Blackbaud
- **Positioning:** Enterprise suites for large districts / premium schools
- **Strengths:** Ecosystem, integrations, market dominance (US)
- **Weaknesses:** Acquired-product complexity; 12–18 month implementations; opaque pricing; poor Arabic
- **EduTrack response:** 60–90 day implementation target; transparent per-student pricing; bilingual-native

### 6.3 Feature Comparison Matrix (Summary)

| Capability | EduTrack (Target) | Trasealla | Skolera | Veracross | PowerSchool |
|------------|-------------------|-----------|---------|-----------|-------------|
| Full SIS | ✓ | ✓ | ✓ | ✓ | ✓ |
| Finance & accounting | ✓ | ✓ | Partial | ✓ | Add-on |
| HR & payroll | ✓ | Partial | Partial | Partial | Add-on |
| Transport / bus tracking | ✓ | Partial | — | — | — |
| Medical clinic | ✓ | Partial | — | ✓ | Add-on |
| Arabic RTL native | ✓ | ✓ | ✓ | — | — |
| GCC payment rails | ✓ | ✓ | Partial | — | — |
| AI risk prediction | ✓ | Partial | Partial | — | Partial |
| API-first / open ecosystem | ✓ | ✓ | Partial | ✓ | ✓ |
| Multi-campus school groups | ✓ | ✓ | Partial | ✓ | ✓ |
| University modules | ✓ | ✓ | — | Partial | ✓ |

### 6.4 Competitive Strategy

| Strategy | Action |
|----------|--------|
| **Flank** | Enter with bilingual UX + GCC compliance where US players are weak |
| **Differentiate** | Full OS breadth with single-record architecture |
| **Focus** | Premium private + international schools first (higher ACV, faster cycles) |
| **Partner** | Integrate Toddle/ManageBac/Google Classroom rather than rebuild curriculum tools on day one |
| **Avoid** | Competing as national government portal; competing on lowest price |

---

## 7. SWOT Analysis

### Strengths (Internal — to build)

- Greenfield architecture — no legacy debt
- MENA-first product strategy from day one
- Modular monolith / microservices optionality
- Comprehensive module scope defined upfront
- Document-first discipline reduces rework

### Weaknesses (Internal — to mitigate)

- No brand recognition at launch
- Long sales cycles for enterprise schools
- Broad scope risks MVP dilution without strict phasing
- Requires significant initial investment before revenue

### Opportunities (External)

- GCC private school expansion and school-group consolidation
- Inspection-driven digitization (KHDA, ADEK, MOEHE)
- Parent willingness to pay (indirectly via school fees) for premium digital experience
- AI features as upsell and renewal driver
- Morocco Francophone expansion (French module)
- White-label / reseller channel with education consultancies

### Threats (External)

- National platforms expanding into private school mandates
- Established regional vendors with installed base
- Price undercutting by low-cost SIS ($1–2/student/month)
- Data residency regulations tightening
- Cybersecurity incidents in EdTech eroding trust
- Long procurement and RFP complexity in school groups

### SWOT Strategy Matrix

| | **Opportunities** | **Threats** |
|--|-------------------|-------------|
| **Strengths** | **SO:** Launch MENA-native unified OS for premium segment; AI upsell | **ST:** Security and compliance as moat; fast implementation |
| **Weaknesses** | **WO:** Partner for curriculum; focus MVP on highest-pain modules | **WT:** Strict phased roadmap; pilot references before broad marketing |

---

## 8. School Problems

### 8.1 Problem Hierarchy

Schools experience problems at four levels: **strategic**, **operational**, **experiential**, and **compliance**.

### 8.2 Strategic Problems

| ID | Problem | Impact | Current Workaround |
|----|---------|--------|-------------------|
| SP-01 | No single source of truth for student lifecycle | Wrong fees, wrong reports, parent distrust | Spreadsheets + manual reconciliation |
| SP-02 | Cannot scale operations across campuses | Inconsistent standards, duplicated cost | Per-campus tools |
| SP-03 | Board lacks real-time visibility | Late decisions, budget overruns | Monthly PDF reports |

### 8.3 Operational Problems

| ID | Problem | Stakeholder | Severity |
|----|---------|-------------|----------|
| OP-01 | Admissions pipeline disconnected from enrollment and billing | Registrar, Finance | Critical |
| OP-02 | Attendance not linked to parent notification and transport | Admin, Parents | High |
| OP-03 | Gradebook isolated from report cards and transcripts | Teachers, Academic admin | Critical |
| OP-04 | HR leave/payroll disconnected from staff records | HR, Finance | High |
| OP-05 | Fee invoicing manual; payment reconciliation takes days | Finance | Critical |
| OP-06 | Bus routes and student assignments managed in Excel | Transport coordinator | High |
| OP-07 | Clinic visits on paper; no allergy/alert propagation | Nurse, Teachers | Medium |
| OP-08 | Library and inventory untracked | Admin | Medium |
| OP-09 | Discipline incidents not correlated with academic risk | Counselors | Medium |
| OP-10 | Document storage across email, USB, shared drives | All staff | High |

### 8.4 Experiential Problems

| ID | Problem | User | Emotional Driver |
|----|---------|------|------------------|
| EP-01 | Parents receive information too late or in wrong language | Parents | Anxiety, distrust |
| EP-02 | Teachers spend >30% time on admin vs teaching | Teachers | Burnout |
| EP-03 | Students cannot see clear progress path | Students | Disengagement |
| EP-04 | Principals cannot identify at-risk students early | Leadership | Reputation risk |

### 8.5 Compliance Problems

| ID | Problem | Regulation / Standard |
|----|---------|----------------------|
| CP-01 | Cannot produce inspection-ready reports on demand | KHDA, ADEK, MOEHE |
| CP-02 | No audit trail for grade changes and fee adjustments | Internal governance |
| CP-03 | Child data shared without consent tracking | PDPL, GDPR |
| CP-04 | Cross-border data transfer undocumented | GDPR, local PDPL |

### 8.6 Problem → Module Mapping (Preview)

*Full mapping in Master Product Specification (Phase 2).*

| Problem Cluster | Primary EduTrack Modules |
|-----------------|--------------------------|
| Student lifecycle | Admissions, Enrollment, Academic Records, Certificates |
| Daily academics | Attendance, Gradebook, Homework, Examinations, Scheduling |
| Financial | Finance, Accounting, Fee management |
| People operations | HR, Payroll, Staff Management |
| Safety & logistics | Transport, Bus Tracking, Medical Clinic |
| Engagement | Parent Portal, Messaging, Notifications, Calendar |
| Insight | Analytics, AI Prediction, Risk Detection |

---

## 9. Opportunities

### 9.1 Product Opportunities

| ID | Opportunity | Revenue Impact | Effort |
|----|-------------|----------------|--------|
| O-01 | Unified admissions-to-cash flow | High — reduces churn, increases ACV | Medium |
| O-02 | Parent mobile app as viral loop | High — NPS driver | Medium |
| O-03 | AI at-risk student detection | High — premium tier upsell | High |
| O-04 | School-group multi-campus dashboard | Very high — enterprise deals | Medium |
| O-05 | Marketplace for third-party integrations | Medium — platform revenue | High |
| O-06 | White-label for education groups | High — channel scale | Medium |

### 9.2 Go-to-Market Opportunities

| ID | Opportunity | Region |
|----|-------------|--------|
| G-01 | Qatar private school pilot program | Qatar |
| G-02 | UAE KHDA inspection-ready positioning | UAE |
| G-03 | Saudi private school digitization (Vision 2030) | KSA |
| G-04 | IB/British school network partnerships | GCC-wide |
| G-05 | Morocco Francophone international schools | Morocco |

### 9.3 Partnership Opportunities

- Payment gateways: QPay, Mada, SADAD, Stripe (international)
- Messaging: WhatsApp Business API, SMS aggregators
- Productivity: Google Workspace, Microsoft 365
- Curriculum: Toddle, ManageBac (integrate, not compete)
- Accounting: Xero, QuickBooks, SAP Business One
- Identity: National SSO where available (future)

---

## 10. User Personas

### Persona 1 — Sarah Mitchell, Academic Director (International School, Dubai)

| Attribute | Detail |
|-----------|--------|
| **Age** | 42 |
| **Languages** | English (primary), basic Arabic |
| **Tech comfort** | High |
| **Goals** | IB accreditation readiness, teacher efficiency, parent satisfaction scores |
| **Frustrations** | Data in ManageBac + SIMS + Excel; report cards take 2 weeks |
| **EduTrack value** | Unified academics, configurable report templates, inspection exports |
| **Buying role** | Champion |

### Persona 2 — Mohammed Al-Kuwari, School Owner (Private School, Qatar)

| Attribute | Detail |
|-----------|--------|
| **Age** | 55 |
| **Languages** | Arabic (primary), English |
| **Tech comfort** | Medium — delegates to IT |
| **Goals** | Fee collection rate >95%, MOEHE alignment, profitable growth |
| **Frustrations** | Cannot see real-time financial position; parent complaints about communication |
| **EduTrack value** | Finance dashboard, parent app, Arabic-first, PDPL compliance |
| **Buying role** | Economic buyer |

### Persona 3 — Fatima Hassan, Classroom Teacher (Grade 6, Riyadh)

| Attribute | Detail |
|-----------|--------|
| **Age** | 31 |
| **Languages** | Arabic |
| **Tech comfort** | Medium |
| **Goals** | Less admin, faster grading, clear parent communication |
| **Frustrations** | 4 different apps; duplicate data entry; LMS not in Arabic |
| **EduTrack value** | Single teacher portal, mobile grading, auto-notify parents |
| **Buying role** | End user (adoption critical) |

### Persona 4 — Layla Al-Mansouri, Parent (Two children, Doha)

| Attribute | Detail |
|-----------|--------|
| **Age** | 38 |
| **Languages** | Arabic preferred |
| **Tech comfort** | Medium-high (mobile) |
| **Goals** | Instant alerts, fee payment, message teachers, track progress |
| **Frustrations** | WhatsApp groups, paper circulars, no single app |
| **EduTrack value** | Parent app, push notifications, Arabic UI, payment in-app |
| **Buying role** | Influencer (pressure on school) |

### Persona 5 — James Okafor, IT Director (School Group, 4 campuses)

| Attribute | Detail |
|-----------|--------|
| **Age** | 45 |
| **Languages** | English |
| **Tech comfort** | Expert |
| **Goals** | SSO, API integrations, 99.9% uptime, data residency, audit logs |
| **Frustrations** | Per-campus silos; no central RBAC; security questionnaires take weeks |
| **EduTrack value** | Multi-tenant architecture, SOC 2 path, REST API, centralized admin |
| **Buying role** | Technical buyer |

### Persona 6 — Dr. Amina Benali, University Registrar (Private College, Morocco)

| Attribute | Detail |
|-----------|--------|
| **Age** | 48 |
| **Languages** | French, Arabic, English |
| **Tech comfort** | Medium |
| **Goals** | Enrollment, transcripts, credit tracking, ministry reporting |
| **Frustrations** | Legacy on-premise SIS; no parent/student portal |
| **EduTrack value** | Cloud SaaS, trilingual roadmap, modular SIS |
| **Buying role** | Champion + influencer |

### Persona 7 — Khalid Rahman, CFO (Large Private School, UAE)

| Attribute | Detail |
|-----------|--------|
| **Age** | 50 |
| **Tech comfort** | Medium |
| **Goals** | Automated invoicing, ZATCA/VAT compliance, payroll integration |
| **Frustrations** | Fee system not synced with accounting; manual journal entries |
| **EduTrack value** | Integrated finance module, audit trail, export to ERP |
| **Buying role** | Economic buyer |

---

## 11. User Journeys

### 11.1 Journey A — New Student Admission to First Day

**Actor:** Prospective parent, Admissions officer, Finance, Academic admin  
**Trigger:** Parent inquires about enrollment

| Stage | User Actions | Pain Today | EduTrack Future State | Touchpoints |
|-------|--------------|------------|----------------------|-------------|
| 1. Inquiry | Parent submits online form | PDF forms, email | Branded admissions portal (AR/EN) | Admissions, CMS |
| 2. Application | Upload documents, pay application fee | Manual fee tracking | Online payment + document checklist | Admissions, Finance |
| 3. Assessment | Schedule interview/entrance test | Phone coordination | Calendar integration + automated reminders | Admissions, Calendar |
| 4. Decision | Offer letter issued | Word templates | Automated offer + e-signature | Admissions |
| 5. Enrollment | Accept offer, pay deposit | Separate finance system | Single flow → student record created | Enrollment, Finance |
| 6. Onboarding | Class assignment, parent account | Delayed IT setup | Auto-provision portals; welcome pack | SIS, Parent Portal |
| 7. Day 1 | Attendance, bus route, clinic alerts | Paper forms | Profile complete; stakeholders notified | Attendance, Transport, Clinic |

**Success criteria:** Zero re-entry of student data after application; parent onboarded in <24 hours after acceptance.

---

### 11.2 Journey B — Teacher Daily Workflow

**Actor:** Classroom teacher  
**Trigger:** Start of school day

| Stage | Actions | EduTrack Support |
|-------|---------|------------------|
| Morning | Review schedule, student alerts (allergies, behavior notes) | Teacher Portal dashboard |
| Period 1 | Take attendance | One-tap attendance; syncs transport + parents |
| During day | Post homework, grade submissions | Gradebook + Homework module |
| Afternoon | Message parent about concern | Messaging with audit trail |
| End of day | Review AI flag: 2 students at academic risk | Learning Analytics |

**Success criteria:** Core tasks in <15 minutes admin time per day.

---

### 11.3 Journey C — Parent Fee Payment

**Actor:** Parent, Finance officer  
**Trigger:** Term invoice issued

| Stage | Actions | EduTrack Support |
|-------|---------|------------------|
| Notify | Parent receives push + email | Notifications (AR/EN) |
| View | See itemized invoice, payment history | Parent Portal + Finance |
| Pay | Pay via QPay/Mada/card | Local payment integration |
| Reconcile | Payment auto-matched to ledger | Accounting module |
| Receipt | Instant digital receipt | Document management |

**Success criteria:** >80% digital payment within 7 days of invoice.

---

### 11.4 Journey D — Principal Inspection Readiness (KHDA/ADEK)

**Actor:** Principal, Academic admin  
**Trigger:** Inspection announced

| Stage | Actions | EduTrack Support |
|-------|---------|------------------|
| Prepare | Pull attendance, staffing, curriculum coverage | Analytics + Reports |
| Validate | Audit trail for incidents, grades | Audit Logs |
| Export | Generate inspection-formatted reports | Compliance templates |
| Present | Dashboard for inspector walkthrough | Principal Dashboard |

**Success criteria:** Report pack generated in <2 hours, not 2 weeks.

---

### 11.5 Journey E — School Group IT Provisioning

**Actor:** IT Director  
**Trigger:** New campus added

| Stage | Actions | EduTrack Support |
|-------|---------|------------------|
| Provision | Create tenant campus under group | Multi-tenant admin |
| Configure | Clone RBAC, academic year, fee structure | Settings + Role Management |
| Migrate | Import student/staff CSV | Data migration tooling |
| Integrate | Connect SSO, payment gateway | API + Integrations |
| Monitor | Central SLA dashboard | Analytics + audit |

**Success criteria:** New campus live in <30 days.

---

## 12. Business Goals

### 12.1 Year 1 (Foundation)

| Goal | Target | Rationale |
|------|--------|-----------|
| Launch MVP (Core + Academics + Parent) | Q4 Y1 | Revenue requires sellable product |
| Signed paying schools | 15 | Reference customers for GCC sales |
| ARR | $500K – $750K | Validates pricing model |
| Pilot NPS (school admins) | ≥40 | Product-market fit signal |
| Implementation time | ≤60 days average | Competitive vs enterprise SIS |

### 12.2 Year 2 (Growth)

| Goal | Target |
|------|--------|
| Paying schools | 60 |
| ARR | $2.5M – $3.5M |
| School group deals | 3 multi-campus contracts |
| Module attach rate (Finance) | ≥50% of customers |
| Gross retention | ≥90% |

### 12.3 Year 3 (Scale)

| Goal | Target |
|------|--------|
| Paying schools | 150+ |
| ARR | $8M – $12M |
| Geographic presence | 6+ countries |
| Partner channel | 20% of new ARR |
| SOC 2 Type II | Certified |

### 12.4 Strategic Business Goals (3–5 Years)

1. **Category leadership** in MENA premium school OS segment
2. **Platform ecosystem** with 50+ certified integrations
3. **Net revenue retention** ≥110% via module expansion
4. **University vertical** contributing ≥15% ARR
5. **Operational excellence:** gross margin ≥75% at scale

---

## 13. KPIs & Success Metrics

### 13.1 North Star Metric

**Weekly Active School Stakeholders (WASS)** — count of unique teachers, parents, and staff performing meaningful actions per week across all tenants.

*Reasoning:* ARR measures sales; WASS measures whether the product is embedded in daily school life.

### 13.2 Product KPIs

| Category | KPI | Y1 Target | Measurement |
|----------|-----|-----------|-------------|
| Adoption | Teacher WAU / total teachers | ≥70% | Product analytics |
| Adoption | Parent app activation | ≥55% of families | Registration funnel |
| Engagement | Avg sessions/parent/week | ≥2 | Analytics |
| Quality | P0 bug escape rate | <2 per release | QA metrics |
| Performance | P95 page load (portal) | <2s | APM |
| Reliability | Uptime | 99.9% | Status page |
| Support | Time to first response | <4 business hours | Ticketing |
| Implementation | Go-live on schedule | ≥85% | PS tracker |

### 13.3 Commercial KPIs

| KPI | Y1 Target |
|-----|-----------|
| ACV (median) | $35,000 |
| Sales cycle (median) | ≤90 days |
| CAC payback | ≤18 months |
| Logo churn | <10% annual |
| Expansion revenue | ≥15% of ARR |
| Demo-to-close rate | ≥20% |

### 13.4 Customer Success KPIs

| KPI | Target |
|-----|--------|
| Onboarding CSAT | ≥4.5/5 |
| Time to value (first parent login) | ≤14 days post go-live |
| Support ticket volume per school/month | Decreasing trend after M3 |
| Renewal rate | ≥90% |

### 13.5 Compliance & Security KPIs

| KPI | Target |
|-----|--------|
| Security incidents (P1) | 0 |
| PDPL/GDPR data subject requests fulfilled on time | 100% |
| Penetration test critical findings open | 0 at release |
| Audit log coverage for sensitive actions | 100% |

### 13.6 Success Metrics by Persona

| Persona | Success Metric |
|---------|----------------|
| Teacher | Admin time reduced ≥25% vs baseline |
| Parent | ≥80% satisfaction with communication timeliness |
| Principal | Inspection report prep time reduced ≥70% |
| CFO | Fee collection days reduced ≥30% |
| IT Director | Security assessment passed without blockers |

---

## 14. Revenue Model

### 14.1 Model Type

**B2B SaaS — Annual Subscription (primary)** with optional multi-year prepay discount.

### 14.2 Revenue Streams

| Stream | Description | % of Revenue (Y3 target) |
|--------|-------------|--------------------------|
| **Core subscription** | Per-student annual license by tier | 75% |
| **Module add-ons** | Finance Pro, AI Suite, Transport, Multi-campus | 15% |
| **Implementation services** | Data migration, training, custom integration | 7% |
| **Premium support** | Dedicated CSM, 24/7, custom SLA | 3% |

### 14.3 Billing Mechanics

- **Unit of measure:** Active enrolled students per academic year (snapshot billing quarterly true-up)
- **Contract term:** Annual minimum; 3-year preferred for enterprise
- **Currency:** USD base; local invoicing (QAR, AED, SAR, MAD) where required
- **Payment terms:** Net 30; upfront annual common for schools
- **Tenant billing:** School group receives consolidated invoice with campus breakdown

### 14.4 Unit Economics (Planning Model)

| Metric | Target (at scale) |
|--------|-------------------|
| Gross margin | 75–82% |
| LTV:CAC | ≥3:1 |
| CAC (blended) | $8,000 – $15,000 per school |
| LTV (5-year) | $120,000 – $400,000 depending on segment |

*Reasoning:* Per-student SaaS aligns vendor success with enrollment growth; schools prefer predictable annual budgets over perpetual licenses.

### 14.5 Expansion Revenue Drivers

1. Start Core → add Finance + HR
2. Add AI Analytics Suite
3. Add multi-campus group license
4. Increase student count year over year
5. Upsell premium support for school groups

---

## 15. Pricing Strategy

### 15.1 Pricing Philosophy

1. **Transparent** — Published tiers; no hidden "contact sales" for standard K-12
2. **Value-based** — Price against operational savings, not competitor race-to-bottom
3. **Modular** — Pay for depth needed; land affordable, expand with modules
4. **Regional fairness** — PPP-adjusted list for Morocco vs UAE where appropriate

### 15.2 Pricing Model

**Per student / per year**, tiered by module bundle, with minimum annual contract per school.

### 15.3 Proposed Tier Structure

| Tier | Target Segment | Modules Included | List Price (USD/student/year) | Min Annual |
|------|----------------|------------------|-------------------------------|------------|
| **Essentials** | Small schools, first land | SIS Core, Attendance, Gradebook, Parent Portal, Messaging | $28 | $12,000 |
| **Professional** | Mid-size private / international | Essentials + Admissions, Exams, Scheduling, Analytics, CMS | $48 | $25,000 |
| **Enterprise** | Large schools, groups | Professional + Finance, HR, Payroll, Transport, Clinic, Library, AI Basic | $72 | $60,000 |
| **Ultimate** | Universities, large groups | All modules + AI Advanced, multi-campus, custom SLA, API priority | $95+ | Custom |

*Competitive anchor: Trasealla ~$30–48/student/year; EduTrack Professional priced at parity with superior ERP depth on Enterprise.*

### 15.4 Add-On Pricing

| Add-On | Price |
|--------|-------|
| AI Academic Prediction Suite | +$8/student/year |
| Advanced Bus GPS Tracking | +$4/student/year |
| Extra campus (same group) | +15% platform fee |
| Implementation package | $5,000 – $50,000 (one-time) |
| Premium support (24/7) | +12% subscription |

### 15.5 Discount Policy

| Discount | Max | Approval |
|----------|-----|----------|
| Annual prepay | 8% | Sales manager |
| 3-year commit | 15% | VP Sales |
| Non-profit / education foundation | 20% | Executive |
| Pilot program (Year 1 only) | 50% Y1 | Product + Executive |

### 15.6 Pricing Guardrails

- Never discount below **$22/student/year** (protects brand and margin)
- Module attach encouraged over base discounting
- Free trial: 30-day sandbox for qualified schools, not freemium for production students

### 15.7 Pricing Validation Plan

1. Van Westendorp price sensitivity with 20 school leaders (Qatar + UAE)
2. Competitive quote collection (3 RFPs)
3. Pilot conversion rate at Professional tier
4. Review ACV vs CAC at Month 9

---

## 16. Assumptions & Constraints

### 16.1 Assumptions

- Private and international schools have budget authority for SaaS ($15K+ ACV)
- Schools will migrate from Excel/legacy if implementation ≤60 days
- Arabic RTL is mandatory for GCC deal closure
- Parents will adopt mobile app if school mandates communication through it
- AI features accelerate sales but are not required for MVP

### 16.2 Constraints

- **No implementation before G1 + G2 approvals**
- **Data residency:** Must support GCC-region hosting at GA
- **Child data:** Strict consent and parental access controls
- **Scope:** MVP cannot include all 40+ modules — phasing required (defined in Phase 2)
- **Team:** Initial team size limits parallel module development

### 16.3 Dependencies

- Legal review of PDPL/GDPR posture before sales in EU-connected schools
- Payment gateway partnerships before Finance module GA
- Design partner schools (3–5) for discovery validation

---

## 17. Open Questions & Phase 2 Dependencies

| ID | Question | Owner | Required Before |
|----|----------|-------|-----------------|
| Q-01 | MVP module cut line: which 12 modules for v1.0? | Product | Phase 2 PRD |
| Q-02 | Qatar vs UAE as launch geography first? | GTM | Phase 2 |
| Q-03 | Build vs partner for curriculum (IB) tools? | Product | Phase 2 integrations |
| Q-04 | University scope in v1 or v1.5? | Executive | Phase 2 roadmap |
| Q-05 | Self-serve provisioning vs white-glove only? | Product + Eng | Phase 2 |
| Q-06 | French module priority for Morocco launch? | GTM | Phase 2 i18n |
| Q-07 | SOC 2 timing: Year 1 or Year 2? | Security | Phase 2 NFR |

---

## 18. Appendices

### Appendix A — Glossary

| Term | Definition |
|------|------------|
| SIS | Student Information System |
| ERP | Enterprise Resource Planning |
| ACV | Annual Contract Value |
| ARR | Annual Recurring Revenue |
| PDPL | Personal Data Privacy Law (GCC jurisdictions) |
| RBAC | Role-Based Access Control |
| WASS | Weekly Active School Stakeholders (North Star) |

### Appendix B — Research Sources

- Qatar education budget and sector growth reports (2025–2026)
- MOEHE / MCIT national digital learning initiatives
- Competitor public pricing and positioning (Trasealla, Skolera, Skoolia, Veracross, PowerSchool)
- Education Middle East — Qatar school digital transformation analysis
- Internal stakeholder interview plan (to be executed pre-G1)

### Appendix C — Discovery Interview Guide (Summary)

**Target:** 15 interviews — 5 principals, 3 CFOs, 3 IT directors, 4 parents  
**Key questions:**
1. Walk me through your last admissions cycle — where did data get re-entered?
2. What systems do you pay for today? What's missing?
3. What would make you switch SIS in the next 24 months?
4. How do you evaluate data privacy and hosting location?
5. What does your ideal parent communication look like?

### Appendix D — Phase Gate Checklist

- [ ] Executive summary reviewed
- [ ] Positioning validated with 3+ external school leaders
- [ ] Pricing model reviewed by finance
- [ ] Legal/compliance initial review of data model scope
- [ ] Competitive matrix agreed by sales
- [ ] Personas validated by UX research
- [ ] Approval signatures recorded in Document Control table

---

## Next Step

Upon **G1 approval** of this document, proceed to **Phase 2: Master Product Specification** (`docs/MASTER_PRODUCT_SPECIFICATION.md`).

**Do not begin Phase 2 until explicit stakeholder approval is recorded.**

---

*End of Document — EDU-DISC-001 v1.0.0*
