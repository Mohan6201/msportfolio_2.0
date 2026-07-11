// Shared guard for one-off data migration scripts (scripts/migrate-*.mjs).
//
// Without this, whether a given script had been run against a given database was
// something a human had to remember or reconstruct by inspecting rows — which is
// exactly how migrate-swirepay-correction.mjs sat local-only for hours before anyone
// noticed production still had the pre-session broken data, and how running two
// bio-writing scripts in a different relative order on production than on local
// silently reintroduced an already-fixed bug. This makes "have I already run against
// THIS database?" a query instead of a guess.
//
// Usage in a migration script:
//
//   import { createClient } from "@libsql/client";
//   import { ensureMigrationsTable, hasRun, markApplied } from "./lib/migrationGuard.mjs";
//
//   const MIGRATION_NAME = "my-migration-name"; // unique, stable — never rename after first run
//   const client = createClient(...);
//
//   await ensureMigrationsTable(client);
//   if (await hasRun(client, MIGRATION_NAME)) {
//     console.log(`⏭  ${MIGRATION_NAME} already applied to this database — skipping.`);
//     process.exit(0);
//   }
//
//   // ... migration logic ...
//
//   await markApplied(client, MIGRATION_NAME);

export async function ensureMigrationsTable(client) {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _data_migrations (
      name       TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export async function hasRun(client, name) {
  const res = await client.execute({
    sql: "SELECT 1 FROM _data_migrations WHERE name = ?",
    args: [name],
  });
  return res.rows.length > 0;
}

export async function markApplied(client, name) {
  await client.execute({
    sql: "INSERT INTO _data_migrations (name) VALUES (?) ON CONFLICT DO NOTHING",
    args: [name],
  });
}
