// src/app/api/admin/seed-kt/route.ts
// FIXED: pass empty Buffer instead of undefined for fileData

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { ktDocuments } from "@/db/schema/legacy";

const STATIC_DOCS = [
  { title: "AWS DevOps Cheat Sheet 2025",      file: "AWS DevOps (2025 latest)– FREE Cheat Sheet!.pdf", category: "AWS",        level: "Reference" },
  { title: "AWS Design Handbook",               file: "Aws Design Handbook.pdf",                         category: "AWS",        level: "Intermediate" },
  { title: "AWS Key Services Overview",         file: "Aws Key Services Overview.pdf",                   category: "AWS",        level: "Beginner" },
  { title: "AWS S3 Deep Dive",                  file: "Aws S3.pdf",                                      category: "AWS",        level: "Intermediate" },
  { title: "AWS Solution Architect Guide",      file: "Aws Solution Architect Guide.pdf",                category: "AWS",        level: "Advanced" },
  { title: "AWS Interview Questions",           file: "Aws interview Questions.pdf",                     category: "AWS",        level: "Reference" },
  { title: "Docker Compose Guide",              file: "Docker Compose Guide.pdf",                        category: "Docker",     level: "Intermediate" },
  { title: "Docker Complete Guide",             file: "Docker Guide.pdf",                                category: "Docker",     level: "Beginner" },
  { title: "Docker Interview Prep",             file: "Docker Interview Prep.pdf",                       category: "Docker",     level: "Reference" },
  { title: "Docker Notes",                      file: "Docker Notes.pdf",                                category: "Docker",     level: "Reference" },
  { title: "Kubernetes: Beginner to Advanced",  file: "Kubernetes Beginers to Obsolute Advance.pdf",     category: "Kubernetes", level: "Advanced" },
  { title: "Kubernetes Deployments",            file: "Kubernetes Deployments.pdf",                      category: "Kubernetes", level: "Intermediate" },
  { title: "Kubernetes Interview Prep",         file: "Kubernetes Interview Prep.pdf",                   category: "Kubernetes", level: "Reference" },
  { title: "Kubernetes Interview Questions",    file: "Kubernetes Interview Questions - New.pdf",         category: "Kubernetes", level: "Reference" },
  { title: "Master Kubernetes Networking",      file: "Master Kubernetes Networking.pdf",                category: "Kubernetes", level: "Advanced" },
  { title: "Helm Charts Guide",                 file: "Helm.pdf",                                        category: "Kubernetes", level: "Intermediate" },
  { title: "50 Essential Linux Commands",       file: "50 Linux Commands.pdf",                           category: "Linux",      level: "Reference" },
  { title: "Bash Scripting Fundamentals",       file: "Bash Scripting.pdf",                              category: "Linux",      level: "Beginner" },
  { title: "Bash Shell Scripting",              file: "Bash Shell Scripting.pdf",                        category: "Linux",      level: "Intermediate" },
  { title: "Introduction to Bash Scripting",   file: "Introduction to Bash Scripting.pdf",              category: "Linux",      level: "Beginner" },
  { title: "Linux Interview Questions",         file: "Linux Interview Questions.pdf",                   category: "Linux",      level: "Reference" },
  { title: "Linux Q & A",                       file: "Linux Q & A.pdf",                                 category: "Linux",      level: "Reference" },
  { title: "Linux & Shell Scripting Guide",     file: "Linux and Shell Scripting Guide.pdf",             category: "Linux",      level: "Intermediate" },
  { title: "Linux Administration",              file: "Linux. Admin.pdf",                                category: "Linux",      level: "Advanced" },
  { title: "Linux Security Journey",            file: "The Linux Security journey.pdf",                  category: "Linux",      level: "Advanced" },
  { title: "Terraform: Beginner to Master",     file: "Terraform Beginner to Master.pdf",                category: "Terraform",  level: "Advanced" },
  { title: "Terraform Comprehensive Guide",     file: "Terraform Comprehensive Guide.pdf",               category: "Terraform",  level: "Intermediate" },
  { title: "Terraform Interview Questions",     file: "Terraform Interview Questions.pdf",               category: "Terraform",  level: "Reference" },
  { title: "Terraform (New Edition)",           file: "Terraform New.pdf",                               category: "Terraform",  level: "Intermediate" },
  { title: "Terraform Essentials",              file: "Terraform.pdf",                                   category: "Terraform",  level: "Beginner" },
  { title: "DevOps Roadmap 2025",               file: "Dev Ops Road Map.pdf",                            category: "DevOps",     level: "Reference" },
  { title: "DevOps Q & A",                      file: "Dev-Ops Q & A.pdf",                               category: "DevOps",     level: "Reference" },
  { title: "DevOps Cheat Sheet",                file: "Devops Cheat sheat.pdf",                          category: "DevOps",     level: "Reference" },
  { title: "Accenture DevOps Interview",        file: "Interview Devops Accenture.pdf",                  category: "DevOps",     level: "Reference" },
  { title: "Ultimate DevOps Guide Vol. 1",      file: "Ultimate_DevOps_Guide.pdf",                       category: "DevOps",     level: "Intermediate" },
  { title: "Ultimate DevOps Guide Vol. 2",      file: "Ultimate_DevOps_Guide_2.pdf",                     category: "DevOps",     level: "Advanced" },
  { title: "Ultimate DevOps Interview Guide",   file: "Ultimate_DevOps_Interview_Guide.pdf",             category: "DevOps",     level: "Reference" },
  { title: "CI/CD Pipeline Guide",              file: "CI CD.pdf",                                       category: "CI/CD",      level: "Intermediate" },
  { title: "ArgoCD GitOps Guide",               file: "Argo cd.pdf",                                     category: "CI/CD",      level: "Advanced" },
  { title: "Git Comprehensive Guide",           file: "Git Comprehensive Guide.pdf",                     category: "CI/CD",      level: "Intermediate" },
  { title: "Ansible Automation",                file: "Ansible Automation.pdf",                          category: "Ansible",    level: "Intermediate" },
  { title: "Ansible Interview Prep",            file: "Ansible Interview Prep.pdf",                      category: "Ansible",    level: "Reference" },
  { title: "Networking for DevOps",             file: "Networking for devops.pdf",                       category: "Networking", level: "Intermediate" },
  { title: "Load Balancing Strategies",         file: "Load Balancing Stratagies.pdf",                   category: "Networking", level: "Advanced" },
  { title: "Nginx Complete Guide",              file: "Nginx.pdf",                                       category: "Networking", level: "Intermediate" },
  { title: "Microservices Architecture",        file: "Microservices.pdf",                               category: "Networking", level: "Advanced" },
] as const;

const EMPTY_BUFFER = Buffer.alloc(0);
const BASE_URL = "https://m-s-r-portfolio.vercel.app";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const doc of STATIC_DOCS) {
    try {
      const storageUrl = `${BASE_URL}/resources/docs/${encodeURIComponent(doc.file)}`;

      await db
        .insert(ktDocuments)
        .values({
          title: doc.title,
          filename: doc.file,
          category: doc.category,
          level: doc.level,
          fileData: EMPTY_BUFFER,  // ← empty buffer, not null/undefined
          fileSize: 0,
          storageUrl,
        })
        .onConflictDoUpdate({
          target: ktDocuments.filename,
          set: {
            title: doc.title,
            category: doc.category,
            level: doc.level,
            storageUrl,
          },
        });

      inserted++;
    } catch (err) {
      errors.push(`${doc.title}: ${err instanceof Error ? err.message : String(err)}`);
      skipped++;
    }
  }

  return NextResponse.json({
    ok: true,
    inserted,
    skipped,
    total: STATIC_DOCS.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
