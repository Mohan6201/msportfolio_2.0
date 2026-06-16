# MS Portfolio 2.0 — Master Blueprint & Build Documentation

> **Status:** Planning / Architecture Reference
> **Purpose:** Single source-of-truth document describing the vision, architecture, domains, and build sequence for MS_PORTFOLIO_2.0. This document is intended to be used as a reference by both the developer and Claude (chat or Claude Code terminal) during implementation.

---

## 1. Project Vision

MS_PORTFOLIO_2.0 is not a traditional static portfolio website. It is a **configuration-driven, domain-driven personal platform** — a single ecosystem that combines a professional portfolio, resume intelligence, job matching, career advisory, interview preparation, analytics, DevOps tooling, and an AI assistant, all built on top of one centralized profile dataset.

The end goal is for recruiters and visitors to experience this not as "a portfolio with some extra pages," but as a demonstration of the ability to **design, build, automate, deploy, monitor, and evolve a complete software platform end to end** — directly aligned with a DevOps / cloud engineering background.

---

## 2. Core Architectural Principle

### The Problem With Typical Portfolios

Most portfolios are built like this:

```
Home Page
 ├── Hardcoded Experience
 ├── Hardcoded Skills
 ├── Hardcoded Resume
 └── Hardcoded Company

Resume Page
 ├── Same Experience Again
 ├── Same Skills Again
 └── Same Company Again

About Page
 └── Same Information Again
```

Every update means editing the same data in multiple places. After a year or two, this becomes unmaintainable.

### The Solution: Profile Core Engine

Instead of updating 20 pages, you update **1 profile record**. Every domain (resume, jobs, career, analytics, etc.) consumes data from this single source of truth.

```
                ┌───────────────────────────┐
                │   Admin Control Center     │
                └──────────────┬──────────────┘
                               ▼
                ┌───────────────────────────┐
                │    Profile Core Engine      │
                └──────────────┬──────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
        Resume Engine     Jobs Engine      Analytics Engine
            │                  │                  │
            └──────────────────┼──────────────────┘
                               ▼
                ┌───────────────────────────┐
                │     AI Services Layer       │
                └──────────────┬──────────────┘
                               ▼
                ┌───────────────────────────┐
                │      Public Portfolio       │
                └───────────────────────────┘
```

**Golden Rule:** Every future feature must plug into the Profile Core Engine. No feature is allowed to create its own disconnected data source.

### Two-Tier Platform Model

As the platform grew beyond "portfolio," a second tier emerged alongside the Profile Core — this is now a foundational part of the architecture, not just an extra feature:

**Tier 1 — Public Portfolio.** The Profile Core Engine and everything built on top of it in Phases 1–3 (Sections 5–6.1) — a single, public-facing profile (yours), visible to anonymous visitors with no login.

**Tier 2 — Account Centre.** A login-protected, multi-tenant layer (§6.7) housing the Resume, Job, Career, and Interview domains (§§6.2–6.5). Every record here is scoped to a logged-in user rather than the single public profile — even though you, the owner, are that platform's first user, using a separate account from your admin login.

The Golden Rule still holds across both tiers: Tier 2 plugs into the same shared services (AI Gateway, Analytics) and never creates its own disconnected silo — it simply owns *per-user* data instead of the single public profile record. Full sequencing for both tiers lives in the companion `MS_PORTFOLIO_2.0_IMPLEMENTATION_PLAN.md`, §3.1.

---

## 3. Centralized Profile Data Model

The Profile Core is the canonical record that everything else reads from:

```json
{
  "full_name": "Mohan",
  "career_start_date": "2022-01-01",
  "current_company": "XYZ",
  "designation": "DevOps Engineer",
  "experience": "AUTO_CALCULATED",
  "skills": [],
  "certifications": [],
  "projects": [],
  "social_links": {}
}
```

Key principle: values like `experience` are **derived/calculated**, not manually maintained.

---

## 4. Domain-Based Source Code Structure

