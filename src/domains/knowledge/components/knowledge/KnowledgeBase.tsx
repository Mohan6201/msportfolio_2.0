"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Download, ExternalLink, Server, Container, TerminalSquare,
  GitBranch, Layers, Shield, Network, Cloud, Database, Cpu, Settings2,
  Upload, X, CheckCircle, AlertCircle, Loader2, Plus, Search,
} from "lucide-react";
import { usePDFViewer } from "@/components/ui/PDFViewer";
import ExpandDivider from "@/components/ui/ExpandDivider";

const COLLAPSED_DOC_COUNT = 8;

const BASE = "/resources/docs";
const u = (f: string) => encodeURI(`${BASE}/${f}`);

interface Doc {
  title: string;
  file: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Reference";
  source: "static" | "uploaded";
  id?: number;
}

const STATIC_DOCS: Doc[] = [
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

const CATEGORIES = ["All", "AWS", "Docker", "Kubernetes", "Linux", "Terraform", "DevOps", "CI/CD", "Ansible", "Networking", "Azure", "Systems", "Cloud"];
const UPLOAD_CATEGORIES = CATEGORIES.filter((c) => c !== "All");
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Reference"];

const CAT_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  AWS:        { icon: Cloud,          color: "text-orange",    bg: "bg-orange/10 border-orange/20" },
  Docker:     { icon: Container,      color: "text-cyan",      bg: "bg-cyan/10 border-cyan/20" },
  Kubernetes: { icon: Layers,         color: "text-[#326CE5]", bg: "bg-[#326CE5]/10 border-[#326CE5]/20" },
  Linux:      { icon: TerminalSquare, color: "text-green",     bg: "bg-green/10 border-green/20" },
  Terraform:  { icon: Server,         color: "text-[#844FBA]", bg: "bg-[#844FBA]/10 border-[#844FBA]/20" },
  DevOps:     { icon: Settings2,      color: "text-cyan",      bg: "bg-cyan/5 border-cyan/10" },
  "CI/CD":    { icon: GitBranch,      color: "text-orange",    bg: "bg-orange/5 border-orange/10" },
  Ansible:    { icon: Database,       color: "text-[#EE0000]", bg: "bg-[#EE0000]/10 border-[#EE0000]/20" },
  Networking: { icon: Network,        color: "text-cyan",      bg: "bg-cyan/5 border-cyan/10" },
  Azure:      { icon: Cloud,          color: "text-[#0089d6]", bg: "bg-[#0089d6]/10 border-[#0089d6]/20" },
  Systems:    { icon: Cpu,            color: "text-lightGrey", bg: "bg-white/5 border-white/10" },
  Cloud:      { icon: Shield,         color: "text-green",     bg: "bg-green/5 border-green/10" },
};

