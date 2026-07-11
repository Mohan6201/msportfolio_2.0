#!/usr/bin/env node
// Corrects the profile location: it was seeded as "Hitech City, Hyderabad, India"
// but the actual location is Velachery, Chennai, India.
//
// Local (default):  node scripts/migrate-location-correction.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-location-correction.mjs

import { createClient } from "@libsql/client";
import { ensureMigrationsTable, hasRun, markApplied } from "./lib/migrationGuard.mjs";

const MIGRATION_NAME = "location-correction";
const url = process.env.DATABASE_URL ?? "file:../portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`Location correction — target: ${url}\n`);

await ensureMigrationsTable(client);
if (await hasRun(client, MIGRATION_NAME)) {
  console.log(`⏭  ${MIGRATION_NAME} already applied to this database — skipping.`);
  process.exit(0);
}

const res = await client.execute({
  sql: `UPDATE profiles SET location = ?`,
  args: ["Velachery, Chennai, India"],
});
console.log(`✔ profiles: location corrected to "Velachery, Chennai, India" (${res.rowsAffected} row)`);

await markApplied(client, MIGRATION_NAME);
console.log("\nDone.");
process.exit(0);
