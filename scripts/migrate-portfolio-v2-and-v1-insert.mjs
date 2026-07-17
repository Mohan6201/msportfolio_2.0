#!/usr/bin/env node
// Renames the "Next.js DevOps Portfolio" project to "MS Portfolio 2.0" with its current
// (Jan 2026 - Present) year, fixes Txenia's year (was showing "Nov 2023", actually
// Feb 2025 - Aug 2025 per verified LinkedIn/Naukri work history), and inserts a new
// "MS Portfolio 1.0" project documenting the original React/Vite SPA it replaced.
// Also normalizes sort_order for the whole projects list so 2.0 -> 1.0 -> Txenia -> ... follows.
//
// Local (default):  DATABASE_URL=file:./portfolio.db node scripts/migrate-portfolio-v2-and-v1-insert.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-portfolio-v2-and-v1-insert.mjs

import { createClient } from "@libsql/client";
import { ensureMigrationsTable, hasRun, markApplied } from "./lib/migrationGuard.mjs";

const MIGRATION_NAME = "portfolio-v2-rename-and-v1-insert";
const url = process.env.DATABASE_URL ?? "file:../portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`Portfolio v2 rename + v1 insert — target: ${url}\n`);

await ensureMigrationsTable(client);
if (await hasRun(client, MIGRATION_NAME)) {
  console.log(`⏭  ${MIGRATION_NAME} already applied to this database — skipping.`);
  process.exit(0);
}

const profileRow = await client.execute(`SELECT id FROM profiles LIMIT 1`);
const profileId = profileRow.rows[0]?.id;
if (!profileId) {
  console.error("No profile row found — aborting.");
  process.exit(1);
}

// 1. Rename "Next.js DevOps Portfolio" -> "MS Portfolio 2.0", update year + description + tech.
const v2Description =
  "The ground-up rebuild of my portfolio — MS Portfolio 2.0. Evolved from a static React/Vite single-page app (v1.0, no backend) into a full-stack Next.js 16 platform with a real database, an AI assistant (MOJOMO), an AI-powered Career Centre (resume ATS scoring, job matching, mock interviews), a 50-doc DevOps knowledge base, and a full custom admin dashboard.";
const v2Tech = JSON.stringify(["Next.js 16", "TypeScript", "Tailwind", "LibSQL", "Vercel", "Gemini AI"]);

const v2Res = await client.execute({
  sql: `UPDATE projects SET name = 'MS Portfolio 2.0', year = 'Jan 2026 – Present', description = ?, tech = ?, sort_order = 0
        WHERE name LIKE 'Next.js DevOps Portfolio%' OR name = 'MS Portfolio 2.0'`,
  args: [v2Description, v2Tech],
});
console.log(`✔ projects: renamed/updated "MS Portfolio 2.0" entry (${v2Res.rowsAffected} row)`);

// 2. Fix Txenia's year.
const txeniaRes = await client.execute(
  `UPDATE projects SET year = 'Feb 2025 – Aug 2025', sort_order = 2 WHERE name LIKE 'Txenia%'`
);
console.log(`✔ projects: fixed Txenia year -> "Feb 2025 – Aug 2025" (${txeniaRes.rowsAffected} row)`);

// 3. Bump the rest of the list down one slot to make room for v1.0 at sort_order 1.
await client.execute(`UPDATE projects SET sort_order = 3 WHERE name LIKE 'Good Eggs%'`);
await client.execute(`UPDATE projects SET sort_order = 4 WHERE name LIKE 'Dr.Max%'`);
await client.execute(`UPDATE projects SET sort_order = 5 WHERE name LIKE 'CareerOS%'`);

// 4. Insert "MS Portfolio 1.0" if it doesn't already exist.
const existingV1 = await client.execute(`SELECT id FROM projects WHERE name = 'MS Portfolio 1.0'`);
if (existingV1.rows.length > 0) {
  console.log("⏭  'MS Portfolio 1.0' already exists — skipping insert.");
} else {
  const v1Description =
    "My original portfolio (v1.0) — a static React + Vite single-page app with no backend or database, hosted on Firebase. Replaced in 2026 by the full-stack MS Portfolio 2.0.";
  const v1Tech = JSON.stringify(["React", "Vite", "Redux Toolkit", "Formik", "Tailwind CSS", "Firebase Hosting"]);
  const v1Responsibilities = JSON.stringify([
    "Built a single-page portfolio site with React 18 and Vite — no backend or database.",
    "Implemented global state with Redux Toolkit and form handling with Formik.",
    "Added an in-browser resume viewer using react-pdf.",
  ]);

  await client.execute({
    sql: `INSERT INTO projects (profile_id, name, year, description, image_url, link, github_url, tech, responsibilities, align, sort_order)
          VALUES (?, 'MS Portfolio 1.0', 'Dec 2024 – Oct 2025', ?, '/images/projects/portfolio-v1.png', 'https://ms-portfolio-caee4.web.app', 'https://github.com/Mohan6201/msportfolio', ?, ?, 'left', 1)`,
    args: [profileId, v1Description, v1Tech, v1Responsibilities],
  });
  console.log("✔ projects: inserted 'MS Portfolio 1.0'");
}

await markApplied(client, MIGRATION_NAME);
console.log("\nDone.");
process.exit(0);
