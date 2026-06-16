"use client";
import { useCallback, useEffect, useState } from "react";
import type { Job, Company, JobMatch } from "@/domains/jobs/services/jobs.service";
import JobCard from "./JobCard";

type JobWithCompany = Job & { company: Company | null };
type MatchWithJob = JobMatch & { job: JobWithCompany };

type Tab = "suggested" | "search" | "tracker";

const TRACKER_COLS: { status: string; label: string }[] = [
  { status: "saved", label: "Saved" },
  { status: "applied", label: "Applied" },
  { status: "interviewing", label: "Interviewing" },
  { status: "offer", label: "Offer" },
  { status: "rejected", label: "Rejected" },
];

export default function JobSearch() {
  const [tab, setTab] = useState<Tab>("suggested");
  const [matches, setMatches] = useState<MatchWithJob[]>([]);
  const [searchResults, setSearchResults] = useState<JobWithCompany[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTotal, setJobTotal] = useState(0);
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<{ inserted: number; skipped: number } | null>(null);
  const [scoringId, setScoringId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSuggested = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/account/jobs?view=suggested");
      setMatches(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    const res = await fetch("/api/account/jobs");
    const { total } = await res.json();
    setJobTotal(total);
  }, []);

  useEffect(() => {
    loadSuggested();
    loadCatalog();
  }, [loadSuggested, loadCatalog]);

  async function ingest() {
    setIngesting(true);
    setIngestResult(null);
    try {
      const res = await fetch("/api/account/jobs/ingest", { method: "POST" });
      const data = await res.json();
      setIngestResult(data);
      await loadCatalog();
      await loadSuggested();
    } finally {
      setIngesting(false);
    }
  }

  async function search() {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/account/jobs?view=search&q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function scoreJob(jobId: number) {
    setScoringId(jobId);
    try {
      const res = await fetch(`/api/account/jobs/${jobId}/score`, { method: "POST" });
      if (res.ok) {
        await loadSuggested();
        setTab("suggested");
      }
    } finally {
      setScoringId(null);
    }
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-lightGrey text-xs font-mono">
            {jobTotal > 0 ? `${jobTotal} jobs in catalog` : "No jobs ingested yet"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {ingestResult && (
            <span className="text-xs font-mono text-green">
              +{ingestResult.inserted} new, {ingestResult.skipped} skipped
            </span>
          )}
          <button
            onClick={ingest}
            disabled={ingesting}
            className="text-xs font-mono border border-cyan/30 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/10 transition-colors disabled:opacity-50"
          >
            {ingesting ? "Fetching…" : "Fetch New Jobs"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-white/10">
        {(["suggested", "search", "tracker"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-mono rounded-t-lg transition-colors border-b-2 capitalize ${
              tab === t ? "text-cyan border-cyan" : "text-lightGrey border-transparent hover:text-white"
            }`}
          >
            {t === "suggested" ? `Suggested (${suggestedMatches.length})` : t === "tracker" ? "Tracker" : "Search"}
          </button>
        ))}
      </div>

      {/* Suggested */}
      {tab === "suggested" && (
        <div>
          {loading && <p className="text-lightGrey text-xs font-mono">Loading…</p>}
          {!loading && suggestedMatches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lightGrey font-mono text-sm mb-3">No suggested jobs yet.</p>
              <p className="text-lightGrey/50 text-xs font-mono mb-4">
                Set your job preferences, then click "Fetch New Jobs" to pull live listings.
              </p>
              <button
                onClick={ingest}
                disabled={ingesting}
                className="bg-cyan text-black font-mono font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-lightCyan transition-colors disabled:opacity-50"
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
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-cyan/50"
            />
            <button
              onClick={search}
              disabled={loading || !searchQuery.trim()}
              className="bg-cyan text-black font-mono font-bold text-xs px-4 py-2 rounded-lg hover:bg-lightCyan transition-colors disabled:opacity-50"
            >
              Search
            </button>
          </div>
          {loading && <p className="text-lightGrey text-xs font-mono">Searching…</p>}
          <div className="flex flex-col gap-3">
            {searchResults.map((j) => (
              <JobCard
                key={j.id}
                item={j}
                onScore={scoreJob}
                scoring={scoringId === j.id}
              />
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
                    <h3 className="text-xs font-mono font-bold text-lightGrey uppercase tracking-wider">{col.label}</h3>
                    <span className="text-[10px] font-mono text-lightGrey/40 bg-white/5 rounded-full px-1.5 py-0.5">{colMatches.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {colMatches.map((m) => (
                      <JobCard key={m.id} item={m} onStatusChange={updateStatus} />
                    ))}
                    {colMatches.length === 0 && (
                      <div className="border border-dashed border-white/10 rounded-lg p-3 text-center">
                        <p className="text-lightGrey/30 text-[10px] font-mono">empty</p>
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
