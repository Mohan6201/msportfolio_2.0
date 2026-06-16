# MS Portfolio 2.0 — Master Implementation Plan

> **Companion to:** `MS_PORTFOLIO_2.0_BLUEPRINT.md` (vision & domain specs)
> **Purpose:** A single, sequenced roadmap that takes the *existing* codebase (audited in Blueprint §13) and evolves it — refactor first, then every new domain — into the fully organized, robust platform described in the blueprint. Includes updated (mid-2026) technology recommendations chosen specifically to make this build smoother, not as "trend chasing."
> **How to use this doc:** Work top to bottom. Each phase assumes the previous one is done. Each phase ends in a working, deployable state — nothing is "half-broken" between phases.

---

## 1. Guiding Principle

> **Nothing gets thrown away. Everything gets organized.**

The current portfolio already has real, working features (the foundational pages, KT Centre, MOJOMO chatbot, GitHub stats, blog). The plan below **migrates** these into the domain-driven structure rather than rebuilding them — and only *after* the foundation (Profile Core + domain structure + admin CMS) is solid does new functionality (Resume Studio, Job/Career domains, DevOps Toolkit, etc.) get layered on top.

---

## 2. Recommended Technology Additions (as of mid-2026)

These are additions/upgrades to the **existing** stack — nothing here requires abandoning Next.js, Turso, Tailwind, or Vercel, which are all still solid choices.

### 2.1 Next.js 15 → 16.2 (LTS)
The project is currently on Next.js `^15.5.18`. Next.js 16.2 is the current stable/LTS line, and Next.js 15's support window ends October 2026. Upgrading early is low-risk (App Router → App Router) and brings:
- Turbopack as the default bundler — significantly faster `next dev` startup and builds
- A new "agent-ready" project shape (`AGENTS.md`, browser log forwarding) which directly benefits the terminal ↔ chat workflow already discussed — Claude Code gets better diagnostics automatically
- A stable Adapter API for multi-platform deployment, useful if hosting ever needs to move off Vercel

**Action:** Do this upgrade as part of Phase 0 — before the domain restructure — so the restructure happens on top of the current framework version.

