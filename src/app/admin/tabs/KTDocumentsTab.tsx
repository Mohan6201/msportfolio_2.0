"use client";
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Trash2, Database, HardDrive, X, AlertTriangle, ExternalLink } from "lucide-react";

type KTDoc = {
  id: number;
  title: string;
  filename: string;
  category: string;
  level: string;
  fileSize: number;
  storageUrl: string | null;
  uploadedAt: string;
};

const CATEGORIES = ["DevOps", "Cloud", "Security", "Development", "Architecture", "General"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Reference"];

const CATEGORY_COLOR: Record<string, string> = {
  DevOps: "#00D964",
  Cloud: "#38bdf8",
  Security: "#f87171",
  Development: "#a78bfa",
  Architecture: "#fbbf24",
  General: "#6B7280",
};

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "#00D964",
  Intermediate: "#38bdf8",
  Advanced: "#fbbf24",
  Reference: "#6B7280",
};

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso.includes("T") || iso.includes(" ") ? iso.replace(" ", "T") + (iso.includes("Z") ? "" : "Z") : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function KTDocumentsTab() {
  const [docs, setDocs] = useState<KTDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDoc, setConfirmDoc] = useState<KTDoc | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/kt-documents");
      const j = await r.json();
      setDocs(Array.isArray(j.docs) ? j.docs : []);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const patchDoc = async (id: number, field: "category" | "level", value: string) => {
    const prev = docs;
    setDocs((d) => d.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/kt-documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!r.ok) setDocs(prev);
    } catch {
      setDocs(prev);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: number) => {
    setBusyId(id);
    try {
      await fetch(`/api/admin/kt-documents/${id}`, { method: "DELETE" });
      setDocs((d) => d.filter((x) => x.id !== id));
    } finally {
      setBusyId(null);
      setConfirmDoc(null);
    }
  };

  const totalSize = docs.reduce((s, d) => s + (d.fileSize || 0), 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Stats header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#16161A] border border-[#26262B] rounded-xl px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00D964]/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-[#00D964]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono leading-none">
              {loading ? "—" : docs.length}
            </p>
            <p className="text-[#6B7280] text-xs font-mono mt-1">Documents</p>
          </div>
        </div>
        <div className="bg-[#16161A] border border-[#26262B] rounded-xl px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#38bdf8]/10 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-[#38bdf8]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white font-mono leading-none">
              {loading ? "—" : formatSize(totalSize)}
            </p>
            <p className="text-[#6B7280] text-xs font-mono mt-1">Storage used</p>
          </div>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#16161A] border border-[#26262B] rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-[#26262B]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-[#26262B]" />
                  <div className="h-2.5 w-1/4 rounded bg-[#1f1f24]" />
                </div>
                <div className="h-6 w-20 rounded bg-[#26262B]" />
                <div className="h-6 w-20 rounded bg-[#26262B]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && docs.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-[#16161A] border border-dashed border-[#26262B] rounded-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#0d0d0d] border border-[#26262B] flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-[#6B7280]" />
          </div>
          <p className="text-[#e0e0e0] font-mono text-sm">No KT documents yet</p>
          <p className="text-[#6B7280] font-mono text-xs mt-1.5 max-w-xs">
            Upload documents from the KT Centre. They will appear here for management.
          </p>
        </div>
      )}

      {/* Document list */}
      {!loading && docs.length > 0 && (
        <div className="flex flex-col gap-3">
          {docs.map((d) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#16161A] border border-[#26262B] rounded-xl p-4 transition-opacity ${busyId === d.id ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-9 h-9 rounded-lg bg-[#0d0d0d] border border-[#26262B] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" style={{ color: CATEGORY_COLOR[d.category] ?? "#6B7280" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium font-mono truncate">{d.title}</p>
                    {d.storageUrl && (
                      <a href={d.storageUrl} target="_blank" rel="noopener noreferrer"
                        className="text-[#6B7280] hover:text-[#00D964] transition-colors flex-shrink-0" title="Open file">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-[#6B7280] text-xs font-mono truncate mt-0.5">{d.filename}</p>
                </div>

                {/* Inline category select */}
                <div className="relative flex-shrink-0">
                  <select
                    value={d.category}
                    onChange={(e) => patchDoc(d.id, "category", e.target.value)}
                    className="appearance-none cursor-pointer text-xs font-mono rounded-full pl-3 pr-7 py-1 bg-[#0d0d0d] border outline-none focus:ring-1"
                    style={{
                      color: CATEGORY_COLOR[d.category] ?? "#6B7280",
                      borderColor: (CATEGORY_COLOR[d.category] ?? "#6B7280") + "55",
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#16161A] text-white">{c}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] text-[8px]">▼</span>
                </div>

                {/* Inline level select */}
                <div className="relative flex-shrink-0">
                  <select
                    value={d.level}
                    onChange={(e) => patchDoc(d.id, "level", e.target.value)}
                    className="appearance-none cursor-pointer text-xs font-mono rounded-full pl-3 pr-7 py-1 bg-[#0d0d0d] border outline-none focus:ring-1"
                    style={{
                      color: LEVEL_COLOR[d.level] ?? "#6B7280",
                      borderColor: (LEVEL_COLOR[d.level] ?? "#6B7280") + "55",
                    }}
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l} className="bg-[#16161A] text-white">{l}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B7280] text-[8px]">▼</span>
                </div>

                <div className="text-right flex-shrink-0 w-20">
                  <p className="text-[#e0e0e0] text-xs font-mono">{formatSize(d.fileSize)}</p>
                  <p className="text-[#6B7280] text-[10px] font-mono mt-0.5">{formatDate(d.uploadedAt)}</p>
                </div>

                <button
                  onClick={() => setConfirmDoc(d)}
                  disabled={busyId === d.id}
                  className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0 disabled:opacity-50"
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDoc && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setConfirmDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#16161A] border border-[#26262B] rounded-2xl p-6 w-full max-w-sm relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setConfirmDoc(null)}
                className="absolute top-4 right-4 text-[#6B7280] hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
              <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-semibold text-sm font-mono">Delete document?</h3>
              <p className="text-[#6B7280] text-xs font-mono mt-2 leading-relaxed">
                &ldquo;{confirmDoc.title}&rdquo; will be permanently removed. This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setConfirmDoc(null)}
                  className="flex-1 py-2 rounded-lg border border-[#26262B] text-[#e0e0e0] text-xs font-mono hover:bg-[#0d0d0d] transition-colors">
                  Cancel
                </button>
                <button onClick={() => remove(confirmDoc.id)} disabled={busyId === confirmDoc.id}
                  className="flex-1 py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white text-xs font-mono transition-colors disabled:opacity-50">
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