The platform is organized by **domain**, not by page or feature type. Each domain owns its own UI, API, database logic, services, validation, and types.

```
src/
├── domains/
│   ├── profile/        # Tier 1 — Profile Core Engine
│   ├── accounts/        # Tier 2 — Account Centre foundation (§6.7)
│   ├── resume/           # Tier 2 — per-user
│   ├── jobs/             # Tier 2 — per-user
│   ├── interview/        # Tier 2 — per-user
│   ├── career/           # Tier 2 — per-user
│   ├── knowledge/
│   ├── devops-toolkit/
│   ├── analytics/
│   ├── blog/
│   └── admin/
│
├── shared/
│
└── ai/
```

---

## 5. Core Build Sequence (Foundational Phases)

The platform must **not** be built randomly. The recommended order is:

### Phase 1 — Foundation: Profile Core Engine
This is the backbone. Build:
- `profile` table
- Experience calculator (auto-calculates years of experience from `career_start_date`)
- Company manager
- Skills manager
- Certification manager

### Phase 2 — Professional Dashboard
All pages below must be fully **dynamic**, driven by the Profile Core — no hardcoded content:
- Home
- About
- Projects
- Experience
- Skills
- Resume
- Contact

### Phase 3 — Admin Control Center
Critical for long-term maintainability. Instead of opening a database, running SQL, or editing JSON files manually, the owner logs in and updates everything from a UI:
- Current Company
- Designation
- Projects
- Certifications
- Skills
- Resume Templates
- Blogs

---

## 6. Domain Specifications

### 6.1 Profile Domain
The canonical data source described in Section 3. Owns the core profile record, experience auto-calculation, company/skills/certification management.

### 6.2 Resume Domain — "Resume Studio"
**Tier 2 (Account Centre, §6.7) — every resume belongs to a logged-in user.** The most powerful feature of the platform.

**Core workflow:**
1. Upload Resume
2. Extract Data
3. Store Structured Data
4. Generate Resume
5. Export Resume

**Resume Templates** — minimum 7 templates (Template 1 through Template 7), all driven by the same structured profile data.

**Resume Versioning** — Git-like version control for resumes:
- Version 1, 2, 3, 4...
- Compare changes between versions
- Restore older versions

**Resume AI** — AI-powered resume intelligence:
- Resume Analysis
- ATS (Applicant Tracking System) Analysis / ATS Scanner
- JD (Job Description) Matching
- Resume Tailoring
- Cover Letter Generation

### 6.3 Job Domain
**Tier 2 (Account Centre, §6.7).** Kept strictly **separate** from the Resume Domain — never mixed.

**Job Collection** is automated: a scheduled workflow pulls real postings from third-party job aggregator APIs (Adzuna primary, JSearch secondary — see Implementation Plan §2.7) into a shared catalog:
- Jobs
- Companies
- Job requirements

Each user's **Job Preferences** (target roles, locations, salary range, remote/onsite, employment type — set up in the Account Centre, §6.7) drive what gets ingested and surfaced for them.

**Job Matching** compares each user's Resume + Preferences against catalog Jobs to generate a **Match Score** and skill gaps, per user.

**Application Tracking** — each match carries a status (`suggested → saved → applied → interviewing → rejected/offer`), giving the user a simple board to track where things stand. This is the "Job Search" feature in practice: log in, see freshly-matched openings, track applications.

### 6.4 Career Domain — "Career Advisor"
**Tier 2 (Account Centre, §6.7).** This is the platform's key differentiator. It consumes a logged-in user's Resume, Job Matches, and Interview history to generate:
- Career recommendations
- Skill gap analysis
- Career roadmap

### 6.5 Interview Domain
**Tier 2 (Account Centre, §6.7), per user** — kept separate from both the Job Domain and the Resume Domain. Contains:
- Question bank (shared across users)
- Mock interviews (per user)
- Feedback
- Performance reports

### 6.6 Analytics Domain
Tracks platform-wide usage and performance across three categories:

