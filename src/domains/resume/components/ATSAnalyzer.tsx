"use client";
import { useState } from "react";
import type { AtsScore } from "@/ai/schemas/atsScore";

export default function ATSAnalyzer({ resumeId }: { resumeId: number }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<AtsScore | null>(null);
  const [error, setError] = useState("");

  async function runAnalysis() {
    setRunning(true);
    setError("");
    try {
      const res = await fetch(`/api/account/resume/${resumeId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ats" }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const { result } = await res.json();
      setResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-mono font-bold">ATS Compatibility Score</h3>
          <p className="text-lightGrey text-xs font-mono mt-1">
            Analyzes your resume against common ATS parsing rules
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={running}
          className="bg-cyan text-black font-mono font-bold text-xs px-4 py-2 rounded-lg hover:bg-lightCyan transition-colors disabled:opacity-50"
        >
          {running ? "Analyzing…" : result ? "Re-analyze" : "Run ATS Scan"}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs font-mono mb-4">{error}</p>}

      {result && (
        <div className="space-y-5">
          {/* Overall score */}
          <div className="glass rounded-xl border border-white/10 p-5">
            <div className="flex items-center gap-4">
              <ScoreRing score={result.overallScore} size="lg" />
              <div>
                <p className="text-white font-mono font-bold text-lg">{result.overallScore}/100</p>
                <p className="text-lightGrey text-xs font-mono">Overall ATS Score</p>
              </div>
            </div>
          </div>

          {/* Section scores */}
          <div className="glass rounded-xl border border-white/10 p-5">
            <h4 className="text-white font-mono font-bold text-xs mb-4 uppercase tracking-wider">Section Breakdown</h4>
            <div className="space-y-3">
              {Object.entries(result.sections).map(([key, section]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lightGrey text-xs font-mono capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className={`text-xs font-mono font-bold ${scoreColor(section.score)}`}>
                      {section.score}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${scoreBarColor(section.score)}`}
                      style={{ width: `${section.score}%` }}
                    />
                  </div>
                  {section.issues.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {section.issues.map((issue, i) => (
                        <li key={i} className="text-[10px] font-mono text-orange flex gap-1.5">
                          <span>⚠</span>{issue}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass rounded-xl border border-green/20 p-4">
              <h4 className="text-green font-mono font-bold text-xs mb-3 uppercase tracking-wider">Strengths</h4>
              <ul className="space-y-1.5">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-xs font-mono text-lightGrey flex gap-2">
                    <span className="text-green">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-xl border border-orange/20 p-4">
              <h4 className="text-orange font-mono font-bold text-xs mb-3 uppercase tracking-wider">To Improve</h4>
              <ul className="space-y-1.5">
                {result.improvements.map((s, i) => (
                  <li key={i} className="text-xs font-mono text-lightGrey flex gap-2">
                    <span className="text-orange">→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Keywords */}
          <div className="glass rounded-xl border border-white/10 p-4">
            <h4 className="text-white font-mono font-bold text-xs mb-3 uppercase tracking-wider">Keywords</h4>
            <div className="mb-3">
              <p className="text-xs font-mono text-green mb-2">Found</p>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.found.map((k, i) => (
                  <span key={i} className="text-[10px] font-mono bg-green/10 border border-green/20 text-green px-2 py-0.5 rounded-full">
                    {k}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-mono text-orange mb-2">Missing</p>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.missing.map((k, i) => (
                  <span key={i} className="text-[10px] font-mono bg-orange/10 border border-orange/20 text-orange px-2 py-0.5 rounded-full">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score, size = "md" }: { score: number; size?: "md" | "lg" }) {
  const dim = size === "lg" ? 64 : 48;
  const r = size === "lg" ? 28 : 20;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * r;
  const progress = ((100 - score) / 100) * circumference;

  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90">
      <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
      <circle
        cx={dim / 2} cy={dim / 2} r={r} fill="none"
        stroke={score >= 80 ? "#3fb950" : score >= 60 ? "#e6a817" : "#f85149"}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={progress}
        strokeLinecap="round"
      />
    </svg>
  );
}

function scoreColor(s: number) {
  return s >= 80 ? "text-green" : s >= 60 ? "text-orange" : "text-red-400";
}
function scoreBarColor(s: number) {
  return s >= 80 ? "bg-green" : s >= 60 ? "bg-orange" : "bg-red-500";
}
