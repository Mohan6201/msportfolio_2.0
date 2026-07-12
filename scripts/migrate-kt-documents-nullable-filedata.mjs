#!/usr/bin/env node
// kt_documents.file_data was defined nullable in the Drizzle schema (blob("file_data",
// { mode: "buffer" }) with no .notNull()) but the physical column in both local and
// production still carries a NOT NULL constraint from before Vercel Blob support was
// added — schema/DB drift that only surfaced now that KT uploads can go through the new
// client-side Blob upload path, which never populates file_data at all (the file lives
// in Blob storage, referenced via storage_url). Every such insert previously 500'd with
// SQLITE_CONSTRAINT_NOTNULL.
//
// SQLite/libSQL has no ALTER COLUMN DROP NOT NULL, so this recreates the table with the
// corrected constraint and copies existing rows across, inside a single transaction.
//
// Local (default):  node scripts/migrate-kt-documents-nullable-filedata.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-kt-documents-nullable-filedata.mjs

import { createClient } from "@libsql/client";
import { ensureMigrationsTable, hasRun, markApplied } from "./lib/migrationGuard.mjs";

const MIGRATION_NAME = "kt-documents-nullable-filedata";
const url = process.env.DATABASE_URL ?? "file:./portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`kt_documents.file_data nullable fix — target: ${url}\n`);

await ensureMigrationsTable(client);
if (await hasRun(client, MIGRATION_NAME)) {
  console.log(`⏭  ${MIGRATION_NAME} already applied to this database — skipping.`);
  process.exit(0);
}

const before = await client.execute("SELECT COUNT(*) as n FROM kt_documents");
console.log(`Existing kt_documents rows: ${before.rows[0].n}`);

await client.batch(
  [
    `CREATE TABLE kt_documents_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      filename TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL DEFAULT 'DevOps',
      level TEXT NOT NULL DEFAULT 'Reference',
      file_data BLOB,
      file_size INTEGER NOT NULL DEFAULT 0,
      storage_url TEXT,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `INSERT INTO kt_documents_new
       (id, title, filename, category, level, file_data, file_size, storage_url, uploaded_at)
     SELECT id, title, filename, category, level, file_data, file_size, storage_url, uploaded_at
     FROM kt_documents`,
    `DROP TABLE kt_documents`,
    `ALTER TABLE kt_documents_new RENAME TO kt_documents`,
  ],
  "write"
);

const after = await client.execute("SELECT COUNT(*) as n FROM kt_documents");
console.log(`Post-migration kt_documents rows: ${after.rows[0].n}`);

if (Number(after.rows[0].n) !== Number(before.rows[0].n)) {
  throw new Error(`Row count mismatch after migration (${before.rows[0].n} -> ${after.rows[0].n}) — aborting without marking applied.`);
}

await markApplied(client, MIGRATION_NAME);
console.log(`\n✅ Done — file_data is now nullable, ${after.rows[0].n} rows preserved.`);