### 2.2 Drizzle ORM + drizzle-kit (on top of existing Turso/LibSQL)
The project already uses `@libsql/client` with hand-written SQL in `src/db/queries.ts`. **Keep Turso** (it's a good fit, already configured, zero migration cost) but add **Drizzle ORM** on top:
- Each domain gets its own **typed schema file** (`db/schema/profile.ts`, `db/schema/resume.ts`, etc.) — this *is* the domain-based database structure the blueprint calls for, expressed in code
- `drizzle-kit` manages migrations (`generate` → review SQL → `migrate`), replacing the current "run CREATE TABLE IF NOT EXISTS on cold start" pattern in `db/client.ts`
- Full TypeScript autocomplete and compile-time safety for every query across every domain

### 2.3 Vercel AI SDK (v5/v6) + Vercel AI Gateway
This **is** the "AI Gateway" domain from the blueprint, already built and maintained by Vercel (the same platform this project deploys to):
- One unified API (`generateText`, `generateObject`, `streamText`) across providers — Google, Anthropic, OpenAI, etc. — via simple model strings like `google/gemini-3.5-flash`
- Built-in automatic retries/fallback if a provider has an outage
- Built-in spend monitoring and per-feature usage tracking — directly powers the "AI Metrics" part of the Analytics domain
- `generateObject` + Zod schemas gives **guaranteed structured JSON output** — exactly what Resume Studio's extraction, ATS scoring, and job-matching need

**Action:** Replace the direct `@google/generative-ai` call in `src/app/api/chat/route.ts` with the AI SDK during Phase 0/1. This becomes the single entry point every future AI feature (Resume AI, Career Advisor, Interview Lab) calls through.

### 2.4 Gemini 3.5 Flash (via AI Gateway) for document understanding
The chatbot currently hardcodes `gemini-2.0-flash`. Current-generation Gemini models (3 / 3.5 Flash) natively process PDFs up to ~1000 pages with layout-aware understanding, and support strict JSON-Schema structured outputs with guaranteed field ordering. This is the core enabler for:
- **Resume Studio's extraction step** (Upload Resume → Extract Data → Store Structured Data)
- **ATS Scanner / JD Matching** (structured comparison output)
- **AI Project Evaluator** (analyze a GitHub repo/portfolio and return structured strengths/weaknesses)

### 2.5 Better Auth for the Admin Control Center
The current `/admin` route is protected by a single shared secret in a query string (`?secret=...`) — functional for a v1, but not something to build a full CMS on top of. **Better Auth** is a TypeScript-first, self-hosted auth library with first-class Drizzle adapter support and database-backed sessions:
- Proper login (email/password, optionally passkeys) instead of a shared secret in URLs
- Role field (`admin`/`owner`) ready for the later **Recruiter Dashboard** (which needs a *different*, lower-privilege view) without re-architecting auth twice

### 2.6 File storage note (flag for Phase 0)
The repo is currently **~613MB**, dominated by `public/Resource Images` (224MB) and `public/collections` (80MB) — and `kt_documents` stores uploaded PDFs as `BLOB`s directly in the SQLite/Turso database. Neither scales well (slow git clones, DB size limits, slow cold starts). As part of Phase 0/5, plan to move large binary assets (KT Centre PDFs, resume uploads, future blueprint/marketplace files) to object storage (e.g., Vercel Blob), with the database storing only metadata + URLs — consistent with the domain principle of "database holds structured data, not files."

### 2.7 Job posting data source (for automated Job Search)
Neither LinkedIn nor Indeed offers an open public API for job listings (Indeed closed its API in 2021; LinkedIn's job APIs remain partner-gated) — every "automated job search" feature is built on third-party aggregators. For this project:
- **Adzuna API** (primary) — free tier, covers India (`api.adzuna.com/v1/api/jobs/in/...`) and 20+ other countries, returns structured listings with salary estimates. Good fit as the main feed for DevOps/Cloud roles.
- **JSearch (via RapidAPI)** (secondary/supplementary) — aggregates listings sourced from LinkedIn, Indeed, Glassdoor and others through a single API, free tier available; useful to widen coverage beyond Adzuna's direct sources.
- Both return plain JSON over HTTPS — no scraping, no ToS risk, and both fit cleanly into a scheduled ingestion workflow (see Phase 4 and §5.4).

---

## 3. Target Domain-Driven Folder Structure (End State)

```
ms_portfolio_2.0/
├── src/
│   ├── app/                          # Next.js routes (thin — delegates to domains)
│   │   ├── (public)/                 # Public site: /, /blog, /resume, etc.
│   │   ├── admin/                    # Admin Control Center (Better Auth–protected)
│   │   ├── account/                  # Account Centre — end-user login + dashboard (Phase 2.5)
│   │   ├── recruiter/                # Recruiter Dashboard (Phase 7)
│   │   └── api/                      # Route handlers, grouped by domain
│   │
│   ├── domains/
│   │   ├── profile/                  # Profile Core Engine — Tier 1 (Phase 1)
│   │   ├── accounts/                 # Account Centre — Tier 2 foundation (Phase 2.5)
│   │   ├── resume/                   # Resume Studio + Resume AI — Tier 2 (Phase 3)
│   │   ├── jobs/                     # Job Search + Intelligence — Tier 2 (Phase 4)
│   │   ├── career/                   # Career Advisor — Tier 2 (Phase 4)
│   │   ├── interview/                # DevOps Interview Lab — Tier 2 (Phase 5)
│   │   ├── analytics/                # Analytics Platform (Phase 6)
│   │   ├── knowledge/                # KT Centre → Knowledge Base (Phase 5)
│   │   ├── devops-toolkit/           # Nginx/Docker/CI/CD/EC2/AWS generators (Phase 6)
│   │   ├── blog/                     # Existing MDX blog (migrated, Phase 0)
│   │   └── admin/                    # Admin-only cross-domain views
│   │
│   ├── ai/                           # AI Gateway (Phase 1)
│   │   ├── providers/                # Vercel AI Gateway config
│   │   ├── prompts/                  # System prompts, generated FROM profile domain
│   │   ├── schemas/                  # Zod schemas for structured outputs
│   │   ├── agents/                   # High-level functions: extractResume(), scoreATS(), ...
│   │   └── workflows/                # Multi-step flows (upload → extract → store → analyze)
│   │
│   ├── db/
│   │   ├── schema/                   # One file per domain (Drizzle)
│   │   ├── client.ts                 # Drizzle + Turso client
│   │   └── migrations/               # drizzle-kit output
│   │
│   ├── components/ui/                # Shared shadcn/ui primitives (unchanged)
│   ├── lib/, providers/, state/      # Unchanged
│   └── auth/                         # Better Auth config — admin role (Phase 0/2) + user role (Phase 2.5)
```

Each `domains/<x>` folder owns its **UI components, server actions/API handlers, domain-specific types, and validation** — but reads/writes data only through `db/schema/<x>.ts` and calls AI only through `src/ai/agents/*`. This is the enforcement of the blueprint's "Golden Rule" (everything plugs into Profile Core / shared services, nothing creates its own silo).

### 3.1 Two-Tier Platform Model

Your "Job Search + Account Centre" requirements introduce a second tier alongside the original portfolio, and it's worth stating explicitly because it changes who owns which data:

**Tier 1 — Public Portfolio (Profile Core, Phase 1).** This is the brand-facing site: a *single* profile (yours) shown to anonymous visitors — Hero, About, Skills, Experience, Projects, Resume preview, MOJOMO chatbot, KT Centre, Blog. No login required. `profile_domain.profiles` has exactly one row.

**Tier 2 — Account Centre (Phase 2.5+).** This is a multi-tenant "career tools" application that sits behind login (Better Auth, `user` role): Resume Studio, automated Job Search with AI matching, Career Advisor, Interview Lab. Every table here (`resumes`, `job_matches`, `user_job_preferences`, etc.) is scoped to `user_id`, not `profile_id`.

**You use both, as two different identities on the same platform:** as the **owner**, you manage Tier 1 through the Admin Control Center. As a **user** (job seeker), you log into Tier 2 with your own account — the same account architecture that would let other job seekers sign up later, even though right now you're the only user. Tier 2 reads from Tier 1 only at one optional point: when you create your first resume in Resume Studio, it can offer to pre-fill from your public Profile Core data as a starting point — after that, your resume versions evolve independently as your own data.

---

## 4. Unified Build Roadmap

### Phase 0 — Tooling & Structural Refactor (no new user-facing features)

**Goal:** Make the codebase ready to receive everything else, without changing what visitors see.

| Task | Detail |
|---|---|
| Upgrade Next.js 15 → 16.2 | Follow official 15→16 codemod; verify Turbopack build succeeds |
| Add Drizzle ORM + drizzle-kit | Introspect existing Turso tables (`contacts`, `blog_comments`, `newsletter`, `kt_documents`) into `db/schema/legacy.ts` as a starting point |
| Create `src/domains/` skeleton | Move each `components/<section>` folder into `domains/profile/components/` (Hero, About, Skills, Experience, Projects, Certificates, Resume preview, Contact, Footer, Navbar all become **Profile domain UI** for now — they all render profile data) |
| Move blog | `components/blog`, `content/blog`, `lib/blog.ts`, `app/blog` → `domains/blog/` |
| Move KT Centre | `components/knowledge`, `app/api/kt-*` → `domains/knowledge/` |
| Move GitHub Stats | `components/github` → `domains/analytics/` (it's already an "analytics" widget — Open Source Contributions Hub) |
| Set up `src/ai/` | Install AI SDK + Gateway provider; move `/api/chat` logic into `ai/agents/chatWithVisitor.ts`, keep route as a thin wrapper |
| Set up Better Auth | Add `auth` tables via Drizzle; create `/admin/login`; keep old `ADMIN_SECRET` working in parallel until login is verified, then remove |

**End state:** Same site, same features, visually identical — but organized by domain, type-safe DB layer, and a single AI entry point.

---

### Phase 1 — Profile Core Engine

**Goal:** Single source of truth for all profile data; the "1 record instead of 20 pages" principle becomes real.

| Task | Detail |
|---|---|
| `db/schema/profile.ts` | Tables: `profiles`, `social_links`, `skills`, `experiences`, `certifications`, `projects`, `settings` (see §5.1) |
| Seed script | One-time script reads `src/data/portfolio.config.ts` and inserts rows into the new tables |
| Profile domain queries/services | `domains/profile/services/` — typed CRUD for every table above |
| Experience auto-calculator | Computed from `career_start_date` in `settings`/`profiles` — no more manually-typed "3.5 years" |
| Refactor public sections | Hero, About, Skills, Experience, Projects, Certificates, Resume, Contact info now fetch from Profile domain (Server Components) instead of importing `portfolio.config.ts` |
| Refactor MOJOMO chatbot prompt | `ai/prompts/visitorAssistant.ts` builds the system prompt **dynamically** from the Profile domain — removes the duplicated hardcoded profile text in `api/chat/route.ts` |
| Retire `portfolio.config.ts` | Once everything reads from the DB, delete the file (or keep as a typed fallback/seed reference only) |

**End state:** Updating your job title, a skill level, or a new project happens in **one place** (the database) and is reflected everywhere — public pages and the AI assistant — automatically.

---

### Phase 2 — Admin Control Center 2.0

**Goal:** Turn the existing `/admin` (currently: messages, comments, subscribers, stats) into the full internal CMS the blueprint describes.

| Task | Detail |
|---|---|
| Better Auth login | Real login replaces `?secret=` (carried over from Phase 0) |
| Profile management tab | Edit name, title, bio, contact info, social links, `career_start_date`, settings |
| Experience/Skills/Projects/Certifications tabs | Full CRUD UI (add/edit/reorder/delete) — these were previously only editable by hand-editing `portfolio.config.ts` |
| Existing tabs retained | Messages, Comments, Subscribers, Stats — migrated to Drizzle queries |
| Role field | `users.role` (`owner` | `admin`) — same table extended in Phase 2.5 with `user`/`recruiter` roles (see §5.2); groundwork for the Recruiter Dashboard's restricted view in Phase 7 |

**End state:** The entire public-facing profile is editable from a UI — the blueprint's "instead of opening a database / running SQL / editing JSON, you simply log in and update" is fully realized.

---

### Phase 2.5 — Account Centre Foundation

**Goal:** Stand up Tier 2 (per §3.1) — the multi-tenant "career tools" side of the platform — as an empty but real, login-protected shell that Phases 3 and 4 plug into.

| Task | Detail |
|---|---|
| Extend Better Auth | Add a `user` role alongside the existing `owner`/`admin` roles (Phase 2); separate sign-up/login flow at `/account/login` and `/account/signup`, distinct from `/admin/login` |
| `db/schema/accounts.ts` | Better Auth's standard user/session tables + `user_job_preferences` (see §5.2) |
| Create your own user account | As the platform's first real user, you sign up via `/account/signup` — this is a *different* identity from your owner/admin login, even though it's you |
| Account Centre shell (`domains/accounts`) | `/account` dashboard layout + a Settings page for job preferences (target roles, locations, salary range, remote preference, employment type) |
| "Import from Profile" option | One-time helper: lets a logged-in user pre-fill basic info from the Tier 1 public profile — only meaningful for the owner's own account, harmless no-op for any future user |

**End state:** You can log into `/account` with your own credentials and see an empty dashboard with a working Settings/Preferences page. Nothing AI-powered yet — that's Phases 3 and 4 — but the account layer, data ownership model, and routing are real and deployable.

---

### Phase 3 — Resume Domain: Resume Studio + Resume AI

**Goal:** The "most powerful feature" — resume upload, structured storage, multi-template generation, versioning, and AI analysis. Built inside the **Account Centre (Tier 2)** — every resume belongs to a logged-in user (`user_id`), starting with you.

| Task | Detail |
|---|---|
| `db/schema/resume.ts` | `resumes`, `resume_versions`, `resume_templates`, `resume_analyses`, `cover_letters` — all scoped by `user_id` (see §5.3) |
| `ai/schemas/resumeExtraction.ts` | Zod schema describing a structured resume (contact, summary, experience[], education[], skills[], projects[], certifications[]) |
| `ai/agents/extractResume.ts` | Uses Gemini 3.5 Flash + the schema above to convert an uploaded PDF/DOCX into structured JSON in one call |
| Resume Studio UI (`domains/resume`, under `/account`) | Upload → preview extracted data → confirm/edit → save as a new **version**; first-time users see the "Import from Profile" option from Phase 2.5 |
| Resume Templates | Start with 2–3 React-rendered templates (reuse existing design system); export to PDF |
| Resume Versioning | Each save creates a new `resume_versions` row; UI to diff/restore versions (git-like, per blueprint) |
| Resume AI — ATS Scanner | `ai/agents/scoreATS.ts`: structured score + flagged issues |
| Resume AI — JD Matching | `ai/agents/matchJD.ts`: compares structured resume vs. pasted job description → match score + gaps |
| Resume AI — Tailoring & Cover Letter | `ai/agents/tailorResume.ts`, `ai/agents/generateCoverLetter.ts` |

**End state:** Logged into your Account Centre, you can upload your resume, get it parsed into structured data, generate polished versions from templates, and run AI analysis. This same data feeds directly into Phase 4's job matching.

---

### Phase 4 — Job Search (Automated) + Career Domain

**Goal:** This is the phase that delivers what you actually asked for — log in, see real job postings pulled in automatically, get them scored against your resume and preferences, and track them. Job Search and Career Advisor are kept as **separate** domains per the blueprint's explicit warning not to mix them, and both live in the **Account Centre (Tier 2)**.

| Task | Detail |
|---|---|
| `db/schema/jobs.ts` | `companies`, `jobs`, `job_matches` — `jobs` is a shared catalog, `job_matches` is per-`user_id` (see §5.4) |
| `ai/workflows/ingestJobPostings.ts` | Scheduled (Vercel Cron, e.g. daily) — calls Adzuna (primary) and JSearch (secondary, per §2.7) using each user's `user_job_preferences` as query params, normalizes results into `jobs`, dedupes by source+external ID, embeds via `embedText` (§5.9) |
| User Job Preferences | From Phase 2.5's Settings page — target roles, locations, salary range, remote/hybrid/onsite, employment type — drives both the ingestion query and the "Suggested Jobs" filter |
| `ai/agents/scoreJobMatch.ts` | Vector pre-filter (§5.9) narrows candidate jobs, then structured AI call scores resume + preferences vs. job → match score + skill gaps, written to `job_matches` |
| Job Search UI (`domains/jobs`, under `/account`) | "Suggested Jobs" feed (auto-matched, sorted by score) + manual search/filter over the `jobs` catalog |
| Application tracking | `job_matches.status` (`suggested` → `saved` → `applied` → `interviewing` → `rejected`/`offer`) — simple Kanban-style board in the UI |
| `db/schema/career.ts` | `skill_gap_reports`, `career_recommendations` — per-`user_id` (see §5.5) |
| Career Advisor | `ai/agents/careerAdvisor.ts` consumes the user's Resume + Job Matches + (later) Interview data → recommendations, skill gaps, roadmap |

**End state:** Logging into your Account Centre shows real, recently-posted DevOps/Cloud roles matching your preferences, each with an AI match score and gap analysis against your resume, and a simple tracker for where each application stands — plus a personalized career roadmap.

---

### Phase 5 — Knowledge Base Upgrade + Interview Domain

**Goal:** Evolve the existing KT Centre into the full "second brain" with AI search, and add the interactive Interview Lab.

| Task | Detail |
|---|---|
| Move KT PDFs to object storage | Per §2.6 — `kt_documents` keeps metadata + storage URL only |
| AI search over KT Centre | Chunk + embed documents (AI SDK embeddings via Gateway) → simple vector search; "How did Mohan configure Nginx reverse proxy?" becomes answerable |
| `db/schema/interview.ts` | `interview_questions`, `mock_interviews` — `mock_interviews` scoped by `user_id`, lives in the Account Centre (see §5.5) |
| Question bank | Seed from existing KT Centre interview-prep PDFs (AWS/Docker/Linux/Terraform/CI-CD categories already exist) |
| Mock Interview Engine | `ai/agents/runMockInterview.ts` — conversational, scores answers, generates a feedback report |

**End state:** Knowledge Base becomes genuinely searchable by AI, and the static "interview prep PDFs" become an interactive practice tool.

---

### Phase 6 — Analytics Domain + DevOps Toolkit

**Goal:** Close the loop with real metrics, and ship the "signature DevOps feature."

| Task | Detail |
|---|---|
| `db/schema/analytics.ts` | `page_views`, `resume_downloads`, `ai_usage_logs` (see §5.6) — complements existing Vercel Analytics with feature-level detail |
| Analytics tab in Admin | Portfolio metrics, Resume metrics, AI metrics — per blueprint §Analytics Domain |
| GitHub Stats relocation | Already a Phase 0 move into `domains/analytics` — now formally part of this dashboard |
| DevOps Toolkit (`domains/devops-toolkit`) | Nginx Config Generator, Docker Compose Generator, GitHub Actions Generator, EC2 Cost Calculator, AWS Architecture Generator — mostly deterministic generators with an optional "explain with AI" button via `ai/agents` |

**End state:** Owner has real usage insight, and the platform now demonstrates hands-on DevOps tooling — directly aligned with the professional background.

---

### Phase 7 — Platform Expansion (Long-Term / As-Needed)

These remain exactly as scoped in Blueprint §11, now slotting cleanly into the established domain structure:

- Project Blueprint Marketplace
- Architecture Showcase Center
- Infrastructure Playground
- AI Project Evaluator (now trivial — reuses `ai/agents` + structured output pattern from Resume AI)
- Career Progress Dashboard (reuses Analytics domain)
- Recruiter Dashboard (reuses Better Auth roles from Phases 2/2.5)
- Achievement Engine (computed view over Profile + Analytics domains)
- Professional Digital Identity Hub
- Service Showcase
- Live Project Monitoring Demo

Each of these should get its own short scoping pass **when you're ready to start it** — they don't need detailed planning now, since the domain pattern established in Phases 1–6 makes each one a smaller, well-understood unit of work.

---

## 5. Database Schema Plan (Drizzle, by Domain)

> Field lists are indicative, not exhaustive — refine during each phase's implementation.

### 5.1 `profile_domain` (Tier 1 — single owner profile)
- **profiles**: `id, full_name, title, bio, location, email, phone, avatar_url, career_start_date, current_company, current_designation, resume_url` — exactly one row; the public-facing brand profile
- **social_links**: `id, profile_id, platform, url, label`
- **skills**: `id, profile_id, name, category, level, icon_key`
- **experiences**: `id, profile_id, job_title, company, company_url, start_date, end_date, is_current, tech (json), responsibilities (json)`
- **certifications**: `id, profile_id, title, issuer, date, description, image_url, link`
- **projects**: `id, profile_id, name, year, description, image_url, link, github_url, tech (json), responsibilities (json), align`
- **settings**: `key, value` — generic KV for future-proofed config values

### 5.2 `accounts_domain` (Tier 2 foundation)
- **users**: managed by Better Auth — `id, email, name, role (owner | user | recruiter), created_at`. You sign up here as your *first* user (`role=user`), separate from your `owner`/`admin` login used for `/admin`.
- **user_job_preferences**: `id, user_id, target_roles (json), preferred_locations (json), remote_preference (remote | hybrid | onsite | any), employment_type (json), min_salary, keywords (json), updated_at` — drives both job ingestion queries and the "Suggested Jobs" view in Phase 4

### 5.3 `resume_domain` (Tier 2 — scoped per user)
- **resumes**: `id, user_id, title, created_at`
- **resume_versions**: `id, resume_id, version_number, structured_data (json), source_file_url, embedding (vector, see §5.9), created_at`
- **resume_templates**: `id, name, preview_image_url, component_key`
- **resume_analyses**: `id, resume_version_id, jd_text, ats_score, match_score, suggestions (json), created_at`
- **cover_letters**: `id, resume_version_id, job_id (nullable), content, created_at`

### 5.4 `job_domain` (Tier 2 — shared catalog + per-user matches)
- **companies**: `id, name, url, logo_url`
- **jobs**: `id, company_id, source (adzuna | jsearch | manual), external_id, title, description, requirements (json), location, remote, salary_min, salary_max, url, posted_at, embedding (vector, see §5.9), created_at` — a **shared catalog**, populated by the scheduled ingestion workflow (Phase 4); `(source, external_id)` is unique, used for de-duplication
- **job_matches**: `id, user_id, job_id, resume_version_id, match_score, skill_gaps (json), status (suggested | saved | applied | interviewing | rejected | offer), created_at, updated_at` — **per-user**; this single table doubles as both "AI suggestions feed" (`status='suggested'`) and the application tracker (status updated by the user)

### 5.5 `career_domain` / `interview_domain` (Tier 2 — scoped per user)
- **skill_gap_reports**: `id, user_id, target_role, gaps (json), created_at`
- **career_recommendations**: `id, user_id, type, content (json), created_at`
- **interview_questions**: `id, category, level, question, answer, tags (json)` — shared question bank, not user-scoped
- **mock_interviews**: `id, user_id, category, transcript (json), score, feedback, created_at`

### 5.6 `analytics_domain`
- **page_views**: `id, path, visitor_hash, created_at`
- **resume_downloads**: `id, resume_version_id, created_at`
- **ai_usage_logs**: `id, feature, model, tokens_used, created_at`

### 5.7 `knowledge_domain` (evolves existing `kt_documents`)
- **kt_documents**: `id, title, category, level, storage_url, file_size, uploaded_at` (drop `file_data BLOB` → object storage)
- **kt_chunks**: `id, document_id, chunk_index, content, embedding (vector, see §5.9)`

### 5.8 `content_domain` (existing, migrated as-is)
- **blog_comments**, **newsletter**, **contacts** — migrated into Drizzle schema unchanged in Phase 0

### 5.9 Vector Search Strategy (Native libSQL)

This project doesn't need a separate vector database — libSQL's native vector type and ANN index cover both AI-search use cases directly inside the existing Turso database.

**Embedding model.** Use a single embedding model via the AI Gateway (e.g. `google/gemini-embedding-001`, 768 dimensions) for *everything* — KT chunks, resume versions, and job postings all share the same vector space, which is what makes resume↔job comparison meaningful. Pin the dimension count as a constant in `ai/providers/gateway.ts` so every `F32_BLOB(n)` column agrees with it.

**Where it's used:**

1. **Knowledge Base search** (`kt_chunks`, Phase 5) — when a KT document is uploaded, `ai/workflows/indexKnowledgeDocument.ts` splits the extracted text into ~300–500 token chunks (with small overlap), embeds each chunk, and inserts one `kt_chunks` row per chunk. A visitor question ("How did Mohan configure Nginx reverse proxy?") is embedded the same way, compared against `kt_chunks.embedding`, and the top matches are handed to MOJOMO as context.

2. **Resume ↔ Job matching** (`resume_versions.embedding`, `jobs.embedding`, Phases 3–4) — each saved resume version gets one embedding (of its summary/skills text), and every ingested job posting gets one too. Before running the expensive structured `matchJD`/`scoreJobMatch` AI call, a cheap vector-distance query narrows the candidate set (e.g. "which jobs from today's ingestion run are closest to this user's resume?") — this is what keeps the daily ingestion → matching pipeline affordable even as the `jobs` catalog grows.

**Example schema (raw SQL, since drizzle-kit doesn't yet generate vector column/index syntax — add via a hand-written migration alongside the Drizzle-generated ones):**

```sql
-- Knowledge Base chunks
CREATE TABLE kt_chunks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL REFERENCES kt_documents(id),
  chunk_index INTEGER NOT NULL,
  content     TEXT NOT NULL,
  embedding   F32_BLOB(768) NOT NULL
);
CREATE INDEX kt_chunks_vec_idx
  ON kt_chunks (libsql_vector_idx(embedding, 'metric=cosine'));

-- Resume / Job embeddings
ALTER TABLE resume_versions ADD COLUMN embedding F32_BLOB(768);
ALTER TABLE jobs            ADD COLUMN embedding F32_BLOB(768);
```

**Example query — Knowledge Base search:**

```sql
SELECT kt_chunks.content, kt_documents.title, kt_documents.category,
       vector_distance_cos(kt_chunks.embedding, vector(:query_embedding)) AS distance
FROM kt_chunks
JOIN kt_documents ON kt_documents.id = kt_chunks.document_id
ORDER BY distance ASC
LIMIT 5;
```

**Example query — job match pre-filter (per user, against newly-ingested jobs):**

```sql
SELECT jobs.id, jobs.title, companies.name,
       vector_distance_cos(jobs.embedding, vector(:resume_embedding)) AS distance
FROM jobs
JOIN companies ON companies.id = jobs.company_id
WHERE jobs.id NOT IN (
  SELECT job_id FROM job_matches WHERE user_id = :user_id
)
ORDER BY distance ASC
LIMIT 10;
```

**Indexing approach.** At this project's scale (dozens to a few hundred KT chunks, a handful of resume versions, and a daily trickle of new job postings), exact `vector_distance_cos` with `ORDER BY ... LIMIT` is fast and requires no index — start here. The `libsql_vector_idx` (DiskANN-based ANN index, queried via `vector_top_k`) only becomes worth adding if the `jobs` catalog or Knowledge Base grows into the thousands of rows; it's a drop-in addition later, not a decision that needs to be made now.

**Shared agent:** `ai/agents/embedText.ts` (added to §6) is the single function both the Knowledge Base indexing workflow and the job ingestion workflow call — one place that talks to the embeddings endpoint, one place `ai_usage_logs` records embedding-token usage.

---

## 6. AI Gateway Design (`src/ai/`)

```
ai/
├── providers/
│   └── gateway.ts          # Vercel AI Gateway client config, model string constants
├── prompts/
│   └── visitorAssistant.ts # Builds MOJOMO's system prompt FROM profile domain data
├── schemas/
│   ├── resumeExtraction.ts # Zod schema: structured resume
│   ├── atsScore.ts         # Zod schema: ATS analysis result
│   ├── jobMatch.ts         # Zod schema: match score + gaps
│   └── careerRoadmap.ts    # Zod schema: recommendations + roadmap
├── agents/
│   ├── chatWithVisitor.ts  # MOJOMO chatbot (Phase 0/1)
│   ├── embedText.ts        # Shared embedding agent — Phase 3/4/5 (see §5.9)
│   ├── extractResume.ts    # Phase 3
│   ├── scoreATS.ts         # Phase 3
│   ├── matchJD.ts          # Phase 3
│   ├── tailorResume.ts      # Phase 3
│   ├── generateCoverLetter.ts # Phase 3
│   ├── scoreJobMatch.ts    # Phase 4
│   ├── careerAdvisor.ts    # Phase 4
│   └── runMockInterview.ts # Phase 5
└── workflows/
    ├── resumeUploadFlow.ts        # extract → validate → store version → embed → trigger analyses
    ├── ingestJobPostings.ts       # Phase 4 — scheduled: fetch Adzuna/JSearch → normalize → dedupe → embed → score matches (see §2.7, §5.4, §5.9)
    └── indexKnowledgeDocument.ts  # chunk → embed → store kt_chunks (Phase 5, see §5.9)
```

**Core rule (per Blueprint §7):** No domain calls `@ai-sdk/google` or any provider SDK directly. Every AI interaction goes through `ai/agents/*`, which use the shared Gateway provider and shared Zod schemas. Swapping models (e.g., trying a new Gemini or Claude model for resume extraction) becomes a one-line change in `ai/providers/gateway.ts`, and `ai_usage_logs` (Analytics domain) automatically captures usage for every agent.

---

## 7. Migration Map (Current → New Location)

| Current Location | New Location | Phase |
|---|---|---|
| `src/data/portfolio.config.ts` | Seeds `profile_domain` tables, then retired | 1 |
| `src/components/{hero,aboutMe,skills,experience,projects,certificates,resume,contact}Section` | `src/domains/profile/components/` | 0 |
| `src/components/navbar`, `footer`, `subHeroSection` | `src/domains/profile/components/` (shared layout) | 0 |
| `src/components/blog`, `content/blog`, `src/lib/blog.ts`, `src/app/blog` | `src/domains/blog/` | 0 |
| `src/components/knowledge`, `src/app/api/kt-*` | `src/domains/knowledge/` | 0, 5 |
| `src/components/github` | `src/domains/analytics/components/GitHubStats.tsx` | 0, 6 |
| `src/components/chat`, `src/app/api/chat` | `src/ai/agents/chatWithVisitor.ts` + thin route | 0, 1 |
| `src/app/admin`, `src/app/api/admin` | `src/app/admin/` (Better Auth) + `src/domains/admin/` | 0, 2 |
| `src/db/client.ts`, `src/db/queries.ts` | `src/db/client.ts` (Drizzle) + `src/db/schema/*.ts` | 0 |
| `src/state/useMenuStore.js` | `src/domains/profile/state/` (unchanged logic) | 0 |

> **Net-new (no current-code row):** `accounts`, `resume`, `jobs`, `career`, `interview`, and `devops-toolkit` domains don't exist in the current codebase — they're built fresh in Phases 2.5–6, not migrated.

---

## 8. Working With This Plan (Terminal ↔ Chat)

- This document plus `MS_PORTFOLIO_2.0_BLUEPRINT.md` together form the **full context set**. Keep both in the project root (e.g. as `BLUEPRINT.md` and `IMPLEMENTATION_PLAN.md`) so Claude Code auto-loads them.
- Work **one phase at a time**. When starting a session (terminal or chat), state which phase/task you're on — e.g. "Phase 1, refactoring the Skills section to read from the profile domain."
- After completing a task, update the "Living Status" notes (add a short status section to this file, or keep using Blueprint §13.5) so the other tool (terminal/chat) picks up exactly where you left off.
- Each phase is designed to leave the app in a **working, deployable state** — never start Phase N+1 until Phase N builds and deploys cleanly.