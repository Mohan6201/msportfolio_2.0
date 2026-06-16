#!/usr/bin/env tsx
/**
 * Seeds the profile database with data from the legacy portfolio.config.ts.
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
    title: "DevOps Engineer",
    bio: "AWS DevOps Engineer building scalable cloud infrastructure, CI/CD pipelines, and automated delivery systems.",
    location: "Hitech City, Hyderabad, India",
    email: "mohandevopssme@gmail.com",
    phone: "+91 80988 85683",
    avatarUrl: "/images/profile/avatar.png",
    careerStartDate: "2022-04-01",
    currentCompany: "Swirepay",
    currentDesignation: "DevOps Engineer",
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
  // ── DevOps & IaC ───────────────────────────────────────────────────────────
  { profileId: profile.id, name: "Docker",                           category: "devops",     level: 90, iconKey: "FaDocker",       sortOrder: 3 },
  { profileId: profile.id, name: "Terraform",                        category: "devops",     level: 85, iconKey: "SiTerraform",    sortOrder: 4 },
  { profileId: profile.id, name: "Ansible",                          category: "devops",     level: 72, iconKey: "SiAnsible",      sortOrder: 5 },
  { profileId: profile.id, name: "GitHub Actions",                   category: "devops",     level: 90, iconKey: "SiGithubactions",sortOrder: 6 },
  { profileId: profile.id, name: "Jenkins CI",                       category: "devops",     level: 78, iconKey: "FaJenkins",      sortOrder: 7 },
  // ── Languages & Backend ────────────────────────────────────────────────────
  { profileId: profile.id, name: "Python",                           category: "backend",    level: 82, iconKey: "FaPython",       sortOrder: 8 },
  { profileId: profile.id, name: "Bash Shell Scripting",             category: "backend",    level: 85, iconKey: "SiGnubash",      sortOrder: 9 },
  { profileId: profile.id, name: "Django",                           category: "backend",    level: 70, iconKey: "SiDjango",       sortOrder: 10 },
  { profileId: profile.id, name: "React / Next.js",                  category: "backend",    level: 68, iconKey: "FaReact",        sortOrder: 11 },
  { profileId: profile.id, name: "Linux Administration",             category: "backend",    level: 88, iconKey: "SiLinux",        sortOrder: 12 },
  // ── Monitoring ─────────────────────────────────────────────────────────────
  { profileId: profile.id, name: "Grafana",                          category: "monitoring", level: 76, iconKey: "SiGrafana",      sortOrder: 13 },
  { profileId: profile.id, name: "Prometheus",                       category: "monitoring", level: 74, iconKey: "SiPrometheus",   sortOrder: 14 },
]);
console.log("  ✔  Skills inserted");

// ── 4. Experiences ───────────────────────────────────────────────────────────
await db.insert(experiences).values([
  {
    profileId: profile.id,
    jobTitle: "DevOps Engineer",
    company: "Swirepay",
    companyUrl: "https://swirepay.com",
    startDate: "SEP 2025",
    endDate: null,
    isCurrent: true,
    tech: JSON.stringify(["AWS", "Kubernetes", "Terraform", "GitHub Actions", "Vault", "Helm"]),
    responsibilities: JSON.stringify([
      "Architecting and managing cloud infrastructure for PCI-DSS-compliant payment processing on AWS.",
      "Implementing Kubernetes (EKS) with Helm for microservices orchestration and zero-downtime deployments.",
      "Designing multi-stage CI/CD pipelines for secure, automated fintech application releases.",
      "Managing secrets using HashiCorp Vault and AWS Secrets Manager across environments.",
      "Ensuring 99.99% availability for payment gateway systems with auto-scaling and DR strategy.",
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
    title: "DevOps Certified Expert (In-Progress)",
    issuer: "Guvi",
    date: "2025-05-17",
    description: "Hands-on training with Git, Jenkins, Docker, Ansible, Terraform, and Kubernetes covering end-to-end DevOps workflows.",
    imageUrl: "/images/certs/blank.png",
    sortOrder: 0,
  },
  {
    profileId: profile.id,
    title: "AWS Solutions Architect Associate",
    issuer: "RedSys9 Tech Pvt Ltd",
    date: "2025-04-21",
    description: "Designing scalable, secure, and reliable AWS cloud architectures using EC2, S3, VPC, IAM, and more.",
    imageUrl: "/images/certs/asa.jfif",
    sortOrder: 1,
  },
  {
    profileId: profile.id,
    title: "Warehouse Advantage Certified Associate",
    issuer: "Körber Supply Chain",
    date: "2023-09-09",
    description: "Real-time warehouse operations and inventory management expertise; supply chain efficiency optimization.",
    imageUrl: "/images/certs/korber.png",
    link: "https://www.credly.com/badges/e12dca0f-078f-40ab-b8e9-647121ddf599/linked_in_profile",
    sortOrder: 2,
  },
  {
    profileId: profile.id,
    title: "Full Stack Developer",
    issuer: "3Edge Solutions Pvt Ltd",
    date: "2022-12-27",
    description: "Complete web application development with front-end and back-end technologies.",
    imageUrl: "/images/certs/3edge.png",
    link: "https://www.credly.com/badges/e12dca0f-078f-40ab-b8e9-647121ddf599/linked_in_profile",
    sortOrder: 3,
  },
]);
console.log("  ✔  Certifications inserted");

// ── 6. Projects ──────────────────────────────────────────────────────────────
await db.insert(projects).values([
  {
    profileId: profile.id,
    name: "Next.js DevOps Portfolio",
    year: "2025",
    description: "This very portfolio — built with Next.js 15, TypeScript, Tailwind v4, LibSQL, and deployed on Vercel. Features AI chatbot, blog CMS, admin dashboard, and full analytics.",
    imageUrl: "/images/projects/portfolio.png",
    link: "https://m-s-r-portfolio.vercel.app",
    githubUrl: "https://github.com/Mohan6201",
    tech: JSON.stringify(["Next.js 15", "TypeScript", "Tailwind", "LibSQL", "Vercel", "Gemini AI"]),
    responsibilities: JSON.stringify([
      "Architected production-grade Next.js 15 app with App Router and server components.",
      "Integrated Google Gemini 2.0 Flash AI chatbot with context-aware DevOps responses.",
      "Built blog CMS with MDX, OG image generation, comments, and newsletter subscription.",
      "Implemented SQLite/LibSQL database with admin dashboard for content management.",
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
]);
console.log("  ✔  Projects inserted");

console.log("\n✅  Seed complete! Run `npm run dev` to see your portfolio.");
process.exit(0);
