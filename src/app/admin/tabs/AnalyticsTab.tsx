"use client";
import { useEffect, useState } from "react";
import { BarChart2, Eye, Bot, Download, TrendingUp } from "lucide-react";

type TopPage  = { path: string; views: number };
type AiRow    = { feature: string; calls: number; tokens: number };
type Data     = { pageViews: { total: number; today: number }; topPages: TopPage[]; aiUsage: AiRow[]; resumeDownloads: number };

const sty = { backgroundColor: "#16161A", border: "1px solid #26262B" };

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl p-5 flex items-center gap-4" style={sty}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "18" }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-white text-2xl font-bold font-mono leading-none">{value.toLocaleString()}</p>
        <p className="text-[#6B7280] text-[11px] font-mono mt-1">{label}</p>
      </div>
    </div>
  );
}

export function AnalyticsTab() {
  const [data,    setData]    = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl p-5 animate-pulse" style={sty}>
              <div className="w-10 h-10 rounded-lg bg-[#26262B] mb-3" />
              <div className="h-6 w-16 rounded bg-[#26262B] mb-2" />
              <div className="h-2.5 w-24 rounded bg-[#1f1f24]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-red-400 font-mono text-sm py-8 text-center">Failed to load analytics.</p>;

  const totalAiCalls = data.aiUsage.reduce((s, r) => s + r.calls, 0);
  const maxViews = data.topPages[0]?.views || 1;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(251,191,36,0.1)" }}>
          <BarChart2 className="w-4 h-4 text-[#fbbf24]" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Analytics</p>
          <p className="text-[#6B7280] text-[11px] font-mono">Live data from production</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Eye}       label="Total Page Views"  value={data.pageViews.total}   color="#38bdf8" />
        <StatCard icon={TrendingUp} label="Views Today"      value={data.pageViews.today}   color="#00D964" />
        <StatCard icon={Bot}       label="AI Feature Calls"  value={totalAiCalls}           color="#a78bfa" />
        <StatCard icon={Download}  label="Resume Downloads"  value={data.resumeDownloads}   color="#fbbf24" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Top pages */}
        <div className="rounded-xl overflow-hidden" style={sty}>
          <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "#26262B" }}>
            <Eye className="w-3.5 h-3.5 text-[#38bdf8]" />
            <p className="text-white font-bold text-sm">Top Pages</p>
          </div>
          <div className="px-5 py-4">
            {data.topPages.length === 0 ? (
              <p className="text-[#374151] text-xs font-mono py-4 text-center">No page views recorded yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {data.topPages.map(p => (
                  <div key={p.path} className="flex items-center gap-3">
                    <p className="text-white text-xs font-mono w-32 truncate flex-shrink-0">{p.path || "/"}</p>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#26262B" }}>
                      <div className="h-full rounded-full bg-[#38bdf8] transition-all"
                        style={{ width: `${(p.views / maxViews) * 100}%` }} />
                    </div>
                    <span className="text-[#38bdf8] text-xs font-mono flex-shrink-0 w-8 text-right">{p.views}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI usage */}
        <div className="rounded-xl overflow-hidden" style={sty}>
          <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "#26262B" }}>
            <Bot className="w-3.5 h-3.5 text-[#a78bfa]" />
            <p className="text-white font-bold text-sm">AI Usage by Feature</p>
          </div>
          <div className="px-5 py-4">
            {data.aiUsage.length === 0 ? (
              <p className="text-[#374151] text-xs font-mono py-4 text-center">No AI usage logged yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {data.aiUsage.map(r => {
                  const maxCalls = data.aiUsage[0]?.calls || 1;
                  return (
                    <div key={r.feature} className="flex items-center gap-3">
                      <p className="text-white text-xs font-mono w-28 truncate flex-shrink-0">{r.feature}</p>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#26262B" }}>
                        <div className="h-full rounded-full bg-[#a78bfa] transition-all"
                          style={{ width: `${(r.calls / maxCalls) * 100}%` }} />
                      </div>
                      <span className="text-[#a78bfa] text-xs font-mono flex-shrink-0 w-16 text-right">
                        {r.calls} calls
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
