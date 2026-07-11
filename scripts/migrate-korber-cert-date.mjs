#!/usr/bin/env node
// Corrects the Körber "Warehouse Advantage Certified Associate" cert date: the DB had
// 2023-09-09, but the resume lists it as Sep 2025. Both local and production already
// agreed with each other on the wrong year — this isn't a sync bug, just stale data —
// so the year is corrected while keeping the original day-of-month.
//
// Local (default):  node scripts/migrate-korber-cert-date.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-korber-cert-date.mjs

import { createClient } from "@libsql/client";
import { ensureMigrationsTable, hasRun, markApplied } from "./lib/migrationGuard.mjs";

const MIGRATION_NAME = "korber-cert-date";
const url = process.env.DATABASE_URL ?? "file:../portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`Körber cert date correction — target: ${url}\n`);

await ensureMigrationsTable(client);
if (await hasRun(client, MIGRATION_NAME)) {
  console.log(`⏭  ${MIGRATION_NAME} already applied to this database — skipping.`);
  process.exit(0);
}

const res = await client.execute({
  sql: `UPDATE certifications SET date = ? WHERE title LIKE 'Warehouse Advantage Certified%'`,
  args: ["2025-09-09"],
});
console.log(`✔ certifications: set Warehouse Advantage Certified Associate date to 2025-09-09 (${res.rowsAffected} row)`);

await markApplied(client, MIGRATION_NAME);
console.log("\nDone.");
process.exit(0);
