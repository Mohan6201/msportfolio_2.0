#!/usr/bin/env node
// Corrects the Swirepay experience entry: dates, employment status (no longer current),
// and replaces inaccurate responsibilities/tech with what the actual resume says.
// Also updates the bio to reflect open-to-work status honestly.
//
// Local (default):  node scripts/migrate-swirepay-correction.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/migrate-swirepay-correction.mjs

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "file:../portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`Swirepay correction — target: ${url}\n`);

// ── 1. Experience: correct dates, mark no longer current, accurate content ─────
const swirepayTech = JSON.stringify([
  "AWS", "ECS Fargate", "CodePipeline", "CodeBuild", "Prometheus", "Grafana",
]);
const swirepayResp = JSON.stringify([
  "CI/CD Engineering: Built and maintained 100+ CodePipeline + CodeBuild pipelines across ap-south-1 and us-east-1 for Node.js, Spring Boot, Python, and React/Vite — full Bitbucket → CodeCommit → CodePipeline → CodeBuild → ECR → ECS delivery chain, with pipeline status and CloudWatch logs tracked at every stage.",
  "Build Optimisation: Engineered 4-layer S3 caching (JAR, Maven, BuildKit, Trivy DB) with zstd compression and migrated to ECR Public base images — cut cold builds from 40→10 min and cached builds from 25→6 min (75% faster).",
  "ECS Fargate Migrations: Led zero-downtime EC2 → ECS Fargate production migrations, including Apache Superset — covering Aurora RDS permissions, ALB health checks, CORS, Secrets Manager re-encryption, and Route 53 DNS cutover.",
  "IAM Security Hardening: Replaced AWS-managed policies with scoped least-privilege inline roles across 10+ ECS task/execution roles; resolved cross-account ECR pull issues spanning 3 AWS accounts.",
  "Observability Platform: Built a Prometheus + Grafana + Loki + Tempo + OTel Collector stack on ECS from scratch, with path-based ALB routing, Cloud Map DNS, and Grafana SMTP alerting for RDS CPU and application incidents.",
]);

const res = await client.execute({
  sql: `UPDATE experiences
        SET start_date = 'NOV 2025', end_date = 'JUN 2026', is_current = 0,
            company = 'Swirepay Technologies Pvt. Ltd.', tech = ?, responsibilities = ?
        WHERE company LIKE 'Swirepay%'`,
  args: [swirepayTech, swirepayResp],
});
console.log(`✔ experiences: corrected Swirepay row (${res.rowsAffected} row) — Nov 2025 – Jun 2026, no longer current, accurate content`);

// ── 2. Profile bio: honest "open to work" framing ──────────────────────────────
await client.execute({
  sql: `UPDATE profiles SET bio = ?`,
  args: [
    "Cloud Infrastructure and DevOps Engineer with 4+ years of IT experience spanning enterprise on-premises infrastructure and modern AWS cloud environments. Most recently drove fintech-grade CI/CD at Swirepay — shipped 100+ pipelines, cut build times by 75%, led zero-downtime ECS Fargate migrations, and built a Prometheus-Grafana-Loki-Tempo observability stack from scratch. Now open to new DevOps, SRE, and Cloud Engineering opportunities.",
  ],
});
console.log("✔ profiles: bio updated to honest open-to-work framing");

console.log("\nDone.");
process.exit(0);
