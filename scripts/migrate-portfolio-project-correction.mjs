#!/usr/bin/env node
// Corrects the "Next.js DevOps Portfolio" project entry: it still advertised the blog CMS,
// comments, and newsletter subscription features that were removed from the site, and listed
// "Next.js 15" when the app now runs on Next.js 16.
//
// Local (default):  node scripts/migrate-portfolio-project-correction.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-portfolio-project-correction.mjs

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "file:../portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`Portfolio project correction — target: ${url}\n`);

const description =
  "This very portfolio — built with Next.js 16, TypeScript, Tailwind v4, LibSQL, and deployed on Vercel. Features an AI assistant (MOJOMO), an AI-powered Career Centre (resume ATS scoring, job matching, mock interviews), a 50-doc DevOps knowledge base, and a full custom admin dashboard.";

const responsibilities = JSON.stringify([
  "Architected production-grade Next.js 16 app with App Router and server components.",
  "Integrated a Google Gemini AI chatbot (MOJOMO) with context-aware DevOps responses.",
  "Built an AI-powered Career Centre: resume ATS scoring, JD match scoring, and mock interview practice.",
  "Implemented SQLite/LibSQL database with a full custom admin dashboard for content management.",
  "Deployed with Vercel Analytics, Speed Insights, and automated CI/CD on every push.",
]);

const tech = JSON.stringify(["Next.js 16", "TypeScript", "Tailwind", "LibSQL", "Vercel", "Gemini AI"]);

const res = await client.execute({
  sql: `UPDATE projects SET description = ?, responsibilities = ?, tech = ? WHERE name LIKE 'Next.js DevOps Portfolio%'`,
  args: [description, responsibilities, tech],
});
console.log(`✔ projects: corrected "Next.js DevOps Portfolio" entry (${res.rowsAffected} row) — removed blog/comments/newsletter mentions, Next.js 15 → 16`);

console.log("\nDone.");
process.exit(0);
