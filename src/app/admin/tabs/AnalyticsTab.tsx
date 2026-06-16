"use client";
import { useEffect, useState } from "react";

type TopPage = { path: string; views: number };
type AiRow = { feature: string; calls: number; tokens: number };

type AnalyticsData = {
  pageViews: { total: number; today: number };
  topPages: TopPage[];
  aiUsage: AiRow[];
  resumeDownloads: number;
};

export function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-lightGrey font-mono text-sm">Loading analytics…</p>;
  if (!data) return <p className="text-red-400 font-mono text-sm">Failed to load analytics.</p>;

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Page Views", value: data.pageViews.total, color: "text-cyan" },
          { label: "Views Today", value: data.pageViews.today, color: "text-green" },
          { label: "AI Feature Calls", value: data.aiUsage.reduce((s, r) => s + r.calls, 0), color: "text-orange" },
          { label: "Resume Downloads", value: data.resumeDownloads, color: "text-white" },
        ].map((c) => (
          <div key={c.label} className="glass rounded-xl border border-white/10 p-4">
            <p className={`font-mono font-bold text-2xl ${c.color}`}>{c.value.toLocaleString()}</p>
            <p className="text-lightGrey text-xs font-mono mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="glass rounded-xl border border-white/10 p-5">
          <h3 className="text-white font-mono font-bold text-sm mb-4">Top Pages</h3>
          {data.topPages.length === 0 ? (
            <p className="text-lightGrey/50 text-xs font-mono">No page views recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {data.topPages.map((p) => (
                <div key={p.path} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-mono truncate">{p.path || "/"}</p>
                    <div className="mt-1 h-1 rounded-full bg-white/10">
                      <div
                        className="h-1 rounded-full bg-cyan transition-all"
                        style={{ width: `${Math.min((p.views / (data.topPages[0]?.views || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-cyan text-xs font-mono flex-shrink-0">{p.views}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI usage breakdown */}
        <div className="glass rounded-xl border border-white/10 p-5">
          <h3 className="text-white font-mono font-bold text-sm mb-4">AI Usage by Feature</h3>
          {data.aiUsage.length === 0 ? (
            <p className="text-lightGrey/50 text-xs font-mono">No AI usage logged yet.</p>
          ) : (
            <div className="space-y-3">
              {data.aiUsage.map((r) => (
                <div key={r.feature} className="flex items-center justify-between">
                  <p className="text-white text-xs font-mono">{r.feature}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-orange text-xs font-mono">{r.calls} calls</span>
                    {r.tokens > 0 && (
                      <span className="text-lightGrey/50 text-[10px] font-mono">{r.tokens.toLocaleString()} tokens</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
