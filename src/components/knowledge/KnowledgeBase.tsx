"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Download, ExternalLink, Server, Container, TerminalSquare,
  GitBranch, Layers, Shield, Network, Cloud, Database, Cpu, Settings2,
} from "lucide-react";

const BASE = "/Resource Images/Documents";
const u = (f: string) => encodeURI(`${BASE}/${f}`);

interface Doc {
  title: string;
  file: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Reference";
}

const DOCS: Doc[] = [
  /* ── AWS ── */
  { title: "AWS DevOps Cheat Sheet 2025",      file: "AWS DevOps (2025 latest)– FREE Cheat Sheet!.pdf", category: "AWS",      level: "Reference" },
  { title: "AWS Design Handbook",               file: "Aws Design Handbook.pdf",                         category: "AWS",      level: "Intermediate" },
  { title: "AWS Key Services Overview",         file: "Aws Key Services Overview.pdf",                   category: "AWS",      level: "Beginner" },
  { title: "AWS S3 Deep Dive",                  file: "Aws S3.pdf",                                      category: "AWS",      level: "Intermediate" },
  { title: "AWS Solution Architect Guide",      file: "Aws Solution Architect Guide.pdf",                category: "AWS",      level: "Advanced" },
  { title: "AWS Interview Questions",           file: "Aws interview Questions.pdf",                     category: "AWS",      level: "Reference" },
  /* ── Docker ── */
  { title: "Docker Compose Guide",              file: "Docker Compose Guide.pdf",                        category: "Docker",   level: "Intermediate" },
  { title: "Docker Complete Guide",             file: "Docker Guide.pdf",                                category: "Docker",   level: "Beginner" },
  { title: "Docker Interview Prep",             file: "Docker Interview Prep.pdf",                       category: "Docker",   level: "Reference" },
  { title: "Docker Notes",                      file: "Docker Notes.pdf",                                category: "Docker",   level: "Reference" },
  /* ── Kubernetes ── */
  { title: "Kubernetes: Beginner to Advanced",  file: "Kubernetes Beginers to Obsolute Advance.pdf",     category: "Kubernetes", level: "Advanced" },
  { title: "Kubernetes Deployments",            file: "Kubernetes Deployments.pdf",                      category: "Kubernetes", level: "Intermediate" },
  { title: "Kubernetes Interview Prep",         file: "Kubernetes Interview Prep.pdf",                   category: "Kubernetes", level: "Reference" },
  { title: "Kubernetes Interview Questions",    file: "Kubernetes Interview Questions - New.pdf",         category: "Kubernetes", level: "Reference" },
  { title: "Master Kubernetes Networking",      file: "Master Kubernetes Networking.pdf",                category: "Kubernetes", level: "Advanced" },
  { title: "Helm Charts Guide",                 file: "Helm.pdf",                                        category: "Kubernetes", level: "Intermediate" },
  /* ── Linux & Bash ── */
  { title: "50 Essential Linux Commands",       file: "50 Linux Commands.pdf",                           category: "Linux",    level: "Reference" },
  { title: "Bash Scripting Fundamentals",       file: "Bash Scripting.pdf",                              category: "Linux",    level: "Beginner" },
  { title: "Bash Shell Scripting",              file: "Bash Shell Scripting.pdf",                        category: "Linux",    level: "Intermediate" },
  { title: "Introduction to Bash Scripting",   file: "Introduction to Bash Scripting.pdf",              category: "Linux",    level: "Beginner" },
  { title: "Linux Interview Questions",         file: "Linux Interview Questions.pdf",                   category: "Linux",    level: "Reference" },
  { title: "Linux Q & A",                       file: "Linux Q & A.pdf",                                 category: "Linux",    level: "Reference" },
  { title: "Linux & Shell Scripting Guide",     file: "Linux and Shell Scripting Guide.pdf",             category: "Linux",    level: "Intermediate" },
  { title: "Linux Administration",              file: "Linux. Admin.pdf",                                category: "Linux",    level: "Advanced" },
  { title: "Linux Security Journey",            file: "The Linux Security journey.pdf",                  category: "Linux",    level: "Advanced" },
  /* ── Terraform ── */
  { title: "Terraform: Beginner to Master",     file: "Terraform Beginner to Master.pdf",                category: "Terraform", level: "Advanced" },
  { title: "Terraform Comprehensive Guide",     file: "Terraform Comprehensive Guide.pdf",               category: "Terraform", level: "Intermediate" },
  { title: "Terraform Interview Questions",     file: "Terraform Interview Questions.pdf",               category: "Terraform", level: "Reference" },
  { title: "Terraform (New Edition)",           file: "Terraform New.pdf",                               category: "Terraform", level: "Intermediate" },
  { title: "Terraform Essentials",              file: "Terraform.pdf",                                   category: "Terraform", level: "Beginner" },
  /* ── DevOps General ── */
  { title: "DevOps Roadmap 2025",               file: "Dev Ops Road Map.pdf",                            category: "DevOps",   level: "Reference" },
  { title: "DevOps Q & A",                      file: "Dev-Ops Q & A.pdf",                               category: "DevOps",   level: "Reference" },
  { title: "DevOps Cheat Sheet",                file: "Devops Cheat sheat.pdf",                          category: "DevOps",   level: "Reference" },
  { title: "Accenture DevOps Interview",        file: "Interview Devops Accenture.pdf",                  category: "DevOps",   level: "Reference" },
  { title: "Ultimate DevOps Guide Vol. 1",      file: "Ultimate_DevOps_Guide.pdf",                       category: "DevOps",   level: "Intermediate" },
  { title: "Ultimate DevOps Guide Vol. 2",      file: "Ultimate_DevOps_Guide_2.pdf",                     category: "DevOps",   level: "Advanced" },
  { title: "Ultimate DevOps Interview Guide",   file: "Ultimate_DevOps_Interview_Guide.pdf",             category: "DevOps",   level: "Reference" },
  /* ── CI/CD & Git ── */
  { title: "CI/CD Pipeline Guide",              file: "CI CD.pdf",                                       category: "CI/CD",    level: "Intermediate" },
  { title: "ArgoCD GitOps Guide",               file: "Argo cd.pdf",                                     category: "CI/CD",    level: "Advanced" },
  { title: "Git Comprehensive Guide",           file: "Git Comprehensive Guide.pdf",                     category: "CI/CD",    level: "Intermediate" },
  /* ── Ansible ── */
  { title: "Ansible Automation",                file: "Ansible Automation.pdf",                          category: "Ansible",  level: "Intermediate" },
  { title: "Ansible Interview Prep",            file: "Ansible Interview Prep.pdf",                      category: "Ansible",  level: "Reference" },
  /* ── Networking ── */
  { title: "Networking for DevOps",             file: "Networking for devops.pdf",                       category: "Networking", level: "Intermediate" },
  { title: "Load Balancing Strategies",         file: "Load Balancing Stratagies.pdf",                   category: "Networking", level: "Advanced" },
  { title: "Nginx Complete Guide",              file: "Nginx.pdf",                                       category: "Networking", level: "Intermediate" },
  { title: "Microservices Architecture",        file: "Microservices.pdf",                               category: "Networking", level: "Advanced" },
  /* ── Azure ── */
  { title: "Azure DevOps Cheat Sheet",          file: "Azure Devops Cheat sheat.pdf",                    category: "Azure",    level: "Reference" },
  /* ── OS & Systems ── */
  { title: "Operating Systems Fundamentals",    file: "Operating Systems.pdf",                           category: "Systems",  level: "Beginner" },
  { title: "Python Data Structures",            file: "Data Structures of Python.pdf",                   category: "Systems",  level: "Intermediate" },
  /* ── Cloud Architecture ── */
  { title: "Multimodal Chatbot — GCP Solution", file: "Multimodal_Chatbot_GCP_Solution.pdf",             category: "Cloud",    level: "Advanced" },
];

