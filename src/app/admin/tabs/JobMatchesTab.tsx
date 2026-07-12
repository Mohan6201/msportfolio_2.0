"use client";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Shuffle, ArrowUpDown } from "lucide-react";

type Status = "suggested" | "saved" | "applied" | "interviewing" | "rejected" | "offer";

type Match = {
  id: number;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  jobId: number;
  jobTitle: string | null;
  jobLocation: string | null;
  matchScore: number | null;
  verdict: string | null;
  status: Status;
  createdAt: string;
};

const STATUS_STYLES: Record<Status, string> = {
  suggested:    "bg-[#26262B] text-[#9CA3AF] border-[#33333A]",
  saved:        "bg-cyan/15 text-cyan border-cyan/30",
  applied:      "bg-orange/15 text-orange border-orange/30",
  interviewing: "bg-purple/15 text-purple border-purple/30",
  rejected:     "bg-red/15 text-red border-red/30",
  offer:        "bg-[#00D964]/15 text-[#00D964] border-[#00D964]/30",
};

const STATUSES: Status[] = ["suggested", "saved", "applied", "interviewing", "rejected", "offer"];

function scoreColor(score: number) {
  if (score >= 75) return "#00D964";
  if (score >= 50) return "#EAB308";
  if (score >= 25) return "#F97316";
  return "#EF4444";
}

function fmtDate(v: string) {
  const d = new Date(v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function JobMatchesTab() {
  const [data, setData]       = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus]   = useState<Status | "all">("all");
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    fetch("/api/admin/job-matches").then(r => r.json()).then(j => { setData(j.data ?? []); setLoading(false); });
  }, []);

  const rows = useMemo(() => {
    let r = status === "all" ? data : data.filter(m => m.status === status);
    r = [...r].sort((a, b) => {
      const sa = a.matchScore ?? -1, sb = b.matchScore ?? -1;
      return sortDesc ? sb - sa : sa - sb;
    });
    return r;
  }, [data, status, sortDesc]);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 text-[#00D964] animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Header + filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#16161A] border border-[#26262B] flex items-center justify-center">
            <Shuffle className="w-4 h-4 text-[#00D964]" />
          </div>
          <div>
            <h2 className="text-[#E5E7EB] font-mono text-sm font-semibold">Job Matches</h2>
            <p className="text-[#6B7280] font-mono text-[11px]">{rows.length} of {data.length} matches</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Status | "all")}
            className="bg-[#16161A] border border-[#26262B] rounded-lg px-3 py-2 text-[#E5E7EB] text-[12px] font-mono capitalize focus:outline-none focus:border-[#00D964]/40 transition-colors"
          >
            <option value="all">All statuses</option>
            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <button
            onClick={() => setSortDesc(s => !s)}
            className="flex items-center gap-1.5 bg-[#16161A] border border-[#26262B] rounded-lg px-3 py-2 text-[#9CA3AF] text-[12px] font-mono hover:text-[#E5E7EB] hover:border-[#33333A] transition-colors"
            title="Toggle score sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Score {sortDesc ? "↓" : "↑"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#16161A] border border-[#26262B] rounded-2xl overflow-hidden">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-[#26262B]">
              {["User", "Job", "Match", "Verdict", "Status", "Date"].map((h, i) => (
                <th key={i} className="text-left px-5 py-3 text-[#6B7280] text-[10px] uppercase tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-[#6B7280] text-center text-[12px]">No matches found.</td></tr>
            )}
            {rows.map(m => {
              const score = Math.max(0, Math.min(100, Math.round(m.matchScore ?? 0)));
              const hasScore = m.matchScore != null;
              return (
                <tr key={m.id} className="border-b border-[#26262B]/50 hover:bg-white/[0.015] transition-colors">
                  <td className="px-5 py-3 text-[#9CA3AF] truncate max-w-[200px]">{m.userEmail ?? m.userName ?? m.userId}</td>
                  <td className="px-5 py-3 text-[#E5E7EB] truncate max-w-[220px]">{m.jobTitle ?? `Job #${m.jobId}`}</td>
                  <td className="px-5 py-3">
                    {hasScore ? (
                      <div className="flex items-center gap-2 w-[120px]">
                        <div className="flex-1 h-1.5 rounded-full bg-[#0d0d0d] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: scoreColor(score) }} />
                        </div>
                        <span className="text-[11px] tabular-nums" style={{ color: scoreColor(score) }}>{score}</span>
                      </div>
                    ) : (
                      <span className="text-[#6B7280] text-[11px]">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-[#6B7280] text-[12px] truncate max-w-[200px]" title={m.verdict ?? ""}>{m.verdict || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] border capitalize ${STATUS_STYLES[m.status]}`}>{m.status}</span>
                  </td>
                  <td className="px-5 py-3 text-[#6B7280] text-[12px]">{fmtDate(m.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
