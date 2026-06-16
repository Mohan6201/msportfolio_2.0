"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, FileText, ExternalLink, ChevronDown } from "lucide-react";

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

const CATEGORY_COLOR: Record<string, string> = {
  DevOps: "#00D964",
  Cloud: "#38bdf8",
  Security: "#f87171",
  Development: "#a78bfa",
  Architecture: "#fbbf24",
  General: "#6B7280",
};

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function KTCategoriesTab() {
  const [docs, setDocs] = useState<KTDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);

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

  const groups = useMemo(() => {
    const map = new Map<string, { count: number; size: number }>();
    for (const c of CATEGORIES) map.set(c, { count: 0, size: 0 });
    for (const d of docs) {
      const cat = CATEGORIES.includes(d.category) ? d.category : "General";
      const g = map.get(cat)!;
      g.count += 1;
      g.size += d.fileSize || 0;
    }
    return CATEGORIES.map((c) => ({ category: c, ...map.get(c)! }));
  }, [docs]);

  const maxCount = Math.max(1, ...groups.map((g) => g.count));
  const filtered = active ? docs.filter((d) => (CATEGORIES.includes(d.category) ? d.category : "General") === active) : [];

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#16161A] border border-[#26262B] rounded-xl p-4 animate-pulse">
            <div className="h-3 w-1/4 rounded bg-[#26262B] mb-3" />
            <div className="h-2.5 rounded bg-[#1f1f24]" style={{ width: `${80 - i * 10}%` }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <Tag className="w-4 h-4 text-[#00D964]" />
        <h2 className="text-[#e0e0e0] text-sm font-mono font-semibold">Documents by category</h2>
        <span className="text-[#6B7280] text-xs font-mono ml-auto">{docs.length} total</span>
      </div>

      {/* Bar chart */}
      <div className="bg-[#16161A] border border-[#26262B] rounded-xl p-5 flex flex-col gap-4">
        {groups.map((g) => {
          const color = CATEGORY_COLOR[g.category];
          const pct = (g.count / maxCount) * 100;
          const isActive = active === g.category;
          return (
            <button
              key={g.category}
              onClick={() => setActive(isActive ? null : g.category)}
              className="group text-left"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono flex items-center gap-2" style={{ color }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {g.category}
                </span>
                <span className="text-[#6B7280] text-[11px] font-mono">
                  {g.count} {g.count === 1 ? "doc" : "docs"} · {formatSize(g.size)}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[#0d0d0d] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${g.count === 0 ? 0 : Math.max(pct, 4)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full transition-opacity"
                  style={{ background: color, opacity: isActive ? 1 : 0.75 }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filtered document list */}
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold" style={{ color: CATEGORY_COLOR[active] }}>
                {active} documents
              </span>
              <button
                onClick={() => setActive(null)}
                className="text-[#6B7280] hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors"
              >
                Collapse <ChevronDown className="w-3 h-3 rotate-180" />
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-[#16161A] border border-dashed border-[#26262B] rounded-xl py-10 text-center">
                <p className="text-[#6B7280] text-xs font-mono">No documents in this category.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((d) => (
                  <div
                    key={d.id}
                    className="bg-[#16161A] border border-[#26262B] rounded-lg px-4 py-3 flex items-center gap-3"
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" style={{ color: CATEGORY_COLOR[active] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-mono truncate">{d.title}</p>
                      <p className="text-[#6B7280] text-[10px] font-mono truncate mt-0.5">{d.filename}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#6B7280] px-2 py-0.5 rounded-full border border-[#26262B] flex-shrink-0">
                      {d.level}
                    </span>
                    <span className="text-[#e0e0e0] text-[11px] font-mono flex-shrink-0 w-16 text-right">
                      {formatSize(d.fileSize)}
                    </span>
                    {d.storageUrl && (
                      <a
                        href={d.storageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6B7280] hover:text-[#00D964] transition-colors flex-shrink-0"
                        title="Open file"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!active && (
        <p className="text-[#6B7280] text-[11px] font-mono text-center">
          Click a category bar to view its documents.
        </p>
      )}
    </div>
  );
}
