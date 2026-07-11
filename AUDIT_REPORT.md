# MS Portfolio 2.0 — Full Audit Report

**Status:** All 7 phases investigated (read-only). **SEC-01 has been fixed and verified** (see below); everything else in this report is still proposed work awaiting your go-ahead.

## Executive Summary

- **56 findings** across 7 phases: 1 Critical (live exploit — **now fixed**), 2 High/Critical-adjacent, ~20 High, ~25 Medium, ~10 Low.
- ~~**Fix this first, independent of everything else:** SEC-01 — any visitor can self-promote to admin/owner via a crafted sign-up request (`src/auth/index.ts`, missing `input: false` on the `role` field).~~ **✅ FIXED.** Added `input: false` to the `role` additionalField in `src/auth/index.ts`. Verified live against the dev server: `POST /api/auth/sign-up/email` with `role:"admin"` in the body now silently ignored (creates with default `role:"user"`), and `POST /api/auth/update-user` with `role:"owner"` now explicitly rejected (`FIELD_NOT_ALLOWED`). Test account created during verification was deleted from the DB afterward. See §6.
- **One open question blocks several Phase 2 fixes:** DATA-00 — the resume shows your Swirepay role ending "Jun 2026" (today is 2026-07-11) but the site says you're still there. Need your confirmation before touching current-employer messaging. See §2.
- **Root cause of the layout complaints is identified and narrow:** a `--breakpoint-sm: 350px` override breaking the mobile-first cascade, three different container widths used across sections, and zero `2xl:` grid scaling. See §3.
- **Data drift confirmed:** the local dev DB is byte-identical to the original one-time seed script — nothing has been updated via the admin panel since the resume moved on. Title, bio, skills, certifications, and experience all need reconciling. See §2.
- **Quick wins:** delete a 213MB unreferenced duplicate asset folder, fix broken lint tooling (`next lint` doesn't run on Next 16; `@typescript-eslint/*` wasn't installed), add the missing `zod`/`sharp` dependencies that currently only resolve by luck. See §4/§7.
- **`tsc --noEmit` is clean (0 errors)** — TypeScript hygiene is good.

---

## 0. Scope Correction (read this first)

`audit.md` (the original brief) and `Blueprint.md` §13.3 describe this project as a simple, mostly-static portfolio (`src/data/portfolio.config.ts` as the single hardcoded source of truth, no admin CRUD beyond messages/comments). **That is no longer accurate.** The actual codebase is a fully domain-driven, multi-tenant platform:

- `src/domains/{profile,accounts,resume,jobs,career,interview,analytics,knowledge,devops-toolkit,blog}/`
- `src/db/schema/{profile,accounts,resume,jobs,career,interview,analytics,knowledge,auth,legacy}.ts` (Drizzle ORM over Turso/LibSQL)
- Better Auth (`better-auth ^1.6.18`) protecting `/admin` (owner/admin) and `/account` (end users)
- Next.js `^16.2.9` (already upgraded from 15), `@ai-sdk/google` (AI Gateway pattern already in place under `src/ai/`)
- `portfolio.config.ts` **no longer exists** — fully retired, zero references in `src`
- Admin has 20 tabs (Profile, Skills, Experience, Certifications, Projects, Social Links, Site Settings, Users, Job Preferences, Job Matches, Analytics, Blog, Comments, Messages, Subscribers, KT Documents, KT Categories, Media Library, Overview, Dashboard Home) — full CRUD already built for the profile domain

Consequence: audit.md's Phase 2 premise ("locate hardcoded resume data across components/config/DB seed and reconcile") only partially applies — most public sections *do* read from the DB dynamically. But the **audit still found real, serious data-accuracy problems** — see §2 below — because the DB itself was never updated after the resume was refreshed, and at least one component (`HeroText.tsx`) is dead/hardcoded and a second (`HeroMain.tsx`) hardcodes two stat values instead of deriving them.

`Blueprint.md` §13.5 "Living Status" fields are stale (`TBD`) and should be updated once this audit's fixes land.

---

## 1. Phase 0 — Codebase Inventory

### 1.1 Route map (`src/app/`)
`/` (home), `/admin` (+ `/admin/login`), `/account`, `/architecture`, `/blog`, `/blueprints`, `/career-progress`, `/certifications`, `/devops-toolkit`, `/monitoring-demo`, `/profile`, `/projects`, `/recruiter`, `/services`, `/skills`, plus `/api/**` (see §1.3).

### 1.2 Domain/component map
- **Profile domain** (`src/domains/profile/`): hero, about, skills, experience, projects, certificates, contact, navbar, footer, subHero, achievements, recruiter view — `services/profile.service.ts` provides typed CRUD + `calcExperience()` auto-calculator (years-of-experience is *supposed* to be fully derived — see finding DATA-05).
- **Accounts domain**: Account Centre shell, job-preferences settings.
- **Resume / Jobs / Career / Interview domains**: Tier-2 (Account Centre) features — resume studio, job matching, career advisor, interview lab.
- **Analytics domain**: GitHub stats, admin analytics.
- **Knowledge domain**: KT Centre (49 DevOps PDFs + DB-backed uploads).
- **Devops-toolkit domain**: generators (Nginx/Docker/CI-CD/etc.), architecture showcase.
- **Blog domain**: MDX blog + comments + newsletter.
- `src/components/ui/` — shared primitives (shadcn-style). `src/components/admin/ImageUploader.tsx` — shared upload widget.