**Portfolio Metrics**
- Visitors
- Resume downloads
- Project views
- Blog views

**Resume Metrics**
- ATS scores
- Templates used
- Downloads

**AI Metrics**
- Resume analyses performed
- JD matches run
- Cover letters generated

### 6.7 Account Centre Domain (Tier 2 Foundation)
The foundation everything in §§6.2–6.5 plugs into. A login-protected (Better Auth), multi-tenant layer:
- **User accounts** — separate from the owner's admin login; you sign up here as the platform's first user
- **Job Preferences** — target roles, locations, salary range, remote/hybrid/onsite, employment type; drives Job Domain ingestion and matching
- **Account dashboard** — entry point to Resume Studio, Job Search, Career Advisor, and Interview Lab

Designed multi-tenant from the start (role field: `owner | user | recruiter`), so additional users — or the future Recruiter Dashboard (§11.9) — can be added without re-architecting auth.

---

## 7. AI Layer Architecture — "AI Gateway"

**Common mistake:** building separate AI implementations for Resume AI, Job AI, Career AI, and Interview AI independently.

**Correct approach:** a single shared AI Gateway that every domain calls into.

```
ai/
├── prompts/
├── providers/
├── agents/
├── workflows/
└── tools/
```

**Benefits of a unified AI Gateway:**
- Lower cost (shared provider config, batching, caching)
- Easier maintenance
- Easier prompt updates across all domains
- Easier model switching (swap providers without touching domain code)

---

## 8. Database Structure

Rather than 100+ loosely related tables, organize the schema by **domain groups**:

- `profile_domain`
- `accounts_domain`
- `resume_domain`
- `job_domain`
- `career_domain`
- `interview_domain`
- `analytics_domain`
- `content_domain`

This scales far better than a flat, ungrouped table structure as the platform grows.

---

## 9. Admin Control Center (Internal CMS)

The Admin Control Center is the operational heart of the platform — a single dashboard from which everything below is managed:

- Profile
- Experience
- Company
- Projects
- Skills
- Certifications
- Blogs
- Resume Templates
- Users
- Analytics

---

## 10. Future-Proofing via Settings

Never hardcode values that change over time. Store them as configurable settings, e.g.:

- `career_start_date`
- `current_company`
- `current_designation`
- `linkedin_url`
- `github_url`
- `resume_url`

---

## 11. Extended Platform Modules (Phase 4+ Roadmap)

These modules extend the platform from "portfolio" into a full personal platform ecosystem. Each one **reuses** the existing Profile, Resume, Job, AI, and Analytics data rather than introducing new disconnected data sources.

### 11.1 Professional Digital Identity Hub
A unified identity hub instead of scattered links across Portfolio / Resume / LinkedIn / GitHub:
- Public Profile URL
- Public Resume URL
- Public Project Portfolio URL
- Public Skill Matrix URL
- Public Certification URL

Example structure: `mohan.dev/profile`, `/resume`, `/projects`, `/certifications`, `/skills` — recruiters get everything from one place.

### 11.2 Personal Knowledge Base ("Second Brain")
A searchable repository of personal technical notes:
- AWS notes
- Linux notes
- Docker notes
- DevOps notes
- Interview notes
- Troubleshooting notes

With AI search — e.g., a visitor (or the owner) can ask *"How did Mohan configure Nginx reverse proxy?"* and the AI searches the knowledge base for the answer.

### 11.3 DevOps Toolkit (Signature Feature)
A standout feature for a DevOps-focused platform:
- **Nginx Config Generator** — reverse proxy, SSL, load balancing, caching configs
- **Docker Compose Generator** — input a stack (e.g. Django + React + PostgreSQL + Redis), output a working `docker-compose.yml`
- **GitHub Actions Generator** — generate CI/CD workflows
- **EC2 Cost Calculator** — monthly / annual / projected cost estimates
- **AWS Architecture Generator** — input requirements (e.g. "Django app, 5000 users, high availability"), output an architecture recommendation

