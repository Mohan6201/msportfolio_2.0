#!/usr/bin/env node
// Phase 2 (resume-vs-portfolio data accuracy) reconciliation.
// Safe to run against either the local dev DB or production Turso — matches rows
// by content rather than hardcoded IDs, and skips inserts that already exist so
// it can be re-run without creating duplicates.
//
// Local (default):  node scripts/migrate-phase2-resume-sync.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-phase2-resume-sync.mjs

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "file:../portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`Phase 2 data reconciliation — target: ${url}\n`);

async function rowExists(sql, args) {
  const res = await client.execute({ sql, args });
  return res.rows.length > 0;
}

// ── 1. Profile: title, designation, bio (single row, no WHERE needed) ──────
await client.execute({
  sql: `UPDATE profiles SET title = ?, current_designation = ?, bio = ?`,
  args: [
    "DevOps & Cloud Infrastructure Engineer",
    "AWS DevOps Engineer",
    "Cloud Infrastructure and DevOps Engineer with 4 years of IT experience spanning enterprise on-premises infrastructure and modern AWS cloud environments. Hands-on background in Windows Server administration, Hyper-V virtualization, and Linux systems, combined with production AWS DevOps expertise across ECS Fargate, EC2, IAM, and CI/CD pipeline engineering. At Swirepay (fintech), managing multi-account AWS across staging and production — reduced CI/CD build time by 75%, led zero-downtime EC2-to-ECS migrations, and built a Prometheus–Grafana–Loki–Tempo observability stack from scratch.",
  ],
});
console.log("✔ profiles updated (title, current_designation, bio)");

// ── 2. Experience: Swirepay job title + Staff Consultant enrichment ────────
await client.execute({
  sql: `UPDATE experiences SET job_title = ? WHERE company = 'Swirepay'`,
  args: ["AWS DevOps Engineer"],
});

const staffResp = JSON.stringify([
  "Led end-to-end WMS platform migration from HighJump to Körber across DEV, UAT, and PROD.",
  "Managed high-scalability WMS deployments; configured IIS, Bartender, and remote printing services.",
  "Provisioned and configured Windows Server 2022 on physical hardware for production use.",
  "Administered Hyper-V — provisioned and managed VMs, allocated compute resources, and configured virtual networking for enterprise application environments.",
  "Configured and maintained IIS for enterprise web apps — site creation, Application Pools, bindings, SSL integration, and web.config management for production ASP.NET applications.",
]);
await client.execute({
  sql: `UPDATE experiences SET responsibilities = ? WHERE job_title = 'Staff Consultant' AND company = 'Enterprise SoftLabs Pvt Ltd'`,
  args: [staffResp],
});
console.log("✔ experiences updated (Swirepay title, Staff Consultant responsibilities enriched)");

// ── 3. Skills: add resume-confirmed skills missing from DB ─────────────────
const newSkills = [
  { name: "Windows Server · Hyper-V · IIS", category: "backend",    level: 85, iconKey: "FaWindows", sortOrder: 15 },
  { name: "CodeBuild · Lambda",             category: "cloud",      level: 85, iconKey: "FaAws",     sortOrder: 16 },
  { name: "Nginx",                          category: "devops",     level: 78, iconKey: "SiNginx",   sortOrder: 17 },
  { name: "Loki · Tempo · OTel Collector",  category: "monitoring", level: 78, iconKey: "SiGrafana", sortOrder: 18 },
];
let skillsInserted = 0;
for (const s of newSkills) {
  const exists = await rowExists(`SELECT id FROM skills WHERE name = ?`, [s.name]);
  if (exists) continue;
  await client.execute({
    sql: `INSERT INTO skills (profile_id, name, category, level, icon_key, sort_order)
          SELECT id, ?, ?, ?, ?, ? FROM profiles LIMIT 1`,
    args: [s.name, s.category, s.level, s.iconKey, s.sortOrder],
  });
  skillsInserted++;
}
console.log(`✔ skills: inserted ${skillsInserted} new row(s) (skipped ${newSkills.length - skillsInserted} already present)`);

