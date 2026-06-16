"use client";
import type { Job, Company, JobMatch } from "@/domains/jobs/services/jobs.service";

type JobWithCompany = Job & { company: Company | null };
type MatchWithJob = JobMatch & { job: JobWithCompany };

type Props = {
  item: JobWithCompany | MatchWithJob;
  onScore?: (jobId: number) => void;
  onStatusChange?: (matchId: number, status: string) => void;
  scoring?: boolean;
};

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  suggested: { color: "#00D964", border: "1px solid rgba(0,217,100,0.3)", backgroundColor: "rgba(0,217,100,0.08)" },
  saved:      { color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)", backgroundColor: "rgba(96,165,250,0.08)" },
  applied:    { color: "#f97316", border: "1px solid rgba(249,115,22,0.3)", backgroundColor: "rgba(249,115,22,0.08)" },
  interviewing: { color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", backgroundColor: "rgba(251,191,36,0.08)" },
  offer:      { color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", backgroundColor: "rgba(34,197,94,0.08)" },
  rejected:   { color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.08)" },
};

const NEXT_STATUS: Record<string, string> = {
  suggested: "saved",
  saved: "applied",
  applied: "interviewing",
  interviewing: "offer",
};

function safeArr(v: string | null | undefined): string[] {
  try { return v ? JSON.parse(v) : []; } catch { return []; }
}

function isMatch(item: Props["item"]): item is MatchWithJob {
  return "job" in item;
}

export default function JobCard({ item, onScore, onStatusChange, scoring }: Props) {
  const job   = isMatch(item) ? item.job : item;
  const match = isMatch(item) ? item : null;

  const salary =
    job.salaryMin || job.salaryMax
      ? `$${(job.salaryMin ?? 0).toLocaleString()}${job.salaryMax ? `–$${job.salaryMax.toLocaleString()}` : "+"}`
      : null;

  return (
    <div
      className="rounded-xl p-4 transition-colors"
      style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-mono font-bold text-sm truncate">{job.title}</h3>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#6B7280" }}>
            {job.company?.name ?? "Unknown Company"}
            {job.location && <span style={{ color: "#4a4a5a" }}> · {job.location}</span>}
            {!!job.remote && <span style={{ color: "#00D964" }}> · Remote</span>}
          </p>
          {salary && <p className="text-xs font-mono mt-0.5" style={{ color: "#00D964" }}>{salary}</p>}
        </div>

        {match?.matchScore != null && (
          <div
            className="flex-shrink-0 text-center px-3 py-1.5 rounded-lg text-xs font-mono font-bold"
            style={
              match.matchScore >= 75
                ? { color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", backgroundColor: "rgba(34,197,94,0.08)" }
                : match.matchScore >= 50
                ? { color: "#f97316", border: "1px solid rgba(249,115,22,0.3)", backgroundColor: "rgba(249,115,22,0.08)" }
                : { color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.08)" }
            }
          >
            {Math.round(match.matchScore)}%
          </div>
        )}
      </div>

      {match?.verdict && (
        <p className="text-[10px] font-mono mt-2 italic" style={{ color: "#6B7280" }}>{match.verdict}</p>
      )}

      {match && (
        <div className="flex gap-2 flex-wrap mt-2">
          {safeArr(match.matchedSkills).slice(0, 4).map((s, i) => (
            <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{ color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)", backgroundColor: "rgba(34,197,94,0.06)" }}>{s}</span>
          ))}
          {safeArr(match.skillGaps).slice(0, 3).map((s, i) => (
            <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded-full" style={{ color: "#f97316", border: "1px solid rgba(249,115,22,0.2)", backgroundColor: "rgba(249,115,22,0.06)" }}>−{s}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "#333" }}>{job.source}</span>
        {job.postedAt && (
          <span className="text-[9px] font-mono" style={{ color: "#333" }}>
            {new Date(job.postedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        )}
        <div className="flex-1" />

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono rounded px-2 py-1 transition-colors"
          style={{ color: "#6B7280", border: "1px solid #26262B" }}
        >
          Apply →
        </a>

        {!match && onScore && (
          <button
            onClick={() => onScore(job.id)}
            disabled={scoring}
            className="text-[10px] font-mono rounded px-2 py-1 transition-colors disabled:opacity-50"
            style={{ color: "#00D964", border: "1px solid rgba(0,217,100,0.3)" }}
          >
            {scoring ? "Scoring…" : "Score vs. Resume"}
          </button>
        )}

        {match && (
          <div className="flex items-center gap-1">
            <span
              className="text-[9px] font-mono px-2 py-0.5 rounded-full"
              style={STATUS_STYLES[match.status] ?? {}}
            >
              {match.status}
            </span>
            {onStatusChange && NEXT_STATUS[match.status] && (
              <button
                onClick={() => onStatusChange(match.id, NEXT_STATUS[match.status])}
                className="text-[9px] font-mono rounded px-1.5 py-0.5 transition-colors"
                style={{ color: "#6B7280", border: "1px solid #26262B" }}
              >
                → {NEXT_STATUS[match.status]}
              </button>
            )}
            {onStatusChange && match.status !== "rejected" && match.status !== "offer" && (
              <button
                onClick={() => onStatusChange(match.id, "rejected")}
                className="text-[9px] font-mono px-1 transition-colors"
                style={{ color: "rgba(239,68,68,0.5)" }}
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
