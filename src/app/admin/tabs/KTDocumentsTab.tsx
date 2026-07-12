"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Trash2, Database, HardDrive, X, AlertTriangle,
  ExternalLink, Upload, Loader2, CheckCircle2, XCircle,
} from "lucide-react";
import { KT_CATEGORIES } from "@/domains/knowledge/lib/categories";
import { uploadKtDocument, describeUploadError } from "@/domains/knowledge/lib/uploadKtDocument";

type KTDoc = {
  id: number; title: string; filename: string; category: string;
  level: string; fileSize: number; storageUrl: string | null; uploadedAt: string;
};

type UploadItem = {
  id: string; file: File; title: string; category: string; level: string;
  status: "pending" | "uploading" | "done" | "error"; error?: string;
};

const CATEGORIES = KT_CATEGORIES;
const LEVELS     = ["Beginner","Intermediate","Advanced","Reference"];

const CATEGORY_COLOR: Record<string, string> = {
  AWS:"#f97316", Docker:"#38bdf8", Kubernetes:"#60a5fa",
  Linux:"#a3e635", Terraform:"#818cf8", DevOps:"#00D964", "CI/CD":"#34d399",
  Ansible:"#fb7185", Networking:"#fbbf24", Azure:"#38bdf8",
  Systems:"#9ca3af", Cloud:"#22d3ee", "AI/ML":"#c084fc",
};

