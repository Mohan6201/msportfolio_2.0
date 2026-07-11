export interface Doc {
  title: string;
  file: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Reference";
  source: "static" | "uploaded";
  id?: number;
}

/** Bundled KT Centre reference PDFs — shipped with the site, distinct from admin-uploaded docs. */
export const STATIC_DOCS: Doc[] = [
  /* ── AWS ── */
  { title: "AWS DevOps Cheat Sheet 2025",      file: "AWS DevOps (2025 latest)– FREE Cheat Sheet!.pdf", category: "AWS",        level: "Reference",    source: "static" },
  { title: "AWS Design Handbook",               file: "Aws Design Handbook.pdf",                         category: "AWS",        level: "Intermediate", source: "static" },
  { title: "AWS Key Services Overview",         file: "Aws Key Services Overview.pdf",                   category: "AWS",        level: "Beginner",     source: "static" },
  { title: "AWS S3 Deep Dive",                  file: "Aws S3.pdf",                                      category: "AWS",        level: "Intermediate", source: "static" },
  { title: "AWS Solution Architect Guide",      file: "Aws Solution Architect Guide.pdf",                category: "AWS",        level: "Advanced",     source: "static" },
  { title: "AWS Interview Questions",           file: "Aws interview Questions.pdf",                     category: "AWS",        level: "Reference",    source: "static" },
  /* ── Docker ── */
  { title: "Docker Compose Guide",              file: "Docker Compose Guide.pdf",                        category: "Docker",     level: "Intermediate", source: "static" },
  { title: "Docker Complete Guide",             file: "Docker Guide.pdf",                                category: "Docker",     level: "Beginner",     source: "static" },
  { title: "Docker Interview Prep",             file: "Docker Interview Prep.pdf",                       category: "Docker",     level: "Reference",    source: "static" },
  { title: "Docker Notes",                      file: "Docker Notes.pdf",                                category: "Docker",     level: "Reference",    source: "static" },
  /* ── Kubernetes ── */
  { title: "Kubernetes: Beginner to Advanced",  file: "Kubernetes Beginers to Obsolute Advance.pdf",     category: "Kubernetes", level: "Advanced",     source: "static" },
  { title: "Kubernetes Deployments",            file: "Kubernetes Deployments.pdf",                      category: "Kubernetes", level: "Intermediate", source: "static" },
  { title: "Kubernetes Interview Prep",         file: "Kubernetes Interview Prep.pdf",                   category: "Kubernetes", level: "Reference",    source: "static" },
  { title: "Kubernetes Interview Questions",    file: "Kubernetes Interview Questions - New.pdf",         category: "Kubernetes", level: "Reference",    source: "static" },
  { title: "Master Kubernetes Networking",      file: "Master Kubernetes Networking.pdf",                category: "Kubernetes", level: "Advanced",     source: "static" },
  { title: "Helm Charts Guide",                 file: "Helm.pdf",                                        category: "Kubernetes", level: "Intermediate", source: "static" },
  /* ── Linux & Bash ── */
  { title: "50 Essential Linux Commands",       file: "50 Linux Commands.pdf",                           category: "Linux",      level: "Reference",    source: "static" },
  { title: "Bash Scripting Fundamentals",       file: "Bash Scripting.pdf",                              category: "Linux",      level: "Beginner",     source: "static" },
  { title: "Bash Shell Scripting",              file: "Bash Shell Scripting.pdf",                        category: "Linux",      level: "Intermediate", source: "static" },
  { title: "Introduction to Bash Scripting",   file: "Introduction to Bash Scripting.pdf",              category: "Linux",      level: "Beginner",     source: "static" },
  { title: "Linux Interview Questions",         file: "Linux Interview Questions.pdf",                   category: "Linux",      level: "Reference",    source: "static" },
  { title: "Linux Q & A",                       file: "Linux Q & A.pdf",                                 category: "Linux",      level: "Reference",    source: "static" },
  { title: "Linux & Shell Scripting Guide",     file: "Linux and Shell Scripting Guide.pdf",             category: "Linux",      level: "Intermediate", source: "static" },
  { title: "Linux Administration",              file: "Linux. Admin.pdf",                                category: "Linux",      level: "Advanced",     source: "static" },
  { title: "Linux Security Journey",            file: "The Linux Security journey.pdf",                  category: "Linux",      level: "Advanced",     source: "static" },
  /* ── Terraform ── */
  { title: "Terraform: Beginner to Master",     file: "Terraform Beginner to Master.pdf",                category: "Terraform",  level: "Advanced",     source: "static" },
  { title: "Terraform Comprehensive Guide",     file: "Terraform Comprehensive Guide.pdf",               category: "Terraform",  level: "Intermediate", source: "static" },
  { title: "Terraform Interview Questions",     file: "Terraform Interview Questions.pdf",               category: "Terraform",  level: "Reference",    source: "static" },
  { title: "Terraform (New Edition)",           file: "Terraform New.pdf",                               category: "Terraform",  level: "Intermediate", source: "static" },
  { title: "Terraform Essentials",              file: "Terraform.pdf",                                   category: "Terraform",  level: "Beginner",     source: "static" },
  /* ── DevOps General ── */
  { title: "DevOps Roadmap 2025",               file: "Dev Ops Road Map.pdf",                            category: "DevOps",     level: "Reference",    source: "static" },
  { title: "DevOps Q & A",                      file: "Dev-Ops Q & A.pdf",                               category: "DevOps",     level: "Reference",    source: "static" },
  { title: "DevOps Cheat Sheet",                file: "Devops Cheat sheat.pdf",                          category: "DevOps",     level: "Reference",    source: "static" },
  { title: "Accenture DevOps Interview",        file: "Interview Devops Accenture.pdf",                  category: "DevOps",     level: "Reference",    source: "static" },
  { title: "Ultimate DevOps Guide Vol. 1",      file: "Ultimate_DevOps_Guide.pdf",                       category: "DevOps",     level: "Intermediate", source: "static" },
  { title: "Ultimate DevOps Guide Vol. 2",      file: "Ultimate_DevOps_Guide_2.pdf",                     category: "DevOps",     level: "Advanced",     source: "static" },
  { title: "Ultimate DevOps Interview Guide",   file: "Ultimate_DevOps_Interview_Guide.pdf",             category: "DevOps",     level: "Reference",    source: "static" },
  /* ── CI/CD & Git ── */
  { title: "CI/CD Pipeline Guide",              file: "CI CD.pdf",                                       category: "CI/CD",      level: "Intermediate", source: "static" },
  { title: "ArgoCD GitOps Guide",               file: "Argo cd.pdf",                                     category: "CI/CD",      level: "Advanced",     source: "static" },
  { title: "Git Comprehensive Guide",           file: "Git Comprehensive Guide.pdf",                     category: "CI/CD",      level: "Intermediate", source: "static" },
  /* ── Ansible ── */
  { title: "Ansible Automation",                file: "Ansible Automation.pdf",                          category: "Ansible",    level: "Intermediate", source: "static" },
  { title: "Ansible Interview Prep",            file: "Ansible Interview Prep.pdf",                      category: "Ansible",    level: "Reference",    source: "static" },
  /* ── Networking ── */
  { title: "Networking for DevOps",             file: "Networking for devops.pdf",                       category: "Networking", level: "Intermediate", source: "static" },
  { title: "Load Balancing Strategies",         file: "Load Balancing Stratagies.pdf",                   category: "Networking", level: "Advanced",     source: "static" },
  { title: "Nginx Complete Guide",              file: "Nginx.pdf",                                       category: "Networking", level: "Intermediate", source: "static" },
  { title: "Microservices Architecture",        file: "Microservices.pdf",                               category: "Networking", level: "Advanced",     source: "static" },
  /* ── Azure ── */
  { title: "Azure DevOps Cheat Sheet",          file: "Azure Devops Cheat sheat.pdf",                    category: "Azure",      level: "Reference",    source: "static" },
  /* ── OS & Systems ── */
  { title: "Operating Systems Fundamentals",    file: "Operating Systems.pdf",                           category: "Systems",    level: "Beginner",     source: "static" },
  { title: "Python Data Structures",            file: "Data Structures of Python.pdf",                   category: "Systems",    level: "Intermediate", source: "static" },
  /* ── Cloud Architecture ── */
  { title: "Multimodal Chatbot — GCP",          file: "Multimodal_Chatbot_GCP_Solution.pdf",             category: "Cloud",      level: "Advanced",     source: "static" },
];
