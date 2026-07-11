#!/usr/bin/env node
// Replaces the skills list with the resume-accurate set already live on local dev.
// Production still had fabricated skills (Kubernetes, Helm, Vault, Firebase, "AI/ML
// Deployments") from the same bad Swirepay-era content this session already corrected
// elsewhere — none of those appear in the resume. Full delete+reinsert rather than a
// diff/rename pass, since names, categories, levels, and sort order all shifted together
// and skills.id has no foreign-key dependents.
//
// Local (default):  node scripts/migrate-skills-sync.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-skills-sync.mjs

import { createClient } from "@libsql/client";
import { ensureMigrationsTable, hasRun, markApplied } from "./lib/migrationGuard.mjs";

const MIGRATION_NAME = "skills-sync";
const url = process.env.DATABASE_URL ?? "file:../portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`Skills sync — target: ${url}\n`);

await ensureMigrationsTable(client);
if (await hasRun(client, MIGRATION_NAME)) {
  console.log(`⏭  ${MIGRATION_NAME} already applied to this database — skipping.`);
  process.exit(0);
}

const SKILLS = [
  { name: "AWS EC2 · ECS · S3 · IAM · RDS",       category: "cloud",      level: 92, iconKey: "FaAws",          sortOrder: 0 },
  { name: "Route 53 · VPC · CloudWatch",           category: "cloud",      level: 87, iconKey: "FaAws",          sortOrder: 1 },
  { name: "CodePipeline · ECR · ALB",              category: "cloud",      level: 83, iconKey: "FaAws",          sortOrder: 2 },
  { name: "Docker",                                category: "devops",    level: 90, iconKey: "FaDocker",       sortOrder: 3 },
  { name: "Terraform",                             category: "devops",    level: 85, iconKey: "SiTerraform",    sortOrder: 4 },
  { name: "Ansible",                               category: "devops",    level: 72, iconKey: "SiAnsible",      sortOrder: 5 },
  { name: "GitHub Actions",                        category: "devops",    level: 90, iconKey: "SiGithubactions",sortOrder: 6 },
  { name: "Jenkins CI",                            category: "devops",    level: 78, iconKey: "FaJenkins",      sortOrder: 7 },
  { name: "Python",                                category: "backend",   level: 82, iconKey: "FaPython",       sortOrder: 8 },
  { name: "Bash Shell Scripting",                  category: "backend",   level: 85, iconKey: "SiGnubash",      sortOrder: 9 },
  { name: "Django",                                category: "backend",   level: 70, iconKey: "SiDjango",       sortOrder: 10 },
  { name: "React / Next.js",                       category: "backend",   level: 68, iconKey: "FaReact",        sortOrder: 11 },
  { name: "Linux Administration",                  category: "backend",   level: 88, iconKey: "SiLinux",        sortOrder: 12 },
  { name: "Grafana",                               category: "monitoring",level: 76, iconKey: "SiGrafana",      sortOrder: 13 },
  { name: "Prometheus",                            category: "monitoring",level: 74, iconKey: "SiPrometheus",   sortOrder: 14 },
  { name: "Windows Server · Hyper-V · IIS",        category: "backend",   level: 85, iconKey: "FaWindows",      sortOrder: 15 },
  { name: "CodeBuild · Lambda",                    category: "cloud",     level: 85, iconKey: "FaAws",          sortOrder: 16 },
  { name: "Nginx",                                 category: "devops",    level: 78, iconKey: "SiNginx",        sortOrder: 17 },
  { name: "Loki · Tempo · OTel Collector",         category: "monitoring",level: 78, iconKey: "SiGrafana",      sortOrder: 18 },
];

const before = await client.execute("SELECT count(*) as c FROM skills");
await client.execute("DELETE FROM skills");

for (const s of SKILLS) {
  await client.execute({
    sql: `INSERT INTO skills (profile_id, name, category, level, icon_key, sort_order)
          SELECT id, ?, ?, ?, ?, ? FROM profiles LIMIT 1`,
    args: [s.name, s.category, s.level, s.iconKey, s.sortOrder],
  });
}

console.log(`✔ skills: replaced ${before.rows[0].c} row(s) with ${SKILLS.length} resume-accurate row(s)`);

await markApplied(client, MIGRATION_NAME);
console.log("\nDone.");
process.exit(0);
