"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { formatTimestamp } from "@/lib/formatDate";

type Comment = { id: number; author: string; post_slug: string; body: string; approved: number | boolean; created_at: string };

export function CommentsTab() {
  const [data, setData] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin?tab=comments");
    const j = await r.json();
    setData(j.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: number, approved: boolean) => {
    await fetch(`/api/comments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ approved }) });
    load();
  };

  const remove = async (id: number) => {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-3">
      {data.length === 0 && <p className="text-lightGrey text-sm">No comments yet.</p>}
      {data.map((c) => (
        <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`bg-black/30 border rounded-xl p-5 ${c.approved ? "border-lightBrown" : "border-orange/40"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <p className="font-semibold text-white text-sm">{c.author}</p>
                <span className="text-grey text-xs">on /{c.post_slug}</span>
                {!c.approved && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange/20 text-orange border border-orange/30">Pending</span>}
                {c.approved ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan/10 text-cyan border border-cyan/20">Approved</span> : null}
              </div>
              <p className="text-lightGrey text-sm leading-relaxed">{c.body}</p>
              <p className="text-grey text-xs mt-2">{formatTimestamp(c.created_at)}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => approve(c.id, !c.approved)}
                className={`p-1.5 rounded-lg border transition-colors ${c.approved ? "border-orange/30 text-orange hover:bg-orange/10" : "border-cyan/30 text-cyan hover:bg-cyan/10"}`}
                title={c.approved ? "Unapprove" : "Approve"}>
                {c.approved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </button>
              <button onClick={() => remove(c.id)}
                className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
