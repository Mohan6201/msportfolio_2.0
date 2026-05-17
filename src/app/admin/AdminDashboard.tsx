"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Mail, MessageSquare, Users, CheckCircle, XCircle,
  Trash2, Eye, Loader2, RefreshCw,
} from "lucide-react";

type Tab = "stats" | "contacts" | "comments" | "subscribers";

interface Stats {
  contacts: { total: number | bigint; unread: number | bigint };
  comments: { total: number | bigint; pending: number | bigint };
  subscribers: { total: number | bigint };
}

export default function AdminDashboard({ secret }: { secret: string }) {
  const [tab, setTab] = useState<Tab>("stats");
  const [data, setData] = useState<unknown[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const headers = { "x-admin-secret": secret };

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    const url = t === "stats"
      ? "/api/admin"
      : `/api/admin?tab=${t}`;
    const r = await fetch(url, { headers });
    const json = await r.json();
    if (t === "stats") setStats(json.stats);
    else setData(json.data ?? []);
    setLoading(false);
  }, [secret]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(tab); }, [tab, load]);

  const approveComment = async (id: number | bigint, approved: boolean) => {
    await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    load(tab);
  };

  const deleteComment = async (id: number | bigint) => {
    await fetch(`/api/comments/${id}`, { method: "DELETE", headers });
    load(tab);
  };

  const markRead = async (id: number | bigint) => {
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load(tab);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "stats", label: "Overview", icon: <Eye className="w-4 h-4" /> },
    { id: "contacts", label: "Messages", icon: <Mail className="w-4 h-4" /> },
    { id: "comments", label: "Comments", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "subscribers", label: "Subscribers", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <main className="min-h-screen bg-darkBrown px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white font-body">Admin Dashboard</h1>
            <p className="text-lightGrey text-sm mt-1">Portfolio management panel</p>
          </div>
          <button
            onClick={() => load(tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-lightBrown text-lightGrey hover:border-cyan hover:text-cyan transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.id
                  ? "bg-cyan text-black"
                  : "bg-black/30 border border-lightBrown text-lightGrey hover:border-cyan hover:text-cyan"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview stats */}
            {tab === "stats" && stats && (
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Messages", value: stats.contacts.total, sub: `${stats.contacts.unread} unread`, icon: <Mail className="w-6 h-6" />, color: "cyan" },
                  { label: "Comments", value: stats.comments.total, sub: `${stats.comments.pending} pending`, icon: <MessageSquare className="w-6 h-6" />, color: "orange" },
                  { label: "Subscribers", value: stats.subscribers.total, sub: "newsletter", icon: <Users className="w-6 h-6" />, color: "cyan" },
                ].map((s) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/30 border border-lightBrown rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-3 text-cyan">{s.icon}</div>
                    <p className="text-4xl font-bold text-white">{String(s.value)}</p>
                    <p className="text-lightGrey text-sm mt-1">{s.label}</p>
                    <p className="text-grey text-xs mt-0.5">{s.sub}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Contacts table */}
            {tab === "contacts" && (
              <div className="flex flex-col gap-3">
                {(data as Record<string, unknown>[]).length === 0 && (
                  <p className="text-lightGrey text-sm">No messages yet.</p>
                )}
                {(data as Record<string, unknown>[]).map((c) => (
                  <motion.div
                    key={String(c.id)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`bg-black/30 border rounded-xl p-5 ${c.read ? "border-lightBrown" : "border-cyan/40"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-semibold text-white text-sm">{String(c.name)}</p>
                          {!c.read && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan/20 text-cyan border border-cyan/30">New</span>}
                        </div>
                        <p className="text-cyan text-xs mb-3">{String(c.email)}</p>
                        <p className="text-lightGrey text-sm leading-relaxed">{String(c.message)}</p>
                        <p className="text-grey text-xs mt-3">{new Date(String(c.created_at)).toLocaleString()}</p>
                      </div>
                      {!c.read && (
                        <button
                          onClick={() => markRead(c.id as number)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-cyan/30 text-cyan text-xs hover:bg-cyan/10 transition-colors flex-shrink-0"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark read
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Comments table */}
            {tab === "comments" && (
              <div className="flex flex-col gap-3">
                {(data as Record<string, unknown>[]).length === 0 && (
                  <p className="text-lightGrey text-sm">No comments yet.</p>
                )}
                {(data as Record<string, unknown>[]).map((c) => (
                  <motion.div
                    key={String(c.id)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`bg-black/30 border rounded-xl p-5 ${c.approved ? "border-lightBrown" : "border-orange/40"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <p className="font-semibold text-white text-sm">{String(c.author)}</p>
                          <span className="text-grey text-xs">on /{String(c.post_slug)}</span>
                          {!c.approved && <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange/20 text-orange border border-orange/30">Pending</span>}
                          {c.approved ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan/10 text-cyan border border-cyan/20">Approved</span> : null}
                        </div>
                        <p className="text-lightGrey text-sm leading-relaxed">{String(c.body)}</p>
                        <p className="text-grey text-xs mt-2">{new Date(String(c.created_at)).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => approveComment(c.id as number, !c.approved)}
                          className={`p-1.5 rounded-lg border transition-colors ${c.approved ? "border-orange/30 text-orange hover:bg-orange/10" : "border-cyan/30 text-cyan hover:bg-cyan/10"}`}
                          title={c.approved ? "Unapprove" : "Approve"}
                        >
                          {c.approved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteComment(c.id as number)}
                          className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Subscribers */}
            {tab === "subscribers" && (
              <div className="bg-black/30 border border-lightBrown rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-lightBrown">
                      <th className="text-left px-5 py-3 text-cyan text-xs uppercase tracking-wider">#</th>
                      <th className="text-left px-5 py-3 text-cyan text-xs uppercase tracking-wider">Email</th>
                      <th className="text-left px-5 py-3 text-cyan text-xs uppercase tracking-wider">Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data as Record<string, unknown>[]).length === 0 && (
                      <tr><td colSpan={3} className="px-5 py-8 text-lightGrey text-center">No subscribers yet.</td></tr>
                    )}
                    {(data as Record<string, unknown>[]).map((s, i) => (
                      <tr key={String(s.id)} className="border-b border-lightBrown/40 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3 text-grey">{i + 1}</td>
                        <td className="px-5 py-3 text-white">{String(s.email)}</td>
                        <td className="px-5 py-3 text-grey">{new Date(String(s.created_at)).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