function formatSize(bytes: number) {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function formatDate(iso: string) {
  const d = new Date(iso.includes("T") || iso.includes(" ") ? iso.replace(" ", "T") + (iso.includes("Z") ? "" : "Z") : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function guessCategory(filename: string): string {
  const f = filename.toLowerCase();
  if (f.includes("aws") || f.includes("s3") || f.includes("ec2")) return "AWS";
  if (f.includes("docker") || f.includes("container")) return "Docker";
  if (f.includes("kubernetes") || f.includes("k8s") || f.includes("helm")) return "Kubernetes";
  if (f.includes("linux") || f.includes("bash") || f.includes("shell")) return "Linux";
  if (f.includes("terraform")) return "Terraform";
  if (f.includes("ci") || f.includes("cd") || f.includes("git") || f.includes("argo")) return "CI/CD";
  if (f.includes("ansible")) return "Ansible";
  if (f.includes("network") || f.includes("nginx") || f.includes("load")) return "Networking";
  if (f.includes("azure")) return "Azure";
  if (f.includes("devops")) return "DevOps";
  if (f.includes("cloud")) return "Cloud";
  if (f.includes("ai") || f.includes("ml") || f.includes("llm") || f.includes("gpt") || f.includes("machine-learning")) return "AI/ML";
  if (f.includes("security") || f.includes("os") || f.includes("system")) return "Systems";
  return "DevOps";
}

export function KTDocumentsTab() {
  const [docs,        setDocs]        = useState<KTDoc[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [busyId,      setBusyId]      = useState<number | null>(null);
  const [confirmDoc,  setConfirmDoc]  = useState<KTDoc | null>(null);
  const [dragging,    setDragging]    = useState(false);
  const [uploads,     setUploads]     = useState<UploadItem[]>([]);
  const [showUpload,  setShowUpload]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/kt-documents");
      const j = await r.json();
      setDocs(Array.isArray(j.docs) ? j.docs : []);
    } catch { setDocs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function addFiles(files: FileList | File[]) {
    const pdfs = Array.from(files).filter(f => f.name.endsWith(".pdf"));
    if (!pdfs.length) return;
    setShowUpload(true);
    setUploads(prev => [
      ...prev,
      ...pdfs.map(f => ({
        id: `${Date.now()}-${Math.random()}`,
        file: f,
        title: f.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "),
        category: guessCategory(f.name),
        level: "Reference",
        status: "pending" as const,
      })),
    ]);
  }

  async function uploadAll() {
    const pending = uploads.filter(u => u.status === "pending");
    for (const item of pending) {
      setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: "uploading" } : u));
      try {
        await uploadKtDocument(item.file, { title: item.title, category: item.category, level: item.level });
        setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: "done" } : u));
      } catch (e) {
        setUploads(prev => prev.map(u => u.id === item.id ? { ...u, status: "error", error: describeUploadError(e) } : u));
      }
    }
    await load();
  }

  const patchDoc = async (id: number, field: "category" | "level", value: string) => {
    const prev = docs;
    setDocs(d => d.map(x => x.id === id ? { ...x, [field]: value } : x));
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/kt-documents/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!r.ok) setDocs(prev);
    } catch { setDocs(prev); }
    finally { setBusyId(null); }
  };

  const remove = async (id: number) => {
    setBusyId(id);
    try {
      await fetch(`/api/admin/kt-documents/${id}`, { method: "DELETE" });
      setDocs(d => d.filter(x => x.id !== id));
    } finally { setBusyId(null); setConfirmDoc(null); }
  };

  const totalSize = docs.reduce((s, d) => s + (d.fileSize || 0), 0);
  const doneCount = uploads.filter(u => u.status === "done").length;
  const pendingCount = uploads.filter(u => u.status === "pending").length;

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl px-5 py-4 flex items-center gap-3" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(0,217,100,0.1)" }}>
            <Database className="w-5 h-5 text-[#00D964]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono leading-none">{loading ? "—" : docs.length}</p>
            <p className="text-[#6B7280] text-xs font-mono mt-1">Documents</p>
          </div>
        </div>
        <div className="rounded-xl px-5 py-4 flex items-center gap-3" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(56,189,248,0.1)" }}>
            <HardDrive className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono leading-none">{loading ? "—" : formatSize(totalSize)}</p>
            <p className="text-[#6B7280] text-xs font-mono mt-1">Storage used</p>
          </div>
        </div>
      </div>

      {/* Bulk Upload Zone */}
      <div
        className="rounded-xl border-2 border-dashed transition-colors cursor-pointer"
        style={{ borderColor: dragging ? "#00D964" : "#26262B", backgroundColor: dragging ? "rgba(0,217,100,0.04)" : "#0A0A0B", padding: "20px" }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
            <Upload className="w-5 h-5 text-[#6B7280]" />
          </div>
          <p className="text-white text-sm font-mono font-bold">Drop PDFs here or click to browse</p>
          <p className="text-[#6B7280] text-xs font-mono">Multiple files supported · PDF only · max 50 MB each · auto-categorised by filename</p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf" multiple className="hidden"
          onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
      </div>

      {/* Upload queue */}
      <AnimatePresence>
        {showUpload && uploads.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl overflow-hidden" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#26262B" }}>
              <p className="text-white font-bold text-sm">Upload Queue ({uploads.length} files)</p>
              <div className="flex items-center gap-2">
                {pendingCount > 0 && (
                  <button onClick={uploadAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono"
                    style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}>
                    <Upload className="w-3 h-3" /> Upload All ({pendingCount})
                  </button>
                )}
                <button onClick={() => { setUploads([]); setShowUpload(false); }}
                  className="p-1.5 text-[#6B7280] hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto" style={{ borderColor: "#1e1e24" }}>
              {uploads.map(item => (
                <div key={item.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
                  <div className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}>
                    {item.status === "uploading" && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00D964]" />}
                    {item.status === "done"      && <CheckCircle2 className="w-3.5 h-3.5 text-[#00D964]" />}
                    {item.status === "error"     && <XCircle className="w-3.5 h-3.5 text-red" />}
                    {item.status === "pending"   && <FileText className="w-3.5 h-3.5 text-[#6B7280]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      className="w-full bg-transparent text-white text-xs font-mono focus:outline-none border-b border-transparent focus:border-[#00D964]"
                      value={item.title}
                      onChange={e => setUploads(prev => prev.map(u => u.id === item.id ? { ...u, title: e.target.value } : u))}
                      disabled={item.status !== "pending"}
                    />
                    {item.error && <p className="text-red text-[10px] font-mono mt-0.5">{item.error}</p>}
                  </div>
                  <select
                    value={item.category}
                    onChange={e => setUploads(prev => prev.map(u => u.id === item.id ? { ...u, category: e.target.value } : u))}
                    disabled={item.status !== "pending"}
                    className="text-[10px] font-mono rounded-full px-2 py-0.5 bg-[#0A0A0B] border border-[#26262B] text-white outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={item.level}
                    onChange={e => setUploads(prev => prev.map(u => u.id === item.id ? { ...u, level: e.target.value } : u))}
                    disabled={item.status !== "pending"}
                    className="text-[10px] font-mono rounded-full px-2 py-0.5 bg-[#0A0A0B] border border-[#26262B] text-white outline-none"
                  >
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  {item.status === "pending" && (
                    <button onClick={() => setUploads(prev => prev.filter(u => u.id !== item.id))}
                      className="text-[#6B7280] hover:text-red transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {doneCount > 0 && (
              <div className="px-5 py-2 border-t text-[11px] font-mono text-[#00D964]" style={{ borderColor: "#26262B" }}>
                {doneCount} / {uploads.length} uploaded successfully
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl p-4 animate-pulse" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#26262B]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-[#26262B]" />
                  <div className="h-2.5 w-1/4 rounded bg-[#1f1f24]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && docs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ backgroundColor: "#16161A", border: "1px dashed #26262B" }}>
          <FileText className="w-8 h-8 text-[#374151] mb-3" />
          <p className="text-white text-sm font-mono font-bold mb-1">No KT documents yet</p>
          <p className="text-[#6B7280] text-xs font-mono text-center max-w-xs">
            Drop PDFs above to upload. They'll appear here for management.
          </p>
        </div>
      )}

      {/* Document list */}
      {!loading && docs.length > 0 && (
        <div className="flex flex-col gap-3">
          {docs.map(d => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4 transition-opacity"
              style={{ backgroundColor: "#16161A", border: "1px solid #26262B", opacity: busyId === d.id ? 0.6 : 1 }}>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}>
                  <FileText className="w-4 h-4" style={{ color: CATEGORY_COLOR[d.category] ?? "#6B7280" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium font-mono truncate">{d.title}</p>
                    {d.storageUrl && (
                      <a href={d.storageUrl} target="_blank" rel="noopener noreferrer"
                        className="text-[#6B7280] hover:text-[#00D964] transition-colors flex-shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[#6B7280] text-xs font-mono truncate mt-0.5">{d.filename}</p>
                </div>
                {/* Category */}
                <div className="relative flex-shrink-0">
                  <select value={d.category} onChange={e => patchDoc(d.id, "category", e.target.value)}
                    className="appearance-none cursor-pointer text-xs font-mono rounded-full pl-3 pr-7 py-1 bg-[#0d0d0d] border outline-none"
                    style={{ color: CATEGORY_COLOR[d.category] ?? "#6B7280", borderColor: (CATEGORY_COLOR[d.category] ?? "#6B7280") + "55" }}>
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#16161A] text-white">{c}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] text-[8px]">▼</span>
                </div>
                {/* Level */}
                <div className="relative flex-shrink-0">
                  <select value={d.level} onChange={e => patchDoc(d.id, "level", e.target.value)}
                    className="appearance-none cursor-pointer text-xs font-mono rounded-full pl-3 pr-7 py-1 bg-[#0d0d0d] border border-[#26262B] text-[#6B7280] outline-none">
                    {LEVELS.map(l => <option key={l} value={l} className="bg-[#16161A] text-white">{l}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] text-[8px]">▼</span>
                </div>
                <div className="text-right flex-shrink-0 w-20">
                  <p className="text-[#e0e0e0] text-xs font-mono">{formatSize(d.fileSize)}</p>
                  <p className="text-[#6B7280] text-[10px] font-mono mt-0.5">{formatDate(d.uploadedAt)}</p>
                </div>
                <button onClick={() => setConfirmDoc(d)} disabled={busyId === d.id}
                  className="p-2 rounded-lg border border-red/30 text-red hover:bg-red/10 transition-colors flex-shrink-0 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setConfirmDoc(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="rounded-2xl p-6 w-full max-w-sm relative"
              style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setConfirmDoc(null)}
                className="absolute top-4 right-4 text-[#6B7280] hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle className="w-5 h-5 text-red" />
              </div>
              <h3 className="text-white font-semibold text-sm font-mono">Delete document?</h3>
              <p className="text-[#6B7280] text-xs font-mono mt-2 leading-relaxed">
                &ldquo;{confirmDoc.title}&rdquo; will be permanently removed.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setConfirmDoc(null)}
                  className="flex-1 py-2 rounded-lg border text-[#e0e0e0] text-xs font-mono hover:bg-[#0d0d0d] transition-colors"
                  style={{ borderColor: "#26262B" }}>
                  Cancel
                </button>
                <button onClick={() => remove(confirmDoc.id)} disabled={busyId === confirmDoc.id}
                  className="flex-1 py-2 rounded-lg text-white text-xs font-mono transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "rgba(239,68,68,0.9)" }}>
                  {busyId === confirmDoc.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
