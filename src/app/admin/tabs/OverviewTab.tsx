"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Users, Loader2 } from "lucide-react";

interface Stats {
  contacts: { total: number | bigint; unread: number | bigint };
  comments: { total: number | bigint; pending: number | bigint };
  subscribers: { total: number | bigint };
}

export function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin").then(r => r.json()).then(j => { setStats(j.stats); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan animate-spin" /></div>;
  if (!stats) return null;

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {[
        { label: "Messages",    value: stats.contacts.total,    sub: `${stats.contacts.unread} unread`,   icon: <Mail className="w-6 h-6" /> },
        { label: "Comments",    value: stats.comments.total,    sub: `${stats.comments.pending} pending`, icon: <MessageSquare className="w-6 h-6" /> },
        { label: "Subscribers", value: stats.subscribers.total, sub: "newsletter",                        icon: <Users className="w-6 h-6" /> },
      ].map((s) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-black/30 border border-lightBrown rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3 text-cyan">{s.icon}</div>
          <p className="text-4xl font-bold text-white">{String(s.value)}</p>
          <p className="text-lightGrey text-sm mt-1">{s.label}</p>
          <p className="text-grey text-xs mt-0.5">{s.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