const CATEGORIES = ["All", "AWS", "Docker", "Kubernetes", "Linux", "Terraform", "DevOps", "CI/CD", "Ansible", "Networking", "Azure", "Systems", "Cloud"];

const CAT_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  AWS:        { icon: Cloud,          color: "text-orange",          bg: "bg-orange/10 border-orange/20" },
  Docker:     { icon: Container,      color: "text-cyan",            bg: "bg-cyan/10 border-cyan/20" },
  Kubernetes: { icon: Layers,         color: "text-[#326CE5]",       bg: "bg-[#326CE5]/10 border-[#326CE5]/20" },
  Linux:      { icon: TerminalSquare, color: "text-green",           bg: "bg-green/10 border-green/20" },
  Terraform:  { icon: Server,         color: "text-[#844FBA]",       bg: "bg-[#844FBA]/10 border-[#844FBA]/20" },
  DevOps:     { icon: Settings2,      color: "text-cyan",            bg: "bg-cyan/5 border-cyan/10" },
  "CI/CD":    { icon: GitBranch,      color: "text-orange",          bg: "bg-orange/5 border-orange/10" },
  Ansible:    { icon: Database,       color: "text-[#EE0000]",       bg: "bg-[#EE0000]/10 border-[#EE0000]/20" },
  Networking: { icon: Network,        color: "text-[#00d4ff]",       bg: "bg-cyan/5 border-cyan/10" },
  Azure:      { icon: Cloud,          color: "text-[#0089d6]",       bg: "bg-[#0089d6]/10 border-[#0089d6]/20" },
  Systems:    { icon: Cpu,            color: "text-lightGrey",       bg: "bg-white/5 border-white/10" },
  Cloud:      { icon: Shield,         color: "text-green",           bg: "bg-green/5 border-green/10" },
};

