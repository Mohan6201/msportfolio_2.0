#!/usr/bin/env node
// Restores the honest "open to work" bio. Running migrate-swirepay-correction.mjs before
// migrate-phase2-resume-sync.mjs on production meant phase2's older, present-tense bio
// ("managing multi-account AWS...") silently overwrote swirepay-correction's fix, since both
// scripts write to profiles.bio. This re-applies the correct final version directly.
//
// Local (default):  node scripts/migrate-bio-correction.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-bio-correction.mjs

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "file:../portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`Bio correction — target: ${url}\n`);

const res = await client.execute({
  sql: `UPDATE profiles SET bio = ?`,
  args: [
    "Cloud Infrastructure and DevOps Engineer with 4+ years of IT experience spanning enterprise on-premises infrastructure and modern AWS cloud environments. Most recently drove fintech-grade CI/CD at Swirepay — shipped 100+ pipelines, cut build times by 75%, led zero-downtime ECS Fargate migrations, and built a Prometheus-Grafana-Loki-Tempo observability stack from scratch. Now open to new DevOps, SRE, and Cloud Engineering opportunities.",
  ],
});
console.log(`✔ profiles: bio restored to honest open-to-work framing (${res.rowsAffected} row)`);

console.log("\nDone.");
process.exit(0);
