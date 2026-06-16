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

const STATUS_COLORS: Record<string, string> = {
  suggested: "text-cyan border-cyan/30 bg-cyan/10",
  saved: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  applied: "text-orange border-orange/30 bg-orange/10",
  interviewing: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  offer: "text-green border-green/30 bg-green/10",
  rejected: "text-red-400 border-red-400/30 bg-red-400/10",
};

const NEXT_STATUS: Record<string, string> = {
  suggested: "saved",
  saved: "applied",
  applied: "interviewing",
  interviewing: "offer",
};

function isMatch(item: Props["item"]): item is MatchWithJob {
  return "job" in item;
}

export default function JobCard({ item, onScore, onStatusChange, scoring }: Props) {
  const job = isMatch(item) ? item.job : item;
  const match = isMatch(item) ? item : null;

  const salary =
    job.salaryMin || job.salaryMax
      ? `$${(job.salaryMin ?? 0).toLocaleString()}${job.salaryMax ? `–$${job.salaryMax.toLocaleString()}` : "+"}`
      : null;

  return (
    <div className="glass rounded-xl border border-white/10 p-4 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-mono font-bold text-sm truncate">{job.title}</h3>
          <p className="text-lightGrey text-xs font-mono mt-0.5">
            {job.company?.name ?? "Unknown Company"}
            {job.location && <span className="text-lightGrey/50"> · {job.location}</span>}
            {!!job.remote && <span className="text-green ml-1">· Remote</span>}
          </p>
          {salary && <p className="text-cyan text-xs font-mono mt-0.5">{salary}</p>}
        </div>

        {/* Match score badge */}
        {match?.matchScore != null && (
          <div className={`flex-shrink-0 text-center px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
            match.matchScore >= 75 ? "bg-green/10 border-green/30 text-green"
              : match.matchScore >= 50 ? "bg-orange/10 border-orange/30 text-orange"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            {Math.round(match.matchScore)}%
          </div>
        )}
      </div>

      {/* Verdict */}
      {match?.verdict && (
        <p className="text-lightGrey/70 text-[10px] font-mono mt-2 italic">{match.verdict}</p>
      )}

      {/* Matched / Gap skills */}
      {match && (
        <div className="flex gap-2 flex-wrap mt-2">
          {(JSON.parse(match.matchedSkills) as string[]).slice(0, 4).map((s, i) => (
            <span key={i} className="text-[9px] font-mono bg-green/10 border border-green/20 text-green px-1.5 py-0.5 rounded-full">{s}</span>
          ))}
          {(JSON.parse(match.skillGaps) as string[]).slice(0, 3).map((s, i) => (
            <span key={i} className="text-[9px] font-mono bg-orange/10 border border-orange/20 text-orange px-1.5 py-0.5 rounded-full">−{s}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {/* Source + date */}
        <span className="text-[9px] font-mono text-lightGrey/40 uppercase tracking-widest">{job.source}</span>
        {job.postedAt && (
          <span className="text-[9px] font-mono text-lightGrey/40">
            {new Date(job.postedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        )}
        <div className="flex-1" />

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-lightGrey hover:text-white border border-white/10 rounded px-2 py-1 hover:border-white/30 transition-colors"
        >
          Apply →
        </a>

        {/* Score button (for unmatched jobs) */}
        {!match && onScore && (
          <button
            onClick={() => onScore(job.id)}
            disabled={scoring}
            className="text-[10px] font-mono text-cyan border border-cyan/30 rounded px-2 py-1 hover:bg-cyan/10 transition-colors disabled:opacity-50"
          >
            {scoring ? "Scoring…" : "Score vs. Resume"}
          </button>
        )}

        {/* Status badge + advance */}
        {match && (
          <div className="flex items-center gap-1">
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${STATUS_COLORS[match.status] ?? ""}`}>
              {match.status}
            </span>
            {onStatusChange && NEXT_STATUS[match.status] && (
              <button
                onClick={() => onStatusChange(match.id, NEXT_STATUS[match.status])}
                className="text-[9px] font-mono text-lightGrey hover:text-white border border-white/10 rounded px-1.5 py-0.5 hover:border-white/30 transition-colors"
              >
                → {NEXT_STATUS[match.status]}
              </button>
            )}
            {onStatusChange && match.status !== "rejected" && match.status !== "offer" && (
              <button
                onClick={() => onStatusChange(match.id, "rejected")}
                className="text-[9px] font-mono text-red-400/50 hover:text-red-400 transition-colors px-1"
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