### 11.4 Project Blueprint Marketplace
Reusable deployment blueprints, each containing architecture, diagrams, source code, and a deployment guide:
- Django Deployment Blueprint
- React Deployment Blueprint
- Superset Deployment Blueprint
- WordPress Deployment Blueprint
- CI/CD Blueprint

### 11.5 Architecture Showcase Center
Interactive, clickable architecture diagrams for:
- AWS Architecture
- CI/CD Architecture
- Monitoring Architecture
- Microservice Architecture

### 11.6 Infrastructure Playground
A unique interactive DevOps feature: the user selects components (EC2, Load Balancer, RDS, Auto Scaling), and the system generates:
- An architecture diagram
- A Terraform project structure
- An estimated cost

### 11.7 AI Project Evaluator
Users upload a resume, GitHub repo, and/or portfolio link. The AI evaluates:
- Strengths
- Weaknesses
- Market value
- Improvement suggestions

### 11.8 Career Progress Dashboard
Visualizes growth over time using the centralized profile data:
- Experience growth
- Skills growth
- Certifications earned
- Projects completed
- Job applications
- Interviews completed

### 11.9 Recruiter Dashboard
**Tier 2, `recruiter` role (§6.7).** A recruiter-facing portal showing Resume, Skills, Projects, Certifications, Availability, and Contact info — with a **"Download Package"** option that bundles Resume + Project Portfolio + Certifications + Experience Summary into one package. Uses the same Account Centre login/role system as everything else in Tier 2, just with a different role and a narrower view.

### 11.10 Personal AI Assistant (Flagship Feature)
An AI trained on the owner's own projects, blogs, resume, skills, and documentation. Visitors can ask things like:
- *"Tell me about Mohan's AWS experience."*
- *"How many years of Docker experience does he have?"*
- *"What projects use CI/CD?"*
- *"Show monitoring projects."*

The AI answers using the actual portfolio data — turning the portfolio itself into an interactive experience.

### 11.11 DevOps Interview Lab
Aligned directly with a DevOps background:
- AWS, Docker, Linux, Terraform, and CI/CD MCQ banks
- AI-driven mock interviews
- Voice interviews
- Performance reports

### 11.12 Live Project Monitoring Demo
Demo dashboards (using sample data if needed) showing CPU, Memory, Disk, Nginx status, Application Health, and API Health — demonstrating operational maturity to visitors.

### 11.13 Open Source Contributions Hub
Automatically tracks and displays GitHub activity, contributions, repositories, stars, and forks.

### 11.14 Service Showcase
For future freelancing/consulting (AWS Migration, CI/CD Setup, Dockerization, Linux Administration, Cloud Architecture), each with a process description, deliverables, and a contact form.

### 11.15 Achievement Engine
Automatically (no manual updates) calculates and displays:
- Years of experience
- Projects delivered
- Deployments completed
- Certifications earned
- Blogs written
- Resumes generated
- Interview questions solved

---

## 12. Final Recommended Module Tree

```
MS_PORTFOLIO_2.0
│
├── Profile Core Engine          [Tier 1 — Public Portfolio]
├── Admin Control Center         [Tier 1]
├── Professional Dashboard       [Tier 1]
│
├── Account Centre               [Tier 2 — login required]
│   ├── Resume Builder Studio
│   ├── ATS Scanner
│   ├── Resume Intelligence
│   │
│   ├── Job Search (Automated)
│   ├── Job Match Engine
│   ├── Skill Gap Analyzer
│   ├── Career Advisor
│   │
│   ├── Interview Preparation Engine
│   └── Learning Recommendation Engine
│
├── DevOps Toolkit
├── Infrastructure Playground
├── Architecture Showcase
│
├── Personal Knowledge Base
├── AI Portfolio Assistant
│
├── Blog & Knowledge Hub
├── Recruiter Dashboard          [Tier 2 — recruiter role]
│
└── Analytics Platform
```