### 1.3 API route map (`src/app/api/`)
`account/{career,interview,job-matches,jobs,preferences,profile-import,resume}`, `achievements`, `admin/{analytics,blog,certifications,experiences,job-matches,job-preferences,kt-documents,media,profile,projects,route,seed-kt,site-settings,skills,social-links,upload-image,users,visibility}`, `analytics/pageview`, `auth/[...all]` (Better Auth), `chat`, `comments[/id]`, `contact`, `cron/ingest-jobs`, `devops/{architecture,evaluate}`, `kt-documents[/id]`, `kt-search`, `kt-upload`, `recruiter/signup`, `subscribe`.

### 1.4 Config / data files
- `portfolio.config.ts` — **retired**, does not exist.
- Data source of truth: Turso/LibSQL DB (`profile_domain` tables), local dev mirror at `portfolio.db` (SQLite file, `DATABASE_URL=file:./portfolio.db` in `.env`). Production uses a separate Turso remote (`libsql://msportfolio-prod-mohan6201.aws-ap-south-1.turso.io` referenced in `.env` comments / `.vercel/.env.production.local`) — **local `portfolio.db` and production Turso may have diverged independently since both are admin-editable**; this report's DB findings are from the local file only (see finding ARCH-01 in §6 once compiled).
- `scripts/seed-profile.ts` — one-time seed script. Confirmed **byte-identical in content** to what's currently in local `portfolio.db` (only autoincrement IDs differ) — i.e. **nothing has been edited via the admin Profile/Experience/Skills/Certs/Projects tabs since the original seed**, despite the resume having moved on significantly.
- Resume: `public/resume/Mohana_Srinivasan_Resume.pdf` — only resume file in repo, referenced by `profiles.resumeUrl`. This is the accurate, up-to-date source per the user.

---

## 2. Phase 2 — Resume vs. Portfolio Data Accuracy (findings)

**Source of truth:** `public/resume/Mohana_Srinivasan_Resume.pdf` (latest, user-confirmed accurate).
**Compared against:** live local DB content (`portfolio.db`, tables `profiles`/`experiences`/`skills`/`certifications`/`projects`), which — per §1.4 — is identical to `scripts/seed-profile.ts`, and against hardcoded UI strings found during inventory.

### DATA-00 — ⚠️ Needs your confirmation before any fix (Critical, blocks other fixes)
The resume lists the Swirepay role as **"AWS DevOps Engineer, Nov 2025 – Jun 2026"** (i.e. an end date, not "Present"). Today's date is 2026-07-11 — after that end date. The DB has `experiences.is_current = true`, `end_date = null` for Swirepay, and `profiles.current_company = "Swirepay"`, and the homepage hero/terminal/SEO metadata all say "currently at Swirepay" / "Available for DevOps opportunities."
**Question:** Have you actually left Swirepay? If yes, `current_company`/`current_designation`/`is_current` and all "currently at X" copy need to change to your latest role (or to a general "open to work" framing with Swirepay as most-recent). If the "Jun 2026" end date on the resume is a template/formatting bug, the resume itself may need fixing instead. This determines the correct fix for DATA-01, DATA-04, and the SEO metadata finding below — **do not proceed with those fixes until this is resolved.**

### DATA-01 — Job title / designation mismatch (High)
- `profiles.title` = `"DevOps Engineer"`; `profiles.currentDesignation` = `"DevOps Engineer"`; `HeroText.tsx` (dead file, see DATA-06) hardcodes `"AWS DevOps Engineer"`; `HeroMain.tsx` line 148 renders `{profile.title} • {profile.currentCompany}` (dynamic, reads DB).
- Resume header tagline: **"DevOps & Cloud Infrastructure Engineer"**. Resume experience-section title for the Swirepay role: **"AWS DevOps Engineer"**.
- `src/app/layout.tsx` SEO metadata keywords include `"DevOps Engineer"` (line 30) and JSON-LD `jobTitle: "AWS DevOps Engineer"` (line 66) — internally inconsistent with `profiles.title`.
- **Fix:** once DATA-00 is resolved, set `profiles.title` to match the resume's chosen brand tagline, and make sure `layout.tsx` metadata pulls the same string rather than a separately hardcoded one.

### DATA-02 — Bio / summary completely out of date (High)
- DB `profiles.bio`: *"AWS DevOps Engineer building scalable cloud infrastructure, CI/CD pipelines, and automated delivery systems."*
- Resume summary is far richer and more current: 4 years IT experience, Windows Server/Hyper-V background, Swirepay fintech specifics, "reduced CI/CD build time by 75%", Prometheus/Grafana/Loki/Tempo observability stack built from scratch.
- **Fix:** rewrite `profiles.bio` (via Admin → Profile tab, once the app is running) to reflect the resume summary, condensed for a hero/about-page context.

