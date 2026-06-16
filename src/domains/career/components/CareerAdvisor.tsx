"use client";
import { useState } from "react";
import type { CareerRoadmap } from "@/ai/schemas/careerRoadmap";

const PRIORITY_COLORS = {
  critical: "text-red-400 border-red-400/30 bg-red-400/10",
  high: "text-orange border-orange/30 bg-orange/10",
  medium: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  low: "text-lightGrey border-white/20 bg-white/5",
};

export default function CareerAdvisor() {
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRoadmap() {
    setLoading(true);
    try {
      const res = await fetch("/api/account/career");
      if (res.ok) setRoadmap(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function runAnalysis() {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/account/career/analyze", { method: "POST" });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Analysis failed.");
        return;
      }
      const { roadmap: r } = await res.json();
      setRoadmap(r);
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return <p className="text-lightGrey text-xs font-mono">Loading…</p>;
  }

  if (!roadmap) {
    return (
      <div className="text-center py-14">
        <div className="text-4xl mb-4">🗺️</div>
        <h2 className="text-white font-mono font-bold text-base mb-2">Career Roadmap</h2>
        <p className="text-lightGrey text-xs font-mono mb-6 max-w-sm mx-auto">
          AI-powered roadmap tailored to your resume, preferences, and job match history.
          Upload a resume and set preferences first.
        </p>
        {error && <p className="text-red-400 text-xs font-mono mb-4">{error}</p>}
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="bg-cyan text-black font-mono font-bold text-xs px-6 py-2.5 rounded-lg hover:bg-lightCyan transition-colors disabled:opacity-50"
        >
          {analyzing ? "Analyzing…" : "Generate Roadmap"}
        </button>
      </div>
    );
  }

  const salaryFmt = (n: number) =>
    `${roadmap.salaryRange.currency} ${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-white font-mono font-bold text-lg">{roadmap.targetRole}</h2>
          <p className="text-lightGrey text-xs font-mono mt-1">{roadmap.currentLevel}</p>
          <p className="text-cyan text-xs font-mono mt-1 italic">{roadmap.keyMessage}</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing}
          className="flex-shrink-0 text-xs font-mono border border-cyan/30 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/10 transition-colors disabled:opacity-50"
        >
          {analyzing ? "Analyzing…" : "Refresh"}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-xl border border-white/10 p-3 text-center">
          <p className="text-green font-mono font-bold text-sm">
            {salaryFmt(roadmap.salaryRange.min)}–{salaryFmt(roadmap.salaryRange.max)}
          </p>
          <p className="text-lightGrey text-[10px] font-mono mt-0.5">Salary Range</p>
        </div>
        <div className="glass rounded-xl border border-white/10 p-3 text-center">
          <p className="text-cyan font-mono font-bold text-sm">{roadmap.strengths.length}</p>
          <p className="text-lightGrey text-[10px] font-mono mt-0.5">Strengths</p>
        </div>
        <div className="glass rounded-xl border border-white/10 p-3 text-center">
          <p className="text-orange font-mono font-bold text-sm">{roadmap.skillGaps.length}</p>
          <p className="text-lightGrey text-[10px] font-mono mt-0.5">Skill Gaps</p>
        </div>
        <div className="glass rounded-xl border border-white/10 p-3 text-center">
          <p className="text-white font-mono font-bold text-sm">{roadmap.roadmap.length}</p>
          <p className="text-lightGrey text-[10px] font-mono mt-0.5">Milestones</p>
        </div>
      </div>

      {/* Strengths */}
      <div className="glass rounded-xl border border-white/10 p-4">
        <h3 className="text-xs font-mono font-bold text-lightGrey uppercase tracking-wider mb-3">Strengths</h3>
        <div className="flex flex-wrap gap-2">
          {roadmap.strengths.map((s, i) => (
            <span key={i} className="text-xs font-mono bg-green/10 border border-green/20 text-green px-2.5 py-1 rounded-full">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Skill Gaps */}
      <div className="glass rounded-xl border border-white/10 p-4">
        <h3 className="text-xs font-mono font-bold text-lightGrey uppercase tracking-wider mb-3">Skill Gaps</h3>
        <div className="space-y-2">
          {roadmap.skillGaps.map((gap, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`flex-shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded-full border mt-0.5 ${PRIORITY_COLORS[gap.priority] ?? PRIORITY_COLORS.low}`}>
                {gap.priority}
              </span>
              <div className="flex-1">
                <p className="text-white text-xs font-mono font-bold">{gap.skill}</p>
                {gap.resources.length > 0 && (
                  <p className="text-lightGrey/60 text-[10px] font-mono mt-0.5">{gap.resources.join(" · ")}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap timeline */}
      <div className="glass rounded-xl border border-white/10 p-4">
        <h3 className="text-xs font-mono font-bold text-lightGrey uppercase tracking-wider mb-4">Roadmap</h3>
        <div className="relative pl-4">
          <div className="absolute left-0 top-2 bottom-2 w-px bg-cyan/20" />
          <div className="space-y-5">
            {roadmap.roadmap.map((step, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-cyan border-2 border-darkBlue" />
                <p className="text-cyan text-[10px] font-mono mb-1">{step.timeframe}</p>
                <p className="text-white text-xs font-mono font-bold mb-1">{step.milestone}</p>
                <ul className="space-y-0.5">
                  {step.actions.map((a, j) => (
                    <li key={j} className="text-lightGrey text-[10px] font-mono flex gap-2">
                      <span className="text-cyan/40">▸</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Companies */}
      {roadmap.topCompanies.length > 0 && (
        <div className="glass rounded-xl border border-white/10 p-4">
          <h3 className="text-xs font-mono font-bold text-lightGrey uppercase tracking-wider mb-3">Target Companies</h3>
          <div className="flex flex-wrap gap-2">
            {roadmap.topCompanies.map((c, i) => (
              <span key={i} className="text-xs font-mono bg-white/5 border border-white/10 text-white px-2.5 py-1 rounded-full">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Certification Recommendations */}
      {roadmap.certificationRecommendations.length > 0 && (
        <div className="glass rounded-xl border border-white/10 p-4">
          <h3 className="text-xs font-mono font-bold text-lightGrey uppercase tracking-wider mb-3">Recommended Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {roadmap.certificationRecommendations.map((c, i) => (
              <span key={i} className="text-xs font-mono bg-cyan/10 border border-cyan/20 text-cyan px-2.5 py-1 rounded-full">{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