---

## 13. Current Implementation Status (Audited from Codebase)

> _Source: `github.com/Mohan6201/msportfolio_2.0`, branch `main`, audited directly from repo contents. This section is the living "ground truth" — update it as the project progresses so this document stays in sync with reality across both the chat and terminal workflows._

### 13.1 Confirmed Tech Stack

- **Framework:** Next.js 15 (App Router), React 18, TypeScript
- **Styling/UI:** Tailwind CSS v4, shadcn/ui, `@base-ui/react`, Framer Motion
- **State:** Zustand (currently minimal — just a navbar menu store)
- **Database:** LibSQL / Turso (SQLite-compatible) via `@libsql/client` — local file `portfolio.db`, production via Turso
- **AI:** Google Gemini 2.0 Flash via `@google/generative-ai`
- **Blog:** MDX content (`content/blog/*.mdx`) parsed with `gray-matter` + `remark`/`rehype`
- **Email:** EmailJS (contact form)
- **Analytics:** Vercel Analytics + Speed Insights
- **Hosting:** Vercel (primary — `vercel.json`), legacy Firebase config also present but appears superseded

### 13.2 Current Architecture (Pre-Blueprint State)

The current structure is **page-section based**, not domain-based:

```
src/
├── app/                  (Next.js routes: /, /admin, /blog, /api/*)
├── components/           (one folder per page section, e.g. heroSection, skillsSection...)
├── data/portfolio.config.ts   (single hardcoded file: skills, experience, certs, projects, social links)
├── db/                   (client.ts + queries.ts — flat tables, not domain-grouped)
├── lib/, providers/, state/, assets/
```

This is exactly the "Problem With Typical Portfolios" pattern described in Section 2 — one large config file feeding multiple sections, and a duplicate copy of the same profile info hardcoded again inside the AI chatbot's system prompt (`src/app/api/chat/route.ts`).

### 13.3 Feature Audit — What's Built vs. What's Roadmap

**Built (Foundational Pages — maps to Blueprint Phase 2, but data is hardcoded not dynamic)**
- Navbar, Hero, About Me, Skills (with category filter + progress bars), Experience timeline, Projects grid, Certificates grid, Resume (PDF preview via iframe/PiP viewer), Contact form (EmailJS), Footer
- All driven by `src/data/portfolio.config.ts`

**Partially Built (maps to Blueprint Phase 3 — Admin Control Center)**
- `/admin` route exists, protected by `ADMIN_SECRET`
- Currently manages: Contact messages, Blog comments (approve/delete), Newsletter subscribers, basic stats overview
- Does **not yet** manage Profile, Experience, Skills, Projects, Certifications, or Resume — those remain hardcoded in `portfolio.config.ts`

**Built (Extended Modules from Section 11 — earlier than planned!)**
- **§11.2 Personal Knowledge Base** → implemented as **"KT Centre"**: 49 static DevOps PDFs across 12 categories (AWS, Docker, Kubernetes, Linux, Terraform, etc.) + DB-backed user uploads (`kt_documents` table), with category filters and a global PDF viewer
- **§11.10 Personal AI Assistant** → implemented as the **"MOJOMO" chatbot** (`ChatWidget.tsx` + `/api/chat`): Gemini 2.0 Flash, answers visitor questions about the profile — but profile data is hardcoded into the prompt (duplicated, not sourced from a Profile Core)
- **§11.13 Open Source Contributions Hub** → implemented as **GitHub Stats**: live GitHub API integration (repos, stars, followers, contribution graph)
- Blog & Knowledge Hub → MDX blog (2 posts so far) with DB-backed comments (admin-moderated) and newsletter signup

