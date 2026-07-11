#!/usr/bin/env node
// Sets the completion date for "AWS Solutions Architect Associate" — the resume lists it as
// Red9SysTech, Batch #8, Apr 2025, but the date field was empty, which made the public site
// wrongly show it as "In Progress".
//
// Local (default):  node scripts/migrate-aws-cert-date.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-aws-cert-date.mjs

import { createClient } from "@libsql/client";
import { ensureMigrationsTable, hasRun, markApplied } from "./lib/migrationGuard.mjs";

const MIGRATION_NAME = "aws-cert-date";
const url = process.env.DATABASE_URL ?? "file:../portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`AWS cert date correction — target: ${url}\n`);

await ensureMigrationsTable(client);
if (await hasRun(client, MIGRATION_NAME)) {
  console.log(`⏭  ${MIGRATION_NAME} already applied to this database — skipping.`);
  process.exit(0);
}

const res = await client.execute({
  sql: `UPDATE certifications SET date = ? WHERE title LIKE 'AWS Solutions Architect Associate%'`,
  args: ["2025-04-21"],
});
console.log(`✔ certifications: set AWS Solutions Architect Associate date to 2025-04-21 (${res.rowsAffected} row)`);

await markApplied(client, MIGRATION_NAME);
console.log("\nDone.");
process.exit(0);
