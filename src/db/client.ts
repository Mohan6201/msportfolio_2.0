import { createClient } from "@libsql/client";

// Local: DATABASE_URL=file:./portfolio.db
// Vercel: DATABASE_URL=libsql://xxx.turso.io  +  TURSO_AUTH_TOKEN=xxx
const url = process.env.DATABASE_URL ?? "file:./portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({ url, authToken });

// ── Table initialisation (runs once per cold start) ─────────────────────────

await db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS contacts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    message    TEXT    NOT NULL,
    ip         TEXT,
    read       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS blog_comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    post_slug  TEXT    NOT NULL,
    author     TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    body       TEXT    NOT NULL,
    approved   INTEGER NOT NULL DEFAULT 0,
    ip         TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS newsletter (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT    NOT NULL UNIQUE,
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
`);
