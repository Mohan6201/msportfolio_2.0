"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import { formatTimestamp } from "@/lib/formatDate";

type Contact = { id: number; name: string; email: string; message: string; read: number | boolean; created_at: string };

export function MessagesTab() {
  const [data, setData] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin?tab=contacts");
    const j = await r.json();
    setData(j.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: number) => {
    await fetch("/api/admin", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-3">
      {data.length === 0 && <p className="text-lightGrey text-sm">No messages yet.</p>}
      {data.map((c) => (
        <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`bg-black/30 border rounded-xl p-5 ${c.read ? "border-lightBrown" : "border-cyan/40"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-semibold text-white text-sm">{c.name}</p>
                {!c.read && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan/20 text-cyan border border-cyan/30">New</span>}
              </div>
              <p className="text-cyan text-xs mb-3">{c.email}</p>
              <p className="text-lightGrey text-sm leading-relaxed">{c.message}</p>
              <p className="text-grey text-xs mt-3">{formatTimestamp(c.created_at)}</p>
            </div>
            {!c.read && (
              <button onClick={() => markRead(c.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cyan/30 text-cyan text-xs hover:bg-cyan/10 transition-colors flex-shrink-0">
                <CheckCircle className="w-3.5 h-3.5" /> Mark read
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
