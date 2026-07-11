#!/usr/bin/env node
// Corrects the profile location: it was seeded as "Hitech City, Hyderabad, India"
// but the actual location is Velachery, Chennai, India.
//
// Local (default):  node scripts/migrate-location-correction.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-location-correction.mjs

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "file:../portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`Location correction — target: ${url}\n`);

const res = await client.execute({
  sql: `UPDATE profiles SET location = ?`,
  args: ["Velachery, Chennai, India"],
});
console.log(`✔ profiles: location corrected to "Velachery, Chennai, India" (${res.rowsAffected} row)`);

console.log("\nDone.");
process.exit(0);