### DATA-03 — Skills list drifted (Medium-High)
DB skills (15 rows, cloud/devops/backend/monitoring categories) vs. resume's technical-skills list:
- **On resume, missing from DB entirely:** Windows Server, Hyper-V, IIS, CodeBuild, Loki, Tempo, OTel Collector, Lambda, Nginx, Jira, Confluence, Agile/Scrum, ServiceNow.
- **In DB, not on resume (verify still relevant / deprioritize):** Ansible, GitHub Actions, Jenkins CI, Bash Shell Scripting, Django, React/Next.js. (Some of these — e.g. React/Next.js — may be legitimately kept as "used to build this portfolio" evidence even though they're not on the resume; use judgment rather than deleting wholesale.)
- Also: `HeroMain.tsx` `TECH_BADGES` (lines 18–25) and `TerminalBlock`'s `$ cat stack.sh` line (line 36) hardcode a **separate, third** tech list ("AWS · Docker · Terraform · GitHub Actions · Ansible · Jenkins") that matches neither the DB skills nor the resume exactly.
- **Fix:** reconcile DB `skills` table to the resume list (add missing, decide fate of extras), then make `HeroMain.tsx`'s badges/terminal line derive from the same `skills` data instead of a third hardcoded array.

### DATA-04 — Experience timeline structure mismatch (Medium, tied to DATA-00)
- Resume presents the Swirepay tenure as **one line, "Nov 2025 – Jun 2026"**; DB has it as `"SEP 2025"` → current, no end date. Start month differs (Nov vs Sep) in addition to the end-date question in DATA-00.
- Resume consolidates the entire Enterprise Soft Labs tenure (Apr 2022 – Aug 2025) into **one role**, "Infrastructure & Cloud Engineer," describing Windows Server/Hyper-V/IIS/WMS/AWS work together. DB models this as **three separate roles** (Trainee Consultant → Staff Consultant → AWS DevOps Engineer) with different titles and narrower responsibility bullets per stage.
- Neither structure is "wrong," but they tell different stories — worth a deliberate choice: keep DB's more granular promotion history (arguably better for a portfolio — shows growth) but update the *content* of each stage to match resume's richer detail, or collapse to match the resume 1:1. Recommend keeping the granular version but enriching each stage's `responsibilities` with resume detail (Windows Server 2019/2022 install-from-scratch, Hyper-V VM provisioning, IIS app-pool/SSL config are currently missing from any DB row).
- Resume also lists two pre-2022 "Site Engineer" roles (civil engineering, 2018–2021) explicitly separated from "4 years of IT experience" — these are correctly **absent** from the DB; recommend leaving them out of the DevOps-focused portfolio (confirm with you, but this looks intentional on the resume's part, not an omission).

### DATA-05 — Hero stat cards hardcoded, contradict real data (High)
`HeroMain.tsx` lines 224–237, the "Stat cards" grid:
```
{ value: yrsNum, ... label: "Years Exp." }   // ✅ dynamic — derived from calcExperience()
{ value: 10, suffix: "+", label: "Projects" } // ❌ hardcoded — DB has 4 projects
{ value: 3,  suffix: "",  label: "Certs" }    // ❌ hardcoded — DB has 4 certifications, resume implies 5
```
Also `TerminalBlock` line 37: `` `${yearsOfExperience} in production  •  10+ shipped projects` `` — same hardcoded "10+" bug repeated in a second place.
**Fix:** derive `Projects` and `Certs` counts from `projects.length` / `certifications.length` (already fetched in `getAllProfileData()`, just not threaded through to `HeroMain`), matching the "no hardcoded content" Golden Rule the Blueprint itself specifies.

### DATA-06 — Dead component, doubly-hardcoded (Medium, also a Phase-6 cleanup item)
`src/domains/profile/components/heroSection/HeroText.tsx` is **never imported anywhere** (confirmed via repo-wide grep — only self-references). It hardcodes `"AWS DevOps Engineer"`, a "3.5 years..." blurb, and stats `3.5+ Years / 10+ Projects / AWS Certified` — all stale and all dead code. Safe to delete in Phase 6 (not referenced, so zero risk).

### DATA-07 — Certifications: one missing entirely, one stale, one issuer-name inconsistency (Medium-High)
- DB has **"DevOps Certified Expert (In-Progress)"**, issuer "Guvi", dated 2025-05-17. Resume shows this program has since **completed and split into two distinct entries**: "Advanced DevOps & Cloud Engineering Program" (GUVI Geek Network, Grade A, Jan 2026) and "DevOps Program" (GUVI x HCL, May–Oct 2025). The DB's single in-progress row is now outdated on two counts (no longer in-progress, and undercounts by one cert).
- Issuer name mismatch: DB `"RedSys9 Tech Pvt Ltd"` vs resume `"Red9SysTech"` for the AWS Solutions Architect Associate cert — pick the correct legal/brand name (resume presumably more recently verified) and use it consistently.
- Date mismatch: DB has Körber "Warehouse Advantage Certified Associate" dated `2023-09-09`; resume shows `Sep 2025` for the same cert. One of these is wrong — flag for you to confirm which date is correct (2023 aligns better with the Körber-era work history 2022–2023, so 2025 on the resume may be a typo, but don't assume).
- **Fix:** replace the single stale GUVI row with the two resume-accurate rows, correct the issuer name, and confirm/correct the Körber date with you before changing it.

### DATA-08 — "CareerOS" project entirely missing from the live portfolio (Medium)
Resume's Projects section headlines **"CareerOS — AI-Powered Professional Intelligence Platform (in development)"** — described as a solo-designed AI-native career platform (Google ADK + LangGraph, Kubernetes/ArgoCD, Dockerized Django+React MVP). This project does not exist anywhere in the DB `projects` table or on the public `/projects` page. Given it's the resume's lead project, its absence undersells current work. Recommend adding it (marked "in development" per the resume) once you confirm the description is safe to publish publicly (e.g. no confidential employer IP).

### DATA-09 — SEO/JSON-LD metadata inherits the same staleness (Medium, depends on DATA-00/01)
`src/app/layout.tsx`: description says "currently at Swirepay" (line 28) and JSON-LD `jobTitle: "AWS DevOps Engineer"` (line 66) — both should be re-derived once DATA-00/DATA-01 are resolved, ideally from the same profile data rather than a fourth hardcoded copy.

---

## 3. Phase 1 — Responsive & Layout

### Root cause (read first)
Three compounding structural issues explain essentially all reported symptoms:
1. **`globals.css:37`** sets `--breakpoint-sm: 350px`, overriding Tailwind's default (640px) while `md`/`lg`/`xl`/`2xl` stay default. Every `sm:` utility in the codebase — used pervasively as the "make it look right" step — fires almost immediately on real phones instead of at true tablet width, breaking the mobile-first cascade site-wide.
2. **No shared container.** Scrolling one page, the horizontal container alternates with no shared constant: `max-w-7xl` (Navbar, Hero, About, Skills, Projects, Certificates, Resume, Career, GitHub Stats, Knowledge Base, Footer, SubHero), `max-w-6xl` (Pipeline Strip, Achievements, Services, Contact), `max-w-5xl` (Experience) — all `mx-auto`. The content edge visibly jumps 64–128px per side between sections. This is the direct cause of "broken alignment."
3. **No `2xl:` scaling anywhere** (zero matches repo-wide) — Skills/Projects/Certifications/Services/Achievements grids all cap their column count at `lg`/`xl` and never add more at `2xl`, and since containers cap at `max-w-7xl` (1280px) regardless of viewport, a 1920px+/ultrawide monitor just gets dead margin past 1280px.

**Recommended fix direction:** one shared `Container` component/class used by every section+navbar+footer; revert or rename `--breakpoint-sm` (e.g. to `--breakpoint-xs`) and re-audit `sm:` usages against actual intent; add `2xl:grid-cols-*` steps and consider widening grid containers on ultrawide.

### Findings
| # | File:Line | Issue | Severity |
|---|---|---|---|
| L01 | `globals.css:37` | `--breakpoint-sm: 350px` override breaks mobile-first cascade site-wide | Critical |
| L02 | `page.tsx:59-75` (container survey) | Three different container widths (`max-w-7xl`/`6xl`/`5xl`) across sections, no shared constant | High |
| L03 | `FooterMain.tsx:32`, `PipelineStrip.tsx:114` | Padding scale (`px-4 sm:px-6` only) doesn't match the `lg:px-8` used elsewhere, gutters misalign at `lg`+ | Medium |
| L04 | `SkillsMain.tsx:117` | Grid caps at `xl:grid-cols-4`, no `2xl:` step; combined with `max-w-7xl` container, dead space on ultrawide | High |
| L05 | `ProjectsMain.tsx:109` | Grid caps at `xl:grid-cols-3`, never reaches 4 cols despite container width allowing it | Medium |
| L06 | `CertificateMain.tsx:173` | Grid caps at `lg:grid-cols-4`, no `xl`/`2xl` bump | Low-Medium |
| L07 | `AchievementsSection.tsx:21`, `ServicesSection.tsx:72`, `CareerCentreSection.tsx:66` | Same capped-grid pattern, no `2xl:` | Low |
| L08 | `layout.tsx:90` | `overflow-x-hidden` on `<body>` — band-aid masking real overflow source | High |
| L09 | `SkillsMain.tsx:78`, `AboutMeMain.tsx:23`, `ProjectsMain.tsx:87`, `ExperienceMain.tsx:35` | Additional per-section `overflow-x-hidden` — three suppression layers signal unfixed overflow bugs (also risks clipping intentional sticky/glow effects) | Medium |
| L10 | `HeroMain.tsx:125-127` | Fixed-px decorative glow blobs (`w-[700px]`/`w-[500px]`/`w-[800px]`) with negative offsets, saved only by parent `overflow-hidden` rather than responsive sizing | Low |
| L11 | `ExperienceTopLeft.tsx:5` | `w-[300px]` fixed width, no responsive variant | Low |
| L12 | `GitHubStats.tsx:290` | `min-w-[600px]` inside `overflow-x-auto` — acceptable (scrolls) but forces horizontal scroll on phones | Low |
| L13 | `HeroMain.tsx` badges, `SubHeroMain.tsx:9` | `whitespace-nowrap` on user-editable-length strings with no wrap fallback — clipping risk at smallest widths | Low |
| L14 | `NavbarMain.tsx:98-101` | Mobile menu toggle button works (keyboard-accessible by default) but has no `aria-label`; panel has no `aria-expanded`/`aria-controls` | Medium |
| L15 | `NavbarToggler.tsx` (whole file) | Second, unused hamburger implementation (Zustand `useMenuStore`) — dead code, risk of future confusion | Low |
| L16 | `HeroMain.tsx:86` | Terminal card `min-h-[260px] sm:min-h-[230px]` — given L01, `sm:` fires early; worth a manual 320px check alongside the typewriter animation | Low |
| L17 | `HeroMain.tsx:206-213`, `AboutMeMain.tsx:117`, `ProjectsMain.tsx:18-23`, `CertificateMain.tsx:44,122` | Zero `sizes` props on any `fill`-mode `next/image` (5 usages, repo-wide) — forces oversized mobile downloads, hurts LCP | Medium |
| L18 | `layout.tsx` | No `export const viewport` defined anywhere — relying on Next.js framework default instead of an explicit declaration | Medium |

---

## 4. Phase 3 — Code Quality & Architecture

### Tooling health
- **`npx tsc --noEmit`: 0 errors.** Clean.
- **`next lint` (the `package.json` `"lint"` script) is broken** — errors outright on Next 16 ("Invalid project directory"). `npx eslint .` also failed initially because `@typescript-eslint/parser`/`@typescript-eslint/eslint-plugin` are declared in `package.json` but weren't actually installed in `node_modules`. After `npm install`, scoped `npx eslint src` (unscoped `.` was inflated ~3x by 4 stale `.claude/worktrees/agent-*` copies of `src/`, ~1.86GB, left over from earlier agent sessions — not git-tracked, but skews any repo-wide tool run) gives the real picture: **40 problems, 0 errors, 40 warnings** — 25 `@typescript-eslint/no-unused-vars`, 15 `no-console` (mostly in `api/**/route.ts` handlers).
- `package.json` has **duplicate `devDependencies` keys**: `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` each listed twice (lines 56-57 and 66-67).

| # | Finding | Severity |
|---|---|---|
| Q01 | `"lint"` script (`next lint`) doesn't run on Next 16 — CI/local lint is effectively disabled | High |
| Q02 | `@typescript-eslint/parser`/`-plugin` in `package.json` but missing from `node_modules` as checked out — lint tooling non-functional until `npm install` | High |
| Q03 | `zod` used in 6 files (`src/ai/schemas/*`, `src/ai/agents/*`) but never declared in `package.json` — only resolves as a phantom/hoisted transitive dep; a lockfile change upstream could break the build | High |
| Q04 | `sharp` used in 3 build scripts (`scripts/{process,extract}-icons.mjs`, `extract-ico.mjs`) but undeclared | Medium |
| Q05 | `package.json` duplicate `devDependencies` keys for `@typescript-eslint/*` | Low |
| Q06 | `depcheck`: unused deps `@google/generative-ai`, `@tailwindcss/postcss`, `shadcn`, `tw-animate-css` (verify before removing — some may be CLI-only tools) | Low |

### Dead/duplicate code
| # | Finding | Severity |
|---|---|---|
| Q07 | `src/components/ui/CommandPalette.tsx` — imported in `layout.tsx:8` but never rendered anywhere | Medium |
| Q08 | `src/components/ui/NewsletterSignup.tsx` — defined/exported but imported nowhere | Medium |
| Q09 | `src/app/admin/AdminDashboard.tsx:23,30` — same `AnalyticsTab` component imported twice under two names (`AnalyticsTab` and unused `AnalyticsTabNew`) | Low |
| Q10 | `src/domains/profile/components/heroSection/HeroText.tsx` — dead, see DATA-06 in §2 | Medium |
| Q11 | `src/domains/profile/components/navbar/NavbarToggler.tsx` — dead, see L15 in §3 | Low |
| Q12 | `HeroPic.tsx`, `HeroImage.tsx`, `AboutMeImage.tsx`, `SkillsCircle.tsx`, `SubSkills.tsx` — dead, see P07 in §5 | Low |

### Duplicate logic (candidates for consolidation into `src/lib/`)
- **Three near-identical auth-check helpers** — `src/lib/adminAuth.ts` `requireAdmin()`, `src/lib/accountAuth.ts` `requireUser()`, `src/lib/recruiterAuth.ts` `requireRecruiter()` — all call `auth.api.getSession()`, do an identical role cast, and return the same `{ session, error }` shape. Collapsible into one `requireRole(req, allowedRoles?)`.
- **Inline date formatting repeated ad hoc across 15 files** (e.g. `SubscribersTab.tsx:33`, `CommentsTab.tsx:49`, `MessagesTab.tsx:43` all call `new Date(x).toLocaleDateString()`/`.toLocaleString()` independently) — no shared formatter, no guaranteed locale/timezone consistency.
- **Image upload is already well-consolidated** (positive finding) — `ImageUploader.tsx` → single `upload-image` endpoint, reused across admin tabs. No action needed.

### Client/server boundaries
93 files start with `"use client"`. Spot-check found no blatant misuse, but a consistent architectural pattern: Framer Motion is used for purely decorative entrance animations on otherwise-static content (e.g. `CertificateText.tsx` — a static `<h2>Certificates</h2>` dragged into the client bundle just for a fade-in), pulling many subtrees client-side that could be server components if entrance animation moved to CSS. Not a bug, but a real bundle-size lever — ties into P04/P05 in §5.

### API route hygiene
| # | Finding | Severity |
|---|---|---|
| Q13 | **Zero Zod/schema validation anywhere under `src/app/api/**`** (confirmed via grep) — every route does `req.json()` straight into a Drizzle insert/update. `zod` is already a (phantom) dependency used in `src/ai/schemas/`, so this is a real gap, not a tooling absence | High |
| Q14 | Inconsistent success-response envelope — some routes return `{ data: ... }`, others return the raw payload directly; no consumer-facing contract | Medium |
| — | Auth gating and error-response shape (`{ error: string }` + status code) are consistently applied — **pass** | — |
| — | `upload-image/route.ts` is the most defensive route in the sample (MIME allowlist, size cap, path-traversal sanitization) — good template for the others | — |

### Hardcoded design tokens
**Q15 — 1046 raw hex-color occurrences across 59 `.tsx` files**, despite the codebase standardizing on a Tailwind theme. Heaviest: `ResumeStudio.tsx` (129), `CertificationsTab.tsx` (56), `KTDocumentsTab.tsx` (55), `MockInterview.tsx` (39), `BlueprintTemplate.tsx` (25). Even the shared `ImageUploader.tsx` inlines hex via `style={{ backgroundColor: ... }}`. **Severity: Medium** (cosmetic/maintainability, not a bug, but large enough to be worth a token-consolidation pass rather than one-off fixes).

## 5. Phase 4 — Performance, SEO, Accessibility

### Performance
| # | File:Line | Issue | Severity |
|---|---|---|---|
| P01 | `next.config.ts:5-9` | `remotePatterns` covers Clearbit + Vercel Blob (matches usage) but provides no protection for images that bypass `next/image` entirely — see P02 | Low |
| P02 | `GitHubStats.tsx:199-203,287-291`, `CertificateLogo.tsx:37-41` | GitHub avatar, `ghchart.rshah.org` contribution chart, Clearbit logos all use raw `<img>` instead of `next/image` — zero optimization/lazy-load/CLS protection | Medium |
| P03 | `NavbarLogo.tsx:25-37`, `NavbarMain.tsx:41-45` | Site logo — rendered above the fold on every page — uses raw `<img>`, likely the LCP element on non-hero pages, no `priority`/preload | Medium |
| — | `layout.tsx:2,15-22` | Fonts via `next/font/google` with `display: swap`, no manual `<link>`/`@import` — **pass, no finding** | — |
| P04 | `layout.tsx:91-100` | `PDFViewerProvider`, `ChatWidget`, `CursorGlow`, `ScrollProgress`, `BackToTop`, `CommandPalette` all eagerly mounted client components on every route (incl. `/admin`); zero `next/dynamic` usage anywhere in the repo | Medium |
| P05 | 30 files importing `framer-motion` | Full `motion`/`AnimatePresence` API imported directly rather than tree-shakeable `LazyMotion`/`m` pattern | Low-Medium |
| — | `HeroMain.tsx:207-213` | LCP hero avatar correctly uses `next/image` with `priority`+`fill` — **pass** | — |
| P06 | `devops-toolkit/page.tsx:2,28` | 9 generator components (`InfraPlayground`, `AWSArchitectGenerator`, etc.) all imported eagerly with no tab-based lazy loading — ships all 9 tools' JS to view one | Medium |
| P07 | `HeroPic.tsx`, `HeroImage.tsx`, `AboutMeImage.tsx`, `SkillsCircle.tsx`, `SubSkills.tsx` | Dead, unimported components shipping unoptimized `<img>` markup — Phase 6 deletion candidates | Low |

### SEO
| # | File:Line | Issue | Severity |
|---|---|---|---|
| S01 | (missing) | No `src/app/sitemap.ts`/`robots.ts`, no static equivalents — search engines can't discover `/blog/[slug]`, `/projects`, etc., and have no crawl directives | **Critical** |
| S02 | `layout.tsx:58` | Global `robots: { index: true, follow: true }` applies site-wide; combined with S01, `/admin/**`, `/account/**`, `/recruiter/**` have no `noindex` override and are crawlable/indexable by default | High |
| — | `layout.tsx:24-59`, per-page metadata | Root metadata well-formed (title/description/OG/Twitter/Person JSON-LD); most static routes have per-page overrides; `blog/[slug]` uses `generateMetadata` — **mostly pass** | — |
| S03 | (repo-wide) | Zero `alternates.canonical` usage anywhere despite `metadataBase` being set — no protection against duplicate-content indexing | Medium |
| S04 | `blog/[slug]/page.tsx:16-30` | `generateMetadata` has no `openGraph.images` or per-post canonical (falls back to generic OG image) | Low |
| — | `opengraph-image.tsx` (root + blog) | Both correctly wired via file convention — **pass** (note: uses cyan `#15d1e9`, not the site's green accent — cosmetic only) | — |

### Accessibility
| # | File:Line | Issue | Severity |
|---|---|---|---|
| A01 | `NavbarLogo.tsx:39` **and** `HeroMain.tsx:149-156` | Two `<h1>` elements on the homepage (nav renders one `hidden md:block` — still in the DOM/AX tree — plus Hero's) | High |
| — | Section components (`AboutMeMain.tsx:37`, `ExperienceMain.tsx:45`, `SkillsMain.tsx:88`, etc.) | Heading hierarchy otherwise sound, one `<h2>` per section + `<h3>` for cards — **pass** | — |
| A02 | `globals.css:9-29` | Color tokens well-defined; informational note: the dominant interactive accent is actually **cyan** (`#00d4ff`), not terminal-green — green is used sparingly. Worth knowing since the original brief assumed green as primary | Low (informational) |
| A03 | `globals.css:243` (`.terminal-output`) + multiple `placeholder-[#444]`/`placeholder-[#374151]` on dark inputs (`account/login/page.tsx:165`, `admin/tabs/ProfileTab.tsx:13`) | Borderline/likely-failing contrast ratios against near-black backgrounds — needs a contrast-checker pass | Medium |
| A04 | `account/login/page.tsx:165,187`, `admin/tabs/ProfileTab.tsx:13`, `AdminDashboard.tsx:214`, `KnowledgeBase.tsx:278,284,288,363`, `CommandPalette.tsx:72`, `ResumeStudio.tsx:690,705,734,798` | `focus:outline-none` with either no replacement or only a low-opacity border-color change — likely fails WCAG 2.4.11 focus-visibility | High |
| A05 | `NavbarMain.tsx:55-74,116-129` | Primary nav links have `hover:` styling only, no `focus:`/`focus-visible:` — relies on possibly-invisible UA default outline on dark theme. (Contrast: `components/ui/button.tsx:7` does this correctly with `focus-visible:ring-3`) | Medium |
| — | Image alt text (repo-wide) | No images missing `alt`; decorative images correctly use `alt="" aria-hidden`. Two weak/generic alts found only in already-dead components | Low |
| A06 | `NavbarMain.tsx:98-101` | The mobile nav toggle **actually used on the live site** has no `aria-label`/`aria-expanded`/`aria-controls` — only a visual icon swap communicates state. (A separate unused `NavbarToggler.tsx` has partial ARIA but isn't imported anywhere — see Phase 6) | High |
| A07 | (repo-wide) | Zero `role="tab"`/`aria-selected`/`aria-controls` anywhere — admin dashboard tab bar and any filter UIs give screen readers no indication of tab semantics/active state | Medium |
| A08 | (repo-wide) | `prefers-reduced-motion` never checked or respected anywhere, despite Framer Motion in 30 files including always-on effects (`CursorGlow`, `ScrollProgress`, `NavbarLogo` pulse, `BackToTop`) | High |

## 6. Phase 5 — Security

### ✅ SEC-01 — Privilege escalation: `role` is client-settable via Better Auth (CRITICAL — FIXED)
**File:** `src/auth/index.ts:74-82` (config), exploitable through the stock Better Auth endpoints at `src/app/api/auth/[...all]/route.ts`.

**Status: Fixed and verified live.** Added `input: false` to the `role` additionalField. Confirmed against a running dev server: sign-up with `role:"admin"` in the body now creates the account with `role:"user"` (default) instead; update-user with `role:"owner"` now returns `{"message":"role is not allowed to be set","code":"FIELD_NOT_ALLOWED"}`. The verification test account was deleted from the DB afterward.

`user.additionalFields.role` is declared with `type`/`defaultValue`/`required` but **no `input: false`**. Better Auth only strips a field from client input when `input: false` is set — since it's missing, `role` is accepted as-is from request bodies:
- `POST /api/auth/sign-up/email` with `{ name, email, password, role: "admin" }` creates a new account **already owning admin**.
- `POST /api/auth/update-user` with `{ role: "owner" }`, sent by **any** logged-in session (including a brand-new `/account` or `/recruiter` signup), self-promotes to owner.

This silently defeats every `requireAdmin`/`requireUser` check across all 25 `/api/admin/**` routes and all 19 `/api/account/**` routes audited in SEC-02/03 below — those routes' own auth logic is correct, but they all trust `session.user.role`, which an attacker sets themselves before ever calling them. **This is a full admin-account-takeover path reachable by anyone who can sign up, with no exploit tooling beyond a single crafted HTTP request.**

**Fix:** add `input: false` to the `role` additionalField in `src/auth/index.ts`; perform all role changes exclusively through the existing admin-gated route (`src/app/api/admin/users/[id]/route.ts`), which already has an allowed-role allowlist and owner-immutability logic.

### Other findings
| # | File:Line | Issue | Severity |
|---|---|---|---|
| SEC-02 | `src/app/api/account/resume/[id]/versions/route.ts:47-48` | IDOR: `PATCH` validates the parent resume belongs to the caller, but `versionId` from the request body is passed straight to `updateVersionData` with no check that the version belongs to that resume — any authenticated user can overwrite another user's resume version by guessing a numeric ID | High |
| SEC-03 | `src/app/api/cron/ingest-jobs/route.ts:8-14` | Cron-secret check is skipped entirely (not enforced) if `CRON_SECRET` is unset — `.env.example` ships it blank by default. If unset in the production Vercel env, the route (which burns paid Adzuna/JSearch/AI-scoring quota) is open to anyone who finds the URL. **Verify `CRON_SECRET` is actually set in Vercel Project Settings.** | High (conditional on prod config) |
| SEC-04 | `src/domains/interview/services/interview.service.ts:30-39` | `updateInterview(id, userId, data)` accepts `userId` but never uses it in the `where` clause — currently safe only because the one caller pre-validates ownership separately; a future/alternate call site would be an instant IDOR | Medium |
| SEC-05 | `src/app/api/recruiter/signup/route.ts` | No rate limiting on public signup — unlimited account-creation/password-guessing attempts | Medium |
| SEC-06 | `src/app/api/comments/route.ts:12-34` | Public comment POST has no rate limiting (contact/subscribe/chat all do) | Medium |
| SEC-07 | `src/app/api/kt-search/route.ts`, `src/app/api/devops/architecture/route.ts`, `src/app/api/devops/evaluate/route.ts` | Unauthenticated endpoints that trigger paid LLM/embedding calls with no rate limiting — cost-exhaustion / DoS risk | Medium |
| SEC-08 | `src/app/api/admin/upload-image/route.ts:10` | `image/svg+xml` allowed based on client-declared MIME type (not content-sniffed) — stored-XSS risk if an SVG with an inline `<script>`/event handler is later rendered inline rather than downloaded | Low-Medium |
| SEC-09 | `.env.example:63` | Documents `ADMIN_SECRET` as gating `/api/admin` routes, but the code never reads it (confirmed dead) — stale/misleading, could mislead a future dev into thinking there's a secondary gate | Low |
| SEC-10 | `src/auth/index.ts` | No explicit cookie-hardening block (`httpOnly`/`secure`/`sameSite`) — relies on Better Auth library defaults, which are correct, but it's implicit rather than declared | Low (informational) |

### Confirmed clean (no finding)
- All 25 `/api/admin/**` routes call `requireAdmin()` (real server-side session lookup) before doing anything; no route uses the legacy `?secret=` pattern.
- 17 of 19 `/api/account/**` routes correctly scope every query to `session.user.id` (the 2 exceptions are SEC-02/SEC-04 above).
- File upload routes (`upload-image`, `kt-upload`, `account/resume/upload`) all validate type + size server-side, not just via client `accept=`.
- No `NEXT_PUBLIC_`-prefixed secret exposure; no hardcoded API keys/tokens in source.
- `.gitignore` correctly excludes `.env*`/`portfolio.db*`; full git history confirms neither was ever committed.
- `seed-kt` and all `scripts/seed-*.ts` are either admin-gated or unreachable over HTTP.

## 7. Phase 6 — Cleanup & Restructure Candidates

The domain-driven restructure described in `Implementation_plan.md` §3/§7 has **already happened** — `src/domains/*`, `src/db/schema/*`, `src/ai/*` all exist and match the target shape. This is not a ground-up restructure; it's targeted cleanup on top of an already-good structure.

### Safe deletions (zero references confirmed via repo-wide grep)
| Item | Size/Detail |
|---|---|
| `public/Resource Images/Documents/` | **213MB**, byte-for-byte duplicate of `public/resources/docs` (same filenames/sizes); nothing in `src/` references `Resource Images` at all — highest-leverage single cleanup in this whole audit |
| `src/domains/profile/components/heroSection/HeroText.tsx` | Dead, hardcoded, superseded by `HeroMain.tsx` (DATA-06) |
| `src/domains/profile/components/navbar/NavbarToggler.tsx` | Dead, superseded by `NavbarMain.tsx`'s inline toggle (L15) |
| `src/components/ui/CommandPalette.tsx` | Imported but never rendered (Q07) |
| `src/components/ui/NewsletterSignup.tsx` | Imported nowhere (Q08) |
| `HeroPic.tsx`, `HeroImage.tsx`, `AboutMeImage.tsx`, `SkillsCircle.tsx`, `SubSkills.tsx` | Dead, unoptimized `<img>` (Q12/P07) |
| `AdminDashboard.tsx` duplicate `AnalyticsTabNew` import | Dead alias (Q09) |
| `.claude/worktrees/agent-*` (4 dirs, ~1.86GB) | Not git-tracked, but local disk hygiene — leftover from prior agent sessions, worth clearing manually outside of git |

### Config hygiene
- Fix `package.json` duplicate `devDependencies` entries (Q05).
- Add missing `zod` and `sharp` to `dependencies` (Q03/Q04) — currently phantom/hoisted, a supply-chain-adjacent risk if the transitive resolution ever changes.
- Fix or replace the `"lint"` script — `next lint` doesn't run on Next 16 (Q01).
- Remove or wire up the stale `ADMIN_SECRET` entry in `.env.example` (SEC-09).
- Verify the 4 `depcheck`-flagged "unused" deps (`@google/generative-ai`, `@tailwindcss/postcss`, `shadcn`, `tw-animate-css`) before removing — `shadcn` in particular is likely a CLI-only dev tool, not dead code.

### Naming/structure — already consistent
No `-old`/`-v2`/`copy`/`temp`/`.bak` files found anywhere (checked repo-wide). Domain folder structure already matches the target shape from `Implementation_plan.md` §3. **No large-scale file-moving restructure is warranted or recommended** — doing one now would be pure churn against an already-correct structure, contrary to the "nothing gets thrown away, everything gets organized" principle the project's own Implementation Plan states, and against your own instruction not to change functionality while restructuring.

### `ARCHITECTURE.md`
Recommend writing this once the above cleanup lands, documenting the folder map that already exists (domains, db/schema, ai/ gateway pattern) rather than a new one — it's mostly a documentation task, not a code change.

---

## Next steps

This concludes Phase 0's full-report mandate. Nothing has been changed. Please review §2 (data accuracy — needs your input on DATA-00 before I touch anything), §6 (security — SEC-01 is live and I'd recommend fixing regardless of the rest), and the rest at your pace, then tell me which phases to execute and in what order. I'd suggest: SEC-01 first (isolated, urgent), then Phase 2 data fixes (once DATA-00 is answered), then Phase 1 layout, then the rest — but it's your call.
