"use client";
import { useCallback, useEffect, useState } from "react";
import type { Job, Company, JobMatch } from "@/domains/jobs/services/jobs.service";
import JobCard from "./JobCard";

type JobWithCompany = Job & { company: Company | null };
type MatchWithJob = JobMatch & { job: JobWithCompany };
type Tab = "suggested" | "search" | "tracker";

const TRACKER_COLS: { status: string; label: string }[] = [
  { status: "saved",        label: "Saved" },
  { status: "applied",      label: "Applied" },
  { status: "interviewing", label: "Interviewing" },
  { status: "offer",        label: "Offer" },
  { status: "rejected",     label: "Rejected" },
];

export default function JobSearch() {
  const [tab, setTab]                   = useState<Tab>("suggested");
  const [matches, setMatches]           = useState<MatchWithJob[]>([]);
  const [searchResults, setSearchResults] = useState<JobWithCompany[]>([]);
  const [searchQuery, setSearchQuery]   = useState("");
  const [jobTotal, setJobTotal]         = useState(0);
  const [ingesting, setIngesting]       = useState(false);
  const [ingestResult, setIngestResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const [scoringId, setScoringId]       = useState<number | null>(null);
  const [loading, setLoading]           = useState(false);

  const loadSuggested = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/account/jobs?view=suggested");
      setMatches(await res.json());
    } finally { setLoading(false); }
  }, []);

  const loadCatalog = useCallback(async () => {
    const res = await fetch("/api/account/jobs?view=catalog");
    const data = await res.json();
    setJobTotal(data.total ?? 0);
  }, []);

  useEffect(() => { loadSuggested(); loadCatalog(); }, [loadSuggested, loadCatalog]);

  async function ingest() {
    setIngesting(true); setIngestResult(null);
    try {
      const res = await fetch("/api/account/jobs/ingest", { method: "POST" });
      const data = await res.json();
      setIngestResult(data);
      await loadCatalog();
      await loadSuggested();
    } finally { setIngesting(false); }
  }

  async function search() {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/account/jobs?view=search&q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(await res.json());
    } finally { setLoading(false); }
  }

  async function scoreJob(jobId: number) {
    setScoringId(jobId);
    try {
      const res = await fetch(`/api/account/jobs/${jobId}/score`, { method: "POST" });
      if (res.ok) { await loadSuggested(); setTab("suggested"); }
    } finally { setScoringId(null); }
  }

  async function updateStatus(matchId: number, status: string) {
    await fetch(`/api/account/job-matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadSuggested();
  }

  const suggestedMatches = matches.filter((m) => m.status === "suggested" || m.status === "saved");

  const TAB_LABELS: Record<Tab, string> = {
    suggested: `Suggested (${suggestedMatches.length})`,
    search:    "Search",
    tracker:   "Tracker",
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-7">
        <nav className="flex items-center gap-1.5 text-[11px] font-mono mb-3" style={{ color: "#6B7280" }}>
          <span>Career Centre</span>
          <span className="opacity-40">/</span>
          <span className="text-white">Jobs</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-white text-2xl sm:text-[28px] font-bold mb-1">Job Search</h1>
            <p className="text-sm font-mono" style={{ color: "#6B7280" }}>
              {jobTotal > 0 ? `${jobTotal} jobs in catalog` : "Suggested matches · Search · Application tracker"}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {ingestResult && (
              <span className="text-xs font-mono" style={{ color: "#00D964" }}>
                +{ingestResult.inserted} new, {ingestResult.skipped} skipped
              </span>
            )}
            <button
              onClick={ingest}
              disabled={ingesting}
              className="text-xs font-mono rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
              style={{ color: "#00D964", border: "1px solid rgba(0,217,100,0.3)" }}
            >
              {ingesting ? "Fetching…" : "Fetch New Jobs"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto" style={{ borderBottom: "1px solid #26262B" }}>
        {(["suggested", "search", "tracker"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 text-xs font-mono rounded-t-lg transition-colors border-b-2 whitespace-nowrap flex-shrink-0"
            style={
              tab === t
                ? { color: "#00D964", borderColor: "#00D964" }
                : { color: "#6B7280", borderColor: "transparent" }
            }
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Suggested */}
      {tab === "suggested" && (
        <div>
          {loading && <p className="text-xs font-mono" style={{ color: "#6B7280" }}>Loading…</p>}
          {!loading && suggestedMatches.length === 0 && (
            <div className="text-center py-12">
              <p className="font-mono text-sm mb-3" style={{ color: "#6B7280" }}>No suggested jobs yet.</p>
              <p className="text-xs font-mono mb-4" style={{ color: "#444" }}>
                Set your job preferences, then click &ldquo;Fetch New Jobs&rdquo; to pull live listings.
              </p>
              <button
                onClick={ingest}
                disabled={ingesting}
                className="font-mono font-bold text-xs px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#00D964", color: "#0a0a0b" }}
              >
                {ingesting ? "Fetching…" : "Fetch Jobs Now"}
              </button>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {suggestedMatches.map((m) => (
              <JobCard key={m.id} item={m} onStatusChange={updateStatus} />
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      {tab === "search" && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Search jobs by title…"
              className="flex-1 min-w-0 rounded-lg px-3 py-2 text-white text-base sm:text-xs font-mono placeholder-[#333] focus:outline-none focus:ring-2 focus:ring-cyan/60"
              style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}
            />
            <button
              onClick={search}
              disabled={loading || !searchQuery.trim()}
              className="font-mono font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#00D964", color: "#0a0a0b" }}
            >
              Search
            </button>
          </div>
          {loading && <p className="text-xs font-mono" style={{ color: "#6B7280" }}>Searching…</p>}
          <div className="flex flex-col gap-3">
            {searchResults.map((j) => (
              <JobCard key={j.id} item={j} onScore={scoreJob} scoring={scoringId === j.id} />
            ))}
          </div>
        </div>
      )}

      {/* Tracker */}
      {tab === "tracker" && (
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-[700px]">
            {TRACKER_COLS.map((col) => {
              const colMatches = matches.filter((m) => m.status === col.status);
              return (
                <div key={col.status} className="flex-1 min-w-[160px]">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: "#6B7280" }}>{col.label}</h3>
                    <span
                      className="text-[10px] font-mono rounded-full px-1.5 py-0.5"
                      style={{ color: "#444", backgroundColor: "#16161A", border: "1px solid #26262B" }}
                    >
                      {colMatches.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {colMatches.map((m) => (
                      <JobCard key={m.id} item={m} onStatusChange={updateStatus} />
                    ))}
                    {colMatches.length === 0 && (
                      <div className="rounded-lg p-3 text-center" style={{ border: "1px dashed #26262B" }}>
                        <p className="text-[10px] font-mono" style={{ color: "#333" }}>empty</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