const LEVEL_STYLE: Record<string, string> = {
  Beginner:     "text-green/80 border-green/20 bg-green/5",
  Intermediate: "text-cyan/80 border-cyan/20 bg-cyan/5",
  Advanced:     "text-orange/80 border-orange/20 bg-orange/5",
  Reference:    "text-lightGrey/60 border-white/10 bg-white/5",
};

function DocCard({ doc, index }: { doc: Doc; index: number }) {
  const meta = CAT_META[doc.category] ?? CAT_META.DevOps;
  const Icon = meta.icon;
  const pdfSrc = u(doc.file);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="glass glass-hover rounded-xl p-4 border border-white/5 flex flex-col gap-3 group"
    >
      {/* Icon + category */}
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${meta.bg}`}>
          <Icon className={`w-4 h-4 ${meta.color}`} />
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${LEVEL_STYLE[doc.level]}`}>
          {doc.level}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-mono font-medium text-white/90 leading-snug group-hover:text-cyan transition-colors duration-200 flex-1">
        {doc.title}
      </p>

      {/* Category tag */}
      <span className={`self-start text-[10px] font-mono px-2 py-0.5 rounded border ${meta.bg} ${meta.color}`}>
        {doc.category}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <a
          href={pdfSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-lightGrey text-xs font-mono hover:border-cyan/40 hover:text-cyan transition-all duration-200"
        >
          <ExternalLink className="w-3 h-3" />
          View
        </a>
        <a
          href={pdfSrc}
          download
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan/10 border border-cyan/20 text-cyan text-xs font-mono hover:bg-cyan/20 transition-all duration-200"
        >
          <Download className="w-3 h-3" />
          Save
        </a>
      </div>
    </motion.div>
  );
}

export default function KnowledgeBase() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? DOCS : DOCS.filter((d) => d.category === active);

  const counts = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = cat === "All" ? DOCS.length : DOCS.filter((d) => d.category === cat).length;
    return acc;
  }, {});

  return (
    <section id="knowledge" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-14"
        >
          <p className="section-tag mb-4">Knowledge Transfer</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-special text-3xl sm:text-4xl font-bold text-white">
                KT <span className="gradient-text">Centre</span>
              </h2>
              <p className="text-lightGrey text-sm font-mono mt-2 max-w-lg">
                {DOCS.length} curated DevOps resources — interview prep, deep dives, and cheat sheets. Free to view and download.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-lightGrey/50">
              <BookOpen className="w-3.5 h-3.5" />
              {DOCS.length} PDFs · {CATEGORIES.length - 1} categories
            </div>
          </div>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200 ${
                active === cat
                  ? "bg-cyan/15 border-cyan/40 text-cyan"
                  : "bg-white/5 border-white/10 text-lightGrey hover:border-cyan/20 hover:text-white"
              }`}
            >
              {cat}
              <span className={`ml-1.5 px-1 py-0.5 rounded text-[10px] ${active === cat ? "text-cyan/70" : "text-lightGrey/40"}`}>
                {counts[cat]}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((doc, i) => (
              <DocCard key={doc.file} doc={doc} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 glass rounded-2xl p-6 border border-cyan/10 text-center"
        >
          <p className="text-xs font-mono text-lightGrey/50 mb-1">All resources are freely available and sourced from the DevOps community.</p>
          <p className="text-xs font-mono text-lightGrey/30">Use them to prep, learn, and ship — that&apos;s what they&apos;re for.</p>
        </motion.div>
      </div>
    </section>
  );
}
