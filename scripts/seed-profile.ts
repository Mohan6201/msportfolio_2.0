#!/usr/bin/env tsx
/**
 * Seeds the profile database. This is the from-scratch fallback if the profile
 * table is ever empty — kept in sync with the live, admin-managed data so a
 * reseed doesn't reintroduce stale content. Last synced: 2026-07-11.
 * Run with: npm run db:seed
 *
 * Requires DATABASE_URL (and TURSO_AUTH_TOKEN for remote Turso).
 * For local dev, env vars are read from .env / .env.local automatically.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// ── Env loading (must happen before db import) ─────────────────────────────────
function loadEnvFile(filename: string) {
  try {
    const lines = readFileSync(resolve(process.cwd(), filename), "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const raw = trimmed.slice(eq + 1).trim();
      const val = raw.replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // file not found — ignore
  }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

// ── DB + schema (dynamic import so env is loaded first) ───────────────────────
const { db } = await import("../src/db/client.js");
const { profiles, socialLinks, skills, experiences, certifications, projects } =
  await import("../src/db/schema/profile.js");

console.log("🌱  Seeding profile database…");

// ── 1. Profile ──────────────────────────────────────────────────────────────
await db.delete(profiles); // cascade-deletes all child rows

const [profile] = await db
  .insert(profiles)
  .values({
    fullName: "Mohana Srinivasan",
    title: "DevOps & Cloud Infrastructure Engineer",
    bio: "Cloud Infrastructure and DevOps Engineer with 4+ years of IT experience spanning enterprise on-premises infrastructure and modern AWS cloud environments. Most recently drove fintech-grade CI/CD at Swirepay — shipped 100+ pipelines, cut build times by 75%, led zero-downtime ECS Fargate migrations, and built a Prometheus-Grafana-Loki-Tempo observability stack from scratch. Now open to new DevOps, SRE, and Cloud Engineering opportunities.",
    location: "Hitech City, Hyderabad, India",
    email: "mohandevopssme@gmail.com",
    phone: "+91 80988 85683",
    avatarUrl: "/images/profile/avatar.png",
    careerStartDate: "2022-04-01",
    currentCompany: "Swirepay",
    currentDesignation: "AWS DevOps Engineer",
    resumeUrl: "/resume/Mohana_Srinivasan_Resume.pdf",
    githubUrl: "https://github.com/Mohan6201",
    linkedinUrl: "https://www.linkedin.com/in/mohan6201",
  })
  .returning();

console.log(`  ✔  Profile created (id=${profile.id})`);

// ── 2. Social links ──────────────────────────────────────────────────────────
await db.insert(socialLinks).values([
  { profileId: profile.id, platform: "linkedin", url: "https://www.linkedin.com/in/mohan6201", label: "LinkedIn",  iconKey: "FaLinkedinIn", sortOrder: 0 },
  { profileId: profile.id, platform: "github",   url: "https://github.com/Mohan6201",          label: "GitHub",    iconKey: "FiGithub",    sortOrder: 1 },
]);
console.log("  ✔  Social links inserted");

// ── 3. Skills ────────────────────────────────────────────────────────────────
await db.insert(skills).values([
  // ── Cloud / AWS ────────────────────────────────────────────────────────────
  { profileId: profile.id, name: "AWS EC2 · ECS · S3 · IAM · RDS", category: "cloud",      level: 92, iconKey: "FaAws",          sortOrder: 0 },
  { profileId: profile.id, name: "Route 53 · VPC · CloudWatch",     category: "cloud",      level: 87, iconKey: "FaAws",          sortOrder: 1 },
  { profileId: profile.id, name: "CodePipeline · ECR · ALB",        category: "cloud",      level: 83, iconKey: "FaAws",          sortOrder: 2 },
  { profileId: profile.id, name: "CodeBuild · Lambda",               category: "cloud",      level: 85, iconKey: "FaAws",          sortOrder: 16 },
  // ── DevOps & IaC ───────────────────────────────────────────────────────────
  { profileId: profile.id, name: "Docker",                           category: "devops",     level: 90, iconKey: "FaDocker",       sortOrder: 3 },
  { profileId: profile.id, name: "Terraform",                        category: "devops",     level: 85, iconKey: "SiTerraform",    sortOrder: 4 },
  { profileId: profile.id, name: "Ansible",                          category: "devops",     level: 72, iconKey: "SiAnsible",      sortOrder: 5 },
  { profileId: profile.id, name: "GitHub Actions",                   category: "devops",     level: 90, iconKey: "SiGithubactions",sortOrder: 6 },
  { profileId: profile.id, name: "Jenkins CI",                       category: "devops",     level: 78, iconKey: "FaJenkins",      sortOrder: 7 },
  { profileId: profile.id, name: "Nginx",                            category: "devops",     level: 78, iconKey: "SiNginx",        sortOrder: 17 },
  // ── Languages & Backend ────────────────────────────────────────────────────
  { profileId: profile.id, name: "Python",                           category: "backend",    level: 82, iconKey: "FaPython",       sortOrder: 8 },
  { profileId: profile.id, name: "Bash Shell Scripting",             category: "backend",    level: 85, iconKey: "SiGnubash",      sortOrder: 9 },
  { profileId: profile.id, name: "Django",                           category: "backend",    level: 70, iconKey: "SiDjango",       sortOrder: 10 },
  { profileId: profile.id, name: "React / Next.js",                  category: "backend",    level: 68, iconKey: "FaReact",        sortOrder: 11 },
  { profileId: profile.id, name: "Linux Administration",             category: "backend",    level: 88, iconKey: "SiLinux",        sortOrder: 12 },
  { profileId: profile.id, name: "Windows Server · Hyper-V · IIS",   category: "backend",    level: 85, iconKey: "FaWindows",      sortOrder: 15 },
  // ── Monitoring ─────────────────────────────────────────────────────────────
  { profileId: profile.id, name: "Grafana",                          category: "monitoring", level: 76, iconKey: "SiGrafana",      sortOrder: 13 },
  { profileId: profile.id, name: "Prometheus",                       category: "monitoring", level: 74, iconKey: "SiPrometheus",   sortOrder: 14 },
  { profileId: profile.id, name: "Loki · Tempo · OTel Collector",    category: "monitoring", level: 78, iconKey: "SiGrafana",      sortOrder: 18 },
]);
console.log("  ✔  Skills inserted");

// ── 4. Experiences ───────────────────────────────────────────────────────────
await db.insert(experiences).values([
  {
    profileId: profile.id,
    jobTitle: "AWS DevOps Engineer",
    company: "Swirepay Technologies Pvt. Ltd.",
    companyUrl: "https://swirepay.com",
    startDate: "NOV 2025",
    endDate: "JUN 2026",
    isCurrent: false,
    tech: JSON.stringify(["AWS", "ECS Fargate", "CodePipeline", "CodeBuild", "Prometheus", "Grafana"]),
    responsibilities: JSON.stringify([
      "CI/CD Engineering: Built and maintained 100+ CodePipeline + CodeBuild pipelines across ap-south-1 and us-east-1 for Node.js, Spring Boot, Python, and React/Vite — full Bitbucket → CodeCommit → CodePipeline → CodeBuild → ECR → ECS delivery chain, with pipeline status and CloudWatch logs tracked at every stage.",
      "Build Optimisation: Engineered 4-layer S3 caching (JAR, Maven, BuildKit, Trivy DB) with zstd compression and migrated to ECR Public base images — cut cold builds from 40→10 min and cached builds from 25→6 min (75% faster).",
      "ECS Fargate Migrations: Led zero-downtime EC2 → ECS Fargate production migrations, including Apache Superset — covering Aurora RDS permissions, ALB health checks, CORS, Secrets Manager re-encryption, and Route 53 DNS cutover.",
      "IAM Security Hardening: Replaced AWS-managed policies with scoped least-privilege inline roles across 10+ ECS task/execution roles; resolved cross-account ECR pull issues spanning 3 AWS accounts.",
      "Observability Platform: Built a Prometheus + Grafana + Loki + Tempo + OTel Collector stack on ECS from scratch, with path-based ALB routing, Cloud Map DNS, and Grafana SMTP alerting for RDS CPU and application incidents.",
    ]),
    sortOrder: 0,
  },
  {
    profileId: profile.id,
    jobTitle: "AWS DevOps Engineer",
    company: "Enterprise SoftLabs Pvt Ltd",
    startDate: "JUL 2023",
    endDate: "AUG 2025",
    isCurrent: false,
    tech: JSON.stringify(["AWS", "Docker", "ECS", "CodePipeline", "GitHub Actions", "CloudWatch"]),
    responsibilities: JSON.stringify([
      "Built production CI/CD pipelines with GitHub Actions + AWS CodePipeline for an AI/ML WMS application.",
      "Deployed and orchestrated Dockerised services (prediction engine, data sync, reporting) via ECS Fargate.",
      "Managed core AWS stack — EC2, S3, IAM, Route 53, VPC — for scalable, secure infrastructure.",
      "Set up CloudWatch dashboards and custom alarms, reducing mean time to detect incidents by 60%.",
      "Automated infrastructure provisioning with Terraform, eliminating manual environment drift.",
    ]),
    sortOrder: 1,
  },
  {
    profileId: profile.id,
    jobTitle: "Staff Consultant",
    company: "Enterprise SoftLabs Pvt Ltd",
    startDate: "DEC 2022",
    endDate: "JUL 2023",
    isCurrent: false,
    tech: JSON.stringify(["WMS", "Körber", "SQL Server", "IIS", "Windows Server"]),
    responsibilities: JSON.stringify([
      "Led end-to-end WMS platform migration from HighJump to Körber across DEV, UAT, and PROD.",
      "Managed high-scalability WMS deployments; configured IIS, Bartender, and remote printing services.",
      "Provisioned and configured Windows Server 2022 on physical hardware for production use.",
      "Administered Hyper-V — provisioned and managed VMs, allocated compute resources, and configured virtual networking for enterprise application environments.",
      "Configured and maintained IIS for enterprise web apps — site creation, Application Pools, bindings, SSL integration, and web.config management for production ASP.NET applications.",
    ]),
    sortOrder: 2,
  },
  {
    profileId: profile.id,
    jobTitle: "Trainee Consultant",
    company: "Enterprise SoftLabs Pvt Ltd",
    startDate: "APR 2022",
    endDate: "DEC 2022",
    isCurrent: false,
    tech: JSON.stringify(["Azure", "SQL", "Active Directory", "Cisco VPN"]),
    responsibilities: JSON.stringify([
      "Managed supply chain change requests for Maersk — analysed and modified SQL stored procedures.",
      "Troubleshot Azure and Cisco VPN connectivity issues, and administered Windows Active Directory.",
      "Handled product installation, configuration, and server network resolution.",
    ]),
    sortOrder: 3,
  },
]);
console.log("  ✔  Experiences inserted");

// ── 5. Certifications ────────────────────────────────────────────────────────
await db.insert(certifications).values([
  {
    profileId: profile.id,
    title: "Advanced DevOps & Cloud Engineering Program",
    issuer: "GUVI Geek Network",
    date: "2026-01-01",
    description: "Grade A — advanced hands-on DevOps and cloud engineering training program.",
    imageUrl: "/images/certs/blank.png",
    sortOrder: 0,
  },
  {
    profileId: profile.id,
    title: "AWS Solutions Architect Associate (Training)",
    issuer: "Red9SysTech",
    date: "2025-04-21",
    description: "Batch #8 — designing scalable, secure, and reliable AWS cloud architectures using EC2, S3, VPC, IAM, and more.",
    imageUrl: "/images/certs/asa.jfif",
    sortOrder: 1,
  },
  {
    profileId: profile.id,
    title: "DevOps Program",
    issuer: "GUVI x HCL",
    date: "2025-10-01",
    description: "May–Oct 2025 — hands-on DevOps training covering Git, Jenkins, Docker, Ansible, Terraform, and Kubernetes.",
    imageUrl: "/images/certs/blank.png",
    sortOrder: 2,
  },
  {
    profileId: profile.id,
    title: "Warehouse Advantage Certified Associate",
    issuer: "Körber Supply Chain",
    date: "2023-09-09",
    description: "Real-time warehouse operations and inventory management expertise; supply chain efficiency optimization.",
    imageUrl: "/images/certs/korber.png",
    link: "https://www.credly.com/badges/e12dca0f-078f-40ab-b8e9-647121ddf599/linked_in_profile",
    sortOrder: 3,
  },
  {
    profileId: profile.id,
    title: "Full Stack Developer",
    issuer: "3Edge Solutions Pvt Ltd",
    date: "2022-12-27",
    description: "Complete web application development with front-end and back-end technologies.",
    imageUrl: "/images/certs/3edge.png",
    link: "https://www.credly.com/badges/e12dca0f-078f-40ab-b8e9-647121ddf599/linked_in_profile",
    sortOrder: 4,
  },
]);
console.log("  ✔  Certifications inserted");

// ── 6. Projects ──────────────────────────────────────────────────────────────
await db.insert(projects).values([
  {
    profileId: profile.id,
    name: "Next.js DevOps Portfolio",
    year: "2025",
    description: "This very portfolio — built with Next.js 16, TypeScript, Tailwind v4, LibSQL, and deployed on Vercel. Features an AI chatbot, admin dashboard, and full analytics.",
    imageUrl: "/images/projects/portfolio.png",
    link: "https://m-s-r-portfolio.vercel.app",
    githubUrl: "https://github.com/Mohan6201",
    tech: JSON.stringify(["Next.js 16", "TypeScript", "Tailwind", "LibSQL", "Vercel", "Gemini AI"]),
    responsibilities: JSON.stringify([
      "Architected a production-grade Next.js app with a domain-driven structure and server components.",
      "Integrated a Google Gemini AI chatbot with context-aware DevOps responses.",
      "Built an admin dashboard with full content management for profile, skills, experience, and projects.",
      "Implemented SQLite/LibSQL database with Drizzle ORM and Better Auth.",
      "Deployed with Vercel Analytics, Speed Insights, and automated CI/CD on every push.",
    ]),
    align: "right",
    sortOrder: 0,
  },
  {
    profileId: profile.id,
    name: "Txenia AI/ML WMS Platform",
    year: "Nov 2023",
    description: "End-to-end DevOps for an AI-powered Warehouse Management System — from containerisation to CI/CD to production monitoring.",
    imageUrl: "/images/projects/txenia.png",
    link: "https://txenia.ai/",
    tech: JSON.stringify(["AWS ECS", "Docker", "CodePipeline", "GitHub Actions", "MLflow", "CloudWatch"]),
    responsibilities: JSON.stringify([
      "Built CI/CD pipeline with GitHub Actions + AWS CodePipeline enabling one-click deploys.",
      "Dockerised Django/React/ML services and deployed via ECS Fargate with auto-scaling.",
      "Integrated MLflow for live ML model tracking and Apache Superset for dashboards.",
      "Configured Route 53 + ALB DNS for zero-downtime blue/green deployments.",
      "Set up CloudWatch alarms and custom metrics for ML inference latency monitoring.",
    ]),
    align: "left",
    sortOrder: 1,
  },
  {
    profileId: profile.id,
    name: "Good Eggs WMS Migration",
    year: "Jan 2023",
    description: "Mission-critical WMS platform migration from HighJump to Körber for Good Eggs, a fresh grocery delivery service.",
    imageUrl: "/images/projects/goodeggs.png",
    link: "https://www.goodeggs.com/",
    tech: JSON.stringify(["Körber WMS", "SQL Server", "IIS", "Bartender", "Confluence"]),
    responsibilities: JSON.stringify([
      "Migrated DB, apps, configs, Bartender, IIS, and remote printers across DEV/UAT/PROD.",
      "Modified application URLs in Page Editor and configured IIS for Körber Core hosting.",
      "Managed ticketing portal and Confluence documentation for seamless knowledge transfer.",
    ]),
    align: "right",
    sortOrder: 2,
  },
  {
    profileId: profile.id,
    name: "Dr.Max Pharmacy WMS",
    year: "Jun 2023",
    description: "Full lifecycle WMS deployment and migration for Dr.Max, one of Europe's largest pharmacy chains.",
    imageUrl: "/images/projects/drmax.png",
    link: "https://www.drmax.eu/en/default",
    tech: JSON.stringify(["Körber WMS", "SQL Server", "Windows Server", "Bartender", "Sanity Testing"]),
    responsibilities: JSON.stringify([
      "Executed end-to-end warehouse operations — receiving, picking, packing, and shipping.",
      "Configured Bartender software and modified stored procedures for deployment requirements.",
      "Performed sanity testing across DEV, UAT, and PROD to validate deployment stability.",
      "Set up initial and remote printer configurations across all three environments.",
    ]),
    align: "left",
    sortOrder: 3,
  },
  {
    profileId: profile.id,
    name: "CareerOS — AI-Powered Professional Intelligence Platform",
    year: "2026 (in development)",
    description: "Solo-designed an AI-native career platform architecture built around a persistent \"Professional Twin\" user model, a hybrid multi-agent system (Google ADK + LangGraph), and an event-driven microservices design with a Kubernetes/ArgoCD deployment plan. Currently building the MVP on a Dockerized Django + React stack with CI/CD automation.",
    imageUrl: "/images/certs/blank.png",
    link: "#",
    tech: JSON.stringify(["Google ADK", "LangGraph", "Kubernetes", "ArgoCD", "Django", "React", "Docker", "CI/CD"]),
    responsibilities: JSON.stringify([
      "Solo-designed the end-to-end architecture: persistent \"Professional Twin\" user model.",
      "Hybrid multi-agent system combining Google ADK and LangGraph for career intelligence workflows.",
      "Event-driven microservices design with a Kubernetes/ArgoCD deployment plan.",
      "Building the MVP on a Dockerized Django + React stack with CI/CD automation.",
    ]),
    align: "right",
    sortOrder: 4,
  },
]);
console.log("  ✔  Projects inserted");

console.log("\n✅  Seed complete! Run `npm run dev` to see your portfolio.");
process.exit(0);