// ── 4. Certifications: replace stale in-progress row, fix issuer name ──────
await client.execute({
  sql: `DELETE FROM certifications WHERE title = 'DevOps Certified Expert (In-Progress)'`,
});

const newCerts = [
  {
    title: "Advanced DevOps & Cloud Engineering Program",
    issuer: "GUVI Geek Network",
    date: "2026-01-01",
    description: "Grade A — advanced hands-on DevOps and cloud engineering training program.",
    imageUrl: "/images/certs/blank.png",
    sortOrder: 0,
  },
  {
    title: "DevOps Program",
    issuer: "GUVI x HCL",
    date: "2025-10-01",
    description: "May–Oct 2025 — hands-on DevOps training covering Git, Jenkins, Docker, Ansible, Terraform, and Kubernetes.",
    imageUrl: "/images/certs/blank.png",
    sortOrder: 1,
  },
];
let certsInserted = 0;
for (const c of newCerts) {
  const exists = await rowExists(`SELECT id FROM certifications WHERE title = ?`, [c.title]);
  if (exists) continue;
  await client.execute({
    sql: `INSERT INTO certifications (profile_id, title, issuer, date, description, image_url, sort_order)
          SELECT id, ?, ?, ?, ?, ?, ? FROM profiles LIMIT 1`,
    args: [c.title, c.issuer, c.date, c.description, c.imageUrl, c.sortOrder],
  });
  certsInserted++;
}

await client.execute({
  sql: `UPDATE certifications SET issuer = ?, title = ?, description = ? WHERE title = 'AWS Solutions Architect Associate'`,
  args: [
    "Red9SysTech",
    "AWS Solutions Architect Associate (Training)",
    "Batch #8 — designing scalable, secure, and reliable AWS cloud architectures using EC2, S3, VPC, IAM, and more.",
  ],
});
console.log(`✔ certifications: inserted ${certsInserted} new row(s), fixed AWS SA issuer/title/description`);
console.log("  ⚠ Körber cert date left unchanged (DB: 2023-09-09, resume says Sep 2025) — needs manual confirmation, not guessed");

// ── 5. Projects: add CareerOS (resume's headline current project) ──────────
const careerOsExists = await rowExists(
  `SELECT id FROM projects WHERE name LIKE 'CareerOS%'`, []
);
if (!careerOsExists) {
  await client.execute({
    sql: `INSERT INTO projects (profile_id, name, year, description, image_url, link, github_url, tech, responsibilities, align, sort_order)
          SELECT id, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            COALESCE((SELECT MAX(sort_order) + 1 FROM projects), 0)
          FROM profiles LIMIT 1`,
    args: [
      "CareerOS — AI-Powered Professional Intelligence Platform",
      "2026 (in development)",
      "Solo-designed an AI-native career platform architecture built around a persistent \"Professional Twin\" user model, a hybrid multi-agent system (Google ADK + LangGraph), and an event-driven microservices design with a Kubernetes/ArgoCD deployment plan. Currently building the MVP on a Dockerized Django + React stack with CI/CD automation.",
      "/images/certs/blank.png",
      "#",
      null,
      JSON.stringify(["Google ADK", "LangGraph", "Kubernetes", "ArgoCD", "Django", "React", "Docker", "CI/CD"]),
      JSON.stringify([
        "Solo-designed the end-to-end architecture: persistent \"Professional Twin\" user model.",
        "Hybrid multi-agent system combining Google ADK and LangGraph for career intelligence workflows.",
        "Event-driven microservices design with a Kubernetes/ArgoCD deployment plan.",
        "Building the MVP on a Dockerized Django + React stack with CI/CD automation.",
      ]),
      "right",
    ],
  });
  console.log("✔ projects: added CareerOS (placeholder image — needs a real screenshot uploaded via Admin → Projects)");
} else {
  console.log("✔ projects: CareerOS already present, skipped");
}

console.log("\nDone.");
process.exit(0);
