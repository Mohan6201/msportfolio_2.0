# MS Portfolio 2.0 — Architecture

A short map of where things live and where new code should go. See `Blueprint.md` and `Implementation_plan.md` for the full vision/roadmap this structure implements — this file just documents current reality.

## Folder map

```
src/
├── app/                    Next.js App Router — routes only (pages, layouts, API handlers)
│   ├── (public pages)/     /, /blog, /projects, /skills, /certifications, /services,
│   │                       /architecture, /blueprints, /devops-toolkit, /monitoring-demo,
│   │                       /career-progress, /profile — all thin, delegate to domains/
│   ├── admin/              Owner-only CMS (Better Auth, role: owner|admin), noindex
│   ├── account/            Tier 2 "Account Centre" — logged-in end users, noindex
│   ├── recruiter/          Recruiter-facing view (role: recruiter), noindex
│   ├── api/                Route handlers, grouped by domain (api/admin/*, api/account/*, ...)
│   ├── sitemap.ts          Dynamic sitemap (static routes + all blog posts)
│   ├── robots.ts           Disallows /admin, /account, /recruiter, /api
│   └── layout.tsx          Root layout — fonts, metadata, viewport, global providers
│
├── domains/                Domain-owned UI + logic (the actual "business" code)
│   ├── profile/            Tier 1 — public portfolio (hero, about, skills, experience,
│   │                       projects, certificates, contact, navbar, footer, career-centre)
│   ├── accounts/           Tier 2 foundation — account dashboard, job preferences
│   ├── resume/             Resume Studio + Resume AI (upload, versions, ATS, cover letters)
│   ├── jobs/                Job Search + matching
│   ├── career/              Career Advisor
│   ├── interview/           Interview Lab (question bank, mock interviews)
│   ├── analytics/           GitHub stats, achievements, admin analytics
│   ├── knowledge/            KT Centre (DevOps document library + search)
│   ├── devops-toolkit/       Nginx/Docker/CI-CD/EC2/AWS generators, architecture showcase
│   └── blog/                 MDX blog (posts, comments, newsletter)
│
├── ai/                      AI Gateway — every AI call goes through here, never a
│   ├── providers/           provider SDK directly from domain code (Blueprint §7 "Golden Rule")
│   ├── prompts/
│   ├── schemas/             Zod schemas for structured AI output
│   ├── agents/               High-level functions: extractResume(), scoreATS(), chatWithVisitor(), ...
│   └── workflows/            Multi-step flows (e.g. ingestJobPostings.ts)
│
├── db/
│   ├── client.ts            Drizzle + Turso/LibSQL client
│   ├── queries.ts           Legacy flat queries (contacts, blog_comments, newsletter)
│   └── schema/               One file per domain (profile.ts, accounts.ts, resume.ts,
│                              jobs.ts, career.ts, interview.ts, analytics.ts, knowledge.ts,
│                              auth.ts, legacy.ts)
│
├── auth/                     Better Auth config (role field: owner|admin|user|recruiter)
├── lib/                      Shared utilities: requireRole.ts (+ requireAdmin/requireUser/
│                              requireRecruiter wrappers), rateLimit.ts, formatDate.ts,
│                              motion.ts, utils.ts
├── components/
│   ├── ui/                   Shared primitives (shadcn-style — Button, CommandPalette, etc.)
│   └── admin/                Shared admin-only components (ImageUploader)
└── providers/                App-wide React context providers (ThemeProvider)
```

## Where new code goes

- **New public-facing feature on the main site** → `src/domains/profile/` (or a new domain folder if it's a genuinely new concern, matching the pattern above).
- **New Tier 2 (logged-in) feature** → its own domain under `src/domains/`, routes under `src/app/account/`, API routes under `src/app/api/account/`.
- **New DB table** → add to the relevant `src/db/schema/<domain>.ts` file (create a new one only for a genuinely new domain).
- **New AI capability** → `src/ai/agents/`, called through `src/ai/providers/gateway.ts` — never import a provider SDK (`@ai-sdk/google`, etc.) directly from a domain.
- **New admin-gated API route** → `src/app/api/admin/**`, call `requireAdmin()` from `src/lib/adminAuth.ts` as the first line.
- **New account-scoped API route** → `src/app/api/account/**`, call `requireUser()` from `src/lib/accountAuth.ts`, and scope every query to `session.user.id`.
- **Shared, cross-domain utility** → `src/lib/`.
- **Shared, cross-domain UI primitive** → `src/components/ui/`.

## Conventions

- Path alias `@/` maps to `src/` — use it instead of relative `../../../` imports.
- One shared container spec across all homepage sections: `max-w-screen-2xl mx-auto` with `px-4 sm:px-6 lg:px-8 2xl:px-16` padding (or the section-level equivalent). Keep new sections consistent with this.
- Auth: always go through `requireAdmin`/`requireUser`/`requireRecruiter` (all thin wrappers over `src/lib/requireRole.ts`) — never hand-roll a session check in a route.
- The domain-driven structure above is already the target shape (see `Implementation_plan.md` §3) — there is no pending restructure. New code should extend this pattern, not introduce a new one.

## Known stale artifacts (harmless, not git-tracked)

- `src/data/` and `src/state/` are empty leftover directories from before the domain migration (`portfolio.config.ts` and `useMenuStore.js` used to live there). Not tracked by git (empty dirs aren't), safe to ignore or delete locally.
