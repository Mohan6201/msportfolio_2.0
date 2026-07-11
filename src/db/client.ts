import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as legacySchema from "./schema/legacy";
import * as profileSchema from "./schema/profile";
import * as authSchema from "./schema/auth";
import * as accountsSchema from "./schema/accounts";
import * as resumeSchema from "./schema/resume";
import * as jobsSchema from "./schema/jobs";
import * as careerSchema from "./schema/career";
import * as interviewSchema from "./schema/interview";
import * as knowledgeSchema from "./schema/knowledge";
import * as analyticsSchema from "./schema/analytics";

// Local: DATABASE_URL=file:./portfolio.db
// Vercel: DATABASE_URL=libsql://xxx.turso.io  +  TURSO_AUTH_TOKEN=xxx
const url = process.env.DATABASE_URL ?? "file:./portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const libsqlClient = createClient({ url, authToken });
export const db = drizzle(libsqlClient, {
  schema: { ...legacySchema, ...profileSchema, ...authSchema, ...accountsSchema, ...resumeSchema, ...jobsSchema, ...careerSchema, ...interviewSchema, ...knowledgeSchema, ...analyticsSchema },
});

// Skip DDL during `next build` — 15 parallel workers hit the same local SQLite file
if (process.env.NEXT_PHASE !== "phase-production-build") {
  await libsqlClient.executeMultiple(`
  -- Legacy tables
  CREATE TABLE IF NOT EXISTS contacts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    message    TEXT    NOT NULL,
    ip         TEXT,
    read       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS kt_documents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    filename    TEXT    NOT NULL UNIQUE,
    category    TEXT    NOT NULL DEFAULT 'DevOps',
    level       TEXT    NOT NULL DEFAULT 'Reference',
    file_data   BLOB    NOT NULL,
    file_size   INTEGER NOT NULL DEFAULT 0,
    uploaded_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Profile domain tables
  CREATE TABLE IF NOT EXISTS profiles (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name            TEXT    NOT NULL,
    title                TEXT    NOT NULL,
    bio                  TEXT    NOT NULL DEFAULT '',
    location             TEXT    NOT NULL DEFAULT '',
    email                TEXT    NOT NULL DEFAULT '',
    phone                TEXT    NOT NULL DEFAULT '',
    avatar_url           TEXT,
    career_start_date    TEXT    NOT NULL,
    current_company      TEXT    NOT NULL DEFAULT '',
    current_designation  TEXT    NOT NULL DEFAULT '',
    resume_url           TEXT,
    github_url           TEXT,
    linkedin_url         TEXT
  );

  CREATE TABLE IF NOT EXISTS social_links (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    platform   TEXT    NOT NULL,
    url        TEXT    NOT NULL,
    label      TEXT    NOT NULL,
    icon_key   TEXT    NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS skills (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    category   TEXT    NOT NULL,
    level      INTEGER NOT NULL,
    icon_key   TEXT    NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS experiences (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id       INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_title        TEXT    NOT NULL,
    company          TEXT    NOT NULL,
    company_url      TEXT,
    start_date       TEXT    NOT NULL,
    end_date         TEXT,
    is_current       INTEGER NOT NULL DEFAULT 0,
    tech             TEXT    NOT NULL DEFAULT '[]',
    responsibilities TEXT    NOT NULL DEFAULT '[]',
    sort_order       INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS certifications (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title      TEXT    NOT NULL,
    issuer     TEXT    NOT NULL,
    date       TEXT    NOT NULL,
    description TEXT   NOT NULL DEFAULT '',
    image_url  TEXT    NOT NULL,
    link       TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS projects (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id       INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name             TEXT    NOT NULL,
    year             TEXT    NOT NULL,
    description      TEXT    NOT NULL,
    image_url        TEXT    NOT NULL,
    link             TEXT    NOT NULL,
    github_url       TEXT,
    tech             TEXT    NOT NULL DEFAULT '[]',
    responsibilities TEXT    NOT NULL DEFAULT '[]',
    align            TEXT    NOT NULL DEFAULT 'left',
    sort_order       INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- Better Auth tables
  CREATE TABLE IF NOT EXISTS users (
    id              TEXT    PRIMARY KEY,
    name            TEXT    NOT NULL,
    email           TEXT    NOT NULL UNIQUE,
    email_verified  INTEGER NOT NULL DEFAULT 0,
    image           TEXT,
    role            TEXT    NOT NULL DEFAULT 'user',
    created_at      INTEGER NOT NULL,
    updated_at      INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id          TEXT    PRIMARY KEY,
    expires_at  INTEGER NOT NULL,
    token       TEXT    NOT NULL UNIQUE,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL,
    ip_address  TEXT,
    user_agent  TEXT,
    user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id                        TEXT    PRIMARY KEY,
    account_id                TEXT    NOT NULL,
    provider_id               TEXT    NOT NULL,
    user_id                   TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token              TEXT,
    refresh_token             TEXT,
    id_token                  TEXT,
    access_token_expires_at   INTEGER,
    refresh_token_expires_at  INTEGER,
    scope                     TEXT,
    password                  TEXT,
    created_at                INTEGER NOT NULL,
    updated_at                INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS verifications (
    id         TEXT    PRIMARY KEY,
    identifier TEXT    NOT NULL,
    value      TEXT    NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER,
    updated_at INTEGER
  );

  -- Resume domain tables
  CREATE TABLE IF NOT EXISTS resumes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    TEXT    NOT NULL,
    title      TEXT    NOT NULL DEFAULT 'My Resume',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS resume_versions (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_id        INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    version_number   INTEGER NOT NULL DEFAULT 1,
    structured_data  TEXT    NOT NULL DEFAULT '{}',
    source_file_url  TEXT,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS resume_analyses (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_version_id  INTEGER NOT NULL REFERENCES resume_versions(id) ON DELETE CASCADE,
    jd_text            TEXT,
    analysis_type      TEXT    NOT NULL,
    result             TEXT    NOT NULL DEFAULT '{}',
    created_at         TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cover_letters (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_version_id  INTEGER NOT NULL REFERENCES resume_versions(id) ON DELETE CASCADE,
    job_title          TEXT,
    company            TEXT,
    content            TEXT    NOT NULL,
    created_at         TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Jobs domain tables
  CREATE TABLE IF NOT EXISTS companies (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    url       TEXT,
    logo_url  TEXT
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id   INTEGER REFERENCES companies(id),
    source       TEXT    NOT NULL,
    external_id  TEXT    NOT NULL,
    title        TEXT    NOT NULL,
    description  TEXT    NOT NULL DEFAULT '',
    requirements TEXT    NOT NULL DEFAULT '[]',
    location     TEXT    NOT NULL DEFAULT '',
    remote       INTEGER NOT NULL DEFAULT 0,
    salary_min   INTEGER,
    salary_max   INTEGER,
    url          TEXT    NOT NULL,
    posted_at    TEXT,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(source, external_id)
  );

  CREATE TABLE IF NOT EXISTS job_matches (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id            TEXT    NOT NULL,
    job_id             INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    resume_version_id  INTEGER,
    match_score        REAL,
    skill_gaps         TEXT    NOT NULL DEFAULT '[]',
    matched_skills     TEXT    NOT NULL DEFAULT '[]',
    verdict            TEXT,
    status             TEXT    NOT NULL DEFAULT 'suggested',
    created_at         TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at         TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, job_id)
  );

  -- Career domain tables
  CREATE TABLE IF NOT EXISTS skill_gap_reports (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      TEXT    NOT NULL,
    target_role  TEXT    NOT NULL,
    gaps         TEXT    NOT NULL DEFAULT '[]',
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS career_recommendations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT    NOT NULL,
    type        TEXT    NOT NULL,
    content     TEXT    NOT NULL DEFAULT '{}',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Accounts domain tables
  CREATE TABLE IF NOT EXISTS user_job_preferences (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id              TEXT    NOT NULL UNIQUE,
    target_roles         TEXT    NOT NULL DEFAULT '[]',
    preferred_locations  TEXT    NOT NULL DEFAULT '[]',
    remote_preference    TEXT    NOT NULL DEFAULT 'any',
    employment_type      TEXT    NOT NULL DEFAULT '[]',
    min_salary           INTEGER,
    keywords             TEXT    NOT NULL DEFAULT '[]',
    updated_at           TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Interview domain tables
  CREATE TABLE IF NOT EXISTS interview_questions (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    category  TEXT    NOT NULL,
    level     TEXT    NOT NULL DEFAULT 'Intermediate',
    question  TEXT    NOT NULL,
    answer    TEXT    NOT NULL,
    tags      TEXT    NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS mock_interviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    TEXT    NOT NULL,
    category   TEXT    NOT NULL,
    transcript TEXT    NOT NULL DEFAULT '[]',
    score      INTEGER,
    feedback   TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Knowledge domain tables (vector chunks — F32_BLOB for Turso, BLOB fallback for local)
  CREATE TABLE IF NOT EXISTS kt_chunks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    content     TEXT    NOT NULL,
    embedding   BLOB
  );
`);

  // Analytics domain tables
  await libsqlClient.executeMultiple(`
  CREATE TABLE IF NOT EXISTS page_views (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    path          TEXT    NOT NULL,
    visitor_hash  TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS resume_downloads (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    resume_version_id  INTEGER,
    created_at         TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    feature      TEXT    NOT NULL,
    tokens_used  INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  `);

  // Add storage_url to kt_documents for Vercel Blob migration (silent if already exists)
  try {
    await libsqlClient.execute("ALTER TABLE kt_documents ADD COLUMN storage_url TEXT");
  } catch { /* column already exists */ }
}