const LEVEL_STYLE: Record<string, string> = {
  Beginner:     "text-green/80 border-green/20 bg-green/5",
  Intermediate: "text-cyan/80 border-cyan/20 bg-cyan/5",
  Advanced:     "text-orange/80 border-orange/20 bg-orange/5",
  Reference:    "text-lightGrey/60 border-white/10 bg-white/5",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocCard({ doc, index }: { doc: Doc; index: number }) {
  const meta = CAT_META[doc.category] ?? CAT_META.DevOps;
  const Icon = meta.icon;
  const { openPDF } = usePDFViewer();

  const pdfUrl = doc.source === "uploaded" && doc.id
    ? `/api/kt-documents/${doc.id}`
    : u(doc.file);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
      className="glass glass-hover rounded-xl p-4 border border-white/5 flex flex-col gap-3 group"
    >
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${meta.bg}`}>
          <Icon className={`w-4 h-4 ${meta.color}`} />
        </div>
        <div className="flex items-center gap-1.5">
          {doc.source === "uploaded" && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-green/10 border border-green/20 text-green">uploaded</span>
          )}
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${LEVEL_STYLE[doc.level]}`}>{doc.level}</span>
        </div>
      </div>

      <p className="text-sm font-mono font-medium text-white/90 leading-snug group-hover:text-cyan transition-colors duration-200 flex-1 break-words">
        {doc.title}
      </p>

      <span className={`self-start text-[10px] font-mono px-2 py-0.5 rounded border ${meta.bg} ${meta.color}`}>
        {doc.category}
      </span>

      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <button
          onClick={() => openPDF(pdfUrl, doc.title)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan/10 border border-cyan/20 text-cyan text-xs font-mono hover:bg-cyan/20 transition-all duration-200"
        >
          <ExternalLink className="w-3 h-3" />
          View
        </button>
        <a
          href={pdfUrl}
          download={doc.file ?? `${doc.title}.pdf`}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-lightGrey text-xs font-mono hover:border-green/40 hover:text-green transition-all duration-200"
        >
          <Download className="w-3 h-3" />
          Save
        </a>
      </div>
    </motion.div>
  );
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

function UploadModal({ onClose, onUploaded }: { onClose: () => void; onUploaded: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("DevOps");
  const [level, setLevel] = useState<string>("Reference");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " "));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setStatus("uploading");
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title.trim());
      fd.append("category", category);
      fd.append("level", level);

      const res = await fetch("/api/kt-upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) { setStatus("error"); setErrorMsg(data.error ?? "Upload failed"); return; }

      setStatus("success");
      setTimeout(() => { onUploaded(); onClose(); }, 1200);
    } catch {
      setStatus("error");
      setErrorMsg("Network error — please try again.");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9000]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-[9001] glass rounded-2xl border border-white/10 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-special font-bold text-white text-lg">Upload Document</h3>
            <p className="text-xs font-mono text-lightGrey/50 mt-0.5">PDF only · max 50 MB · stored in the KT database</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-lightGrey hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* File drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
              file ? "border-cyan/40 bg-cyan/5" : "border-white/10 hover:border-cyan/30 hover:bg-cyan/3"
            }`}
          >
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={onFileChange} />
            {file ? (
              <>
                <CheckCircle className="w-7 h-7 text-cyan mx-auto mb-2" />
                <p className="text-sm font-mono text-white">{file.name}</p>
                <p className="text-xs text-lightGrey/50 mt-1">{formatSize(file.size)}</p>
              </>
            ) : (
              <>
                <Upload className="w-7 h-7 text-lightGrey/40 mx-auto mb-2" />
                <p className="text-sm font-mono text-lightGrey">Click to select a PDF</p>
                <p className="text-xs text-lightGrey/40 mt-1">or drag and drop</p>
              </>
            )}
          </div>

          {/* Title */}
          <input
            type="text"
            placeholder="Document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-white placeholder-lightGrey/40 outline-none focus:border-cyan/40 transition-colors"
          />

          {/* Category + Level row */}
          <div className="grid grid-cols-2 gap-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none focus:border-cyan/40 transition-colors">
              {UPLOAD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={level} onChange={(e) => setLevel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none focus:border-cyan/40 transition-colors">
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Error */}
          {status === "error" && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!file || !title.trim() || status === "uploading" || status === "success"}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan text-black font-mono font-bold text-sm hover:bg-lightCyan disabled:opacity-50 transition-all"
          >
            {status === "uploading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> :
             status === "success"   ? <><CheckCircle className="w-4 h-4" /> Uploaded!</> :
             <><Upload className="w-4 h-4" /> Upload to KT Centre</>}
          </button>
        </form>
      </motion.div>
    </>
  );
}

type SearchResult = {
  documentId: number;
  title: string;
  category: string;
  level: string;
  storageUrl: string | null;
  content: string;
  distance: number;
};

function AISearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const { openPDF } = usePDFViewer();

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/kt-search?q=${encodeURIComponent(query)}`);
      const { results: r } = await res.json();
      setResults(r);
    } finally {
      setSearching(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-8 glass rounded-2xl border border-cyan/10 p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-4 h-4 text-cyan" />
        <h3 className="text-sm font-mono font-bold text-white">AI Search</h3>
        <span className="text-[10px] font-mono text-lightGrey/40 ml-1">Ask anything about the documents</span>
      </div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="e.g. How do I configure Nginx reverse proxy?"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder-lightGrey/30 focus:outline-none focus:border-cyan/40 transition-colors"
        />
        <button
          onClick={search}
          disabled={searching || !query.trim()}
          className="px-4 py-2 bg-cyan text-black text-xs font-mono font-bold rounded-xl hover:bg-lightCyan transition-colors disabled:opacity-50"
        >
          {searching ? "…" : "Search"}
        </button>
      </div>
      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((r, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-white text-xs font-mono font-bold">{r.title}</p>
                  <p className="text-lightGrey/50 text-[10px] font-mono mt-0.5">{r.category} · {r.level}</p>
                  {r.content && (
                    <p className="text-lightGrey text-[10px] font-mono mt-1.5 line-clamp-2">{r.content}</p>
                  )}
                </div>
                <button
                  onClick={() => openPDF(r.storageUrl ?? `/api/kt-documents/${r.documentId}`, r.title)}
                  className="flex-shrink-0 text-[10px] font-mono text-cyan border border-cyan/30 rounded px-2 py-1 hover:bg-cyan/10 transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function KnowledgeBase() {
  const [active, setActive] = useState("All");
  const [uploadedDocs, setUploadedDocs] = useState<Doc[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);

  const fetchUploaded = async () => {
    try {
      const res = await fetch("/api/kt-documents");
      const data = await res.json();
      if (data.docs) {
        setUploadedDocs(data.docs.map((d: { id: number; title: string; filename: string; category: string; level: string }) => ({
          id: d.id,
          title: d.title,
          file: d.filename,
          category: d.category,
          level: d.level as Doc["level"],
          source: "uploaded" as const,
        })));
      }
    } catch { /* silently degrade */ }
  };

  useEffect(() => { fetchUploaded(); }, []);

  const allDocs = [...uploadedDocs, ...STATIC_DOCS];
  const filtered = active === "All" ? allDocs : allDocs.filter((d) => d.category === active);
  const visibleDocs = showAllDocs ? filtered : filtered.slice(0, COLLAPSED_DOC_COUNT);

  const selectCategory = (cat: string) => {
    setActive(cat);
    setShowAllDocs(false);
  };

  const counts = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = cat === "All" ? allDocs.length : allDocs.filter((d) => d.category === cat).length;
    return acc;
  }, {});

  return (
    <section id="knowledge" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 2xl:px-16">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-10 sm:mb-14"
        >
          <p className="section-tag mb-4">Knowledge Transfer</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-special text-2xl sm:text-4xl font-bold text-white">
                KT <span className="gradient-text">Centre</span>
              </h2>
              <p className="text-lightGrey text-xs sm:text-sm font-mono mt-2 max-w-lg">
                {allDocs.length} DevOps resources — interview prep, deep dives, cheat sheets. Free to view and download.
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
              <div className="text-xs font-mono text-lightGrey/50 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                {allDocs.length} PDFs · {CATEGORIES.length - 1} categories
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange/10 border border-orange/30 text-orange text-sm font-mono font-medium hover:bg-orange/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* AI Search */}
        <AISearch />

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
              onClick={() => selectCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200 ${
                active === cat
                  ? "bg-cyan/15 border-cyan/40 text-cyan"
                  : "bg-white/5 border-white/10 text-lightGrey hover:border-cyan/20 hover:text-white"
              }`}
            >
              {cat}
              <span className={`ml-1.5 text-[10px] ${active === cat ? "text-cyan/70" : "text-lightGrey/40"}`}>
                {counts[cat] ?? 0}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {visibleDocs.map((doc, i) => (
              <DocCard key={`${doc.source}-${doc.file}`} doc={doc} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length > COLLAPSED_DOC_COUNT && (
          <ExpandDivider
            expanded={showAllDocs}
            onToggle={() => setShowAllDocs((v) => !v)}
            caption={showAllDocs ? `Showing all ${filtered.length} documents` : `${COLLAPSED_DOC_COUNT} of ${filtered.length} documents`}
          />
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 glass rounded-2xl p-6 border border-cyan/10 text-center"
        >
          <p className="text-xs font-mono text-lightGrey/50 mb-1">
            All resources are freely available. Click <span className="text-cyan">View</span> to open in a popup, or <span className="text-green">Save</span> to download.
          </p>
          <p className="text-xs font-mono text-lightGrey/30">
            Have a resource to add?{" "}
            <button onClick={() => setShowUpload(true)} className="text-orange hover:text-orange/80 transition-colors underline underline-offset-2">
              Upload it →
            </button>
          </p>
        </motion.div>
      </div>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onUploaded={fetchUploaded}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
