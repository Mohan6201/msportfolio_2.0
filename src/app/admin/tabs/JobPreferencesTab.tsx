"use client";
import { useEffect, useState } from "react";
import { Loader2, Target } from "lucide-react";

type Pref = {
  id: number;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  targetRoles: string;        // JSON string[]
  preferredLocations: string; // JSON string[]
  remotePreference: "remote" | "hybrid" | "onsite" | "any";
  employmentType: string;     // JSON string[]
  minSalary: number | null;
  keywords: string;           // JSON string[]
  updatedAt: string;
};

function parseList(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function fmtSalary(min: number | null) {
  if (min == null) return "—";
  return `$${min.toLocaleString()}+`;
}

function Chips({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <span className="text-[#6B7280] text-[11px]">{empty}</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((c, i) => (
        <span key={i} className="px-2 py-0.5 rounded-md bg-[#0d0d0d] border border-[#26262B] text-[#9CA3AF] text-[10px]">{c}</span>
      ))}
    </div>
  );
}

const REMOTE_STYLES: Record<string, string> = {
  remote: "bg-[#00D964]/15 text-[#00D964] border-[#00D964]/30",
  hybrid: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  onsite: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  any:    "bg-[#26262B] text-[#9CA3AF] border-[#33333A]",
};

export function JobPreferencesTab() {
  const [data, setData]       = useState<Pref[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/job-preferences").then(r => r.json()).then(j => { setData(j.data ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 text-[#00D964] animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#16161A] border border-[#26262B] flex items-center justify-center">
          <Target className="w-4 h-4 text-[#00D964]" />
        </div>
        <div>
          <h2 className="text-[#E5E7EB] font-mono text-sm font-semibold">Job Preferences</h2>
          <p className="text-[#6B7280] font-mono text-[11px]">{data.length} {data.length === 1 ? "profile" : "profiles"} · read-only</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#16161A] border border-[#26262B] rounded-2xl overflow-hidden">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-[#26262B]">
              {["User", "Target Roles", "Locations", "Employment", "Min Salary", "Remote"].map((h, i) => (
                <th key={i} className="text-left px-5 py-3 text-[#6B7280] text-[10px] uppercase tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-[#6B7280] text-center text-[12px]">No preferences set yet.</td></tr>
            )}
            {data.map(p => (
              <tr key={p.id} className="border-b border-[#26262B]/50 hover:bg-white/[0.015] transition-colors align-top">
                <td className="px-5 py-3 text-[#9CA3AF] truncate max-w-[200px]">{p.userEmail ?? p.userName ?? p.userId}</td>
                <td className="px-5 py-3 max-w-[220px]"><Chips items={parseList(p.targetRoles)} empty="Any role" /></td>
                <td className="px-5 py-3 max-w-[200px]"><Chips items={parseList(p.preferredLocations)} empty="Anywhere" /></td>
                <td className="px-5 py-3 max-w-[180px]"><Chips items={parseList(p.employmentType)} empty="—" /></td>
                <td className="px-5 py-3 text-[#E5E7EB] text-[12px] whitespace-nowrap">{fmtSalary(p.minSalary)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] border capitalize ${REMOTE_STYLES[p.remotePreference] ?? REMOTE_STYLES.any}`}>
                    {p.remotePreference}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