**Not Started (Pure Roadmap)**
- Profile Core Engine (centralized `profile` table, experience auto-calculation, settings-driven config)
- Domain-driven folder restructure (`src/domains/...`)
- Admin management of Profile/Experience/Skills/Projects/Certs/Resume
- **Account Centre (Tier 2 foundation, §6.7)** — end-user login/signup separate from admin, user job preferences — nothing here exists yet; everything below depends on it
- Resume Studio (upload/extract/generate/export, multi-template, versioning) — per-user, Tier 2
- Resume AI (ATS Scanner, JD Matching, Tailoring, Cover Letter Generator)
- Job Domain (automated job ingestion via Adzuna/JSearch, per-user matching + application tracking — §6.3)
- Career Domain (Career Advisor, skill gap analyzer, roadmap) — per-user, Tier 2
- Interactive Interview Domain (mock interviews, question bank, feedback reports — KT Centre has static interview-prep PDFs only)
- Analytics Domain (custom portfolio/resume/AI metrics — currently only generic Vercel Analytics)
- AI Gateway abstraction (`ai/prompts`, `ai/providers`, `ai/agents`, etc. — currently AI logic lives directly inside `/api/chat/route.ts`)
- DevOps Toolkit, Project Blueprint Marketplace, Architecture Showcase, Infrastructure Playground, AI Project Evaluator, Career Progress Dashboard, Recruiter Dashboard, DevOps Interview Lab, Live Project Monitoring Demo, Service Showcase, Achievement Engine, Professional Digital Identity Hub

### 13.4 Implication for Build Order

Because the foundational pages and several Section-11 "extended" modules already exist (just not yet wired to a Profile Core), the **realistic next phase is not "Phase 1 from zero"** — it's a **Profile Core refactor**:

1. Design `profile_domain` tables (profile, experience, skills, certifications, projects, social_links, settings) in the existing LibSQL/Turso database
2. Migrate the contents of `portfolio.config.ts` into these tables (one-time seed)
3. Build CRUD queries + API routes for the profile domain
4. Extend the existing Admin Control Center with new tabs to manage this data
5. Refactor existing sections (Hero, About, Skills, Experience, Projects, Certificates, Resume) to read from the Profile Core via API/server components instead of the static config
6. Refactor the MOJOMO chatbot's system prompt to be generated dynamically from the same Profile Core data (removing the duplicated hardcoded copy)

Only after this refactor is stable should net-new domains be started — and per §2.1's Two-Tier Model, that means **Account Centre (Tier 2 foundation, §6.7) before Resume Studio, Job Search, Career Advisor, or Interview Lab**, since all four depend on it for user accounts and per-user data scoping. The full phase-by-phase sequence (Phase 0 → Phase 2.5 Account Centre → Phase 3 Resume Studio → Phase 4 Job Search/Career, etc.) is in `MS_PORTFOLIO_2.0_IMPLEMENTATION_PLAN.md` §4.

### 13.5 Living Status Fields

- **Phase currently in progress:** _TBD — pending your confirmation_
- **Last completed milestone:** PiP PDF viewer, KT Centre uploads, MOJOMO chatbot, MS logo (per latest commits)
- **Immediate next task:** _TBD — pending your decision (see 13.4)_

---

## 14. How to Use This Document

- This document represents the **full long-term vision**, now organized into **two tiers** (§2.1): Tier 1 (Public Portfolio, Sections 1–6.1) and Tier 2 (Account Centre + Resume/Job/Career/Interview, §§6.2–6.7). Sections 1–10 remain the **foundational architecture** that must be built first (Phases 1–3, Tier 1). Section 11 is the **extended roadmap** (mostly Tier 1 + standalone modules) — start these only after the foundation, and after Tier 2's Account Centre exists if a module depends on user accounts (e.g. Recruiter Dashboard, §11.9).
- When working in Claude Code (terminal), keep this file **and** `MS_PORTFOLIO_2.0_IMPLEMENTATION_PLAN.md` in the project root — the implementation plan has the detailed phase-by-phase tasks (including Phase 2.5 Account Centre and Phase 4's automated job search), this file has the underlying vision and domain specs they implement.
- When working in this chat, paste or upload the latest version of this file (especially Section 13) at the start of a session so context carries over.