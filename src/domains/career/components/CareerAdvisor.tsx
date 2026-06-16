"use client";
import { useState } from "react";
import type { CareerRoadmap } from "@/ai/schemas/careerRoadmap";

type Priority = "critical" | "high" | "medium" | "low";
const PRIORITY_STYLES: Record<Priority, React.CSSProperties> = {
  critical: { color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.08)" },
  high:     { color: "#f97316", border: "1px solid rgba(249,115,22,0.3)", backgroundColor: "rgba(249,115,22,0.08)" },
  medium:   { color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", backgroundColor: "rgba(251,191,36,0.08)" },
  low:      { color: "#6B7280", border: "1px solid #26262B",              backgroundColor: "#16161A" },
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl p-4 ${className}`} style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest mb-3" style={{ color: "#6B7280" }}>
      {children}
    </h3>
  );
}

export default function CareerAdvisor() {
  const [roadmap, setRoadmap]   = useState<CareerRoadmap | null>(null);
  const [loading, setLoading]   = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function runAnalysis() {
    setAnalyzing(true); setError(null);
    try {
      const res = await fetch("/api/account/career/analyze", { method: "POST" });
      if (!res.ok) { const b = await res.json(); setError(b.error ?? "Analysis failed."); return; }
      const { roadmap: r } = await res.json();
      setRoadmap(r);
    } finally { setAnalyzing(false); }
  }

  if (loading) {
    return <p className="text-xs font-mono" style={{ color: "#6B7280" }}>Loading…</p>;
  }

  if (!roadmap) {
    return (
      <>
        {/* Page header */}
        <div className="mb-7">
          <nav className="flex items-center gap-1.5 text-[11px] font-mono mb-3" style={{ color: "#6B7280" }}>
            <span>Career Centre</span>
            <span className="opacity-40">/</span>
            <span className="text-white">Career Advisor</span>
          </nav>
          <h1 className="text-white text-[28px] font-bold mb-1">Career Advisor</h1>
          <p className="text-sm font-mono" style={{ color: "#6B7280" }}>
            AI-generated roadmap based on your resume, preferences, and job matches
          </p>
        </div>
        <div className="text-center py-14">
          <div className="text-4xl mb-4">🗺️</div>
          <h2 className="text-white font-mono font-bold text-base mb-2">Career Roadmap</h2>
          <p className="text-xs font-mono mb-6 max-w-sm mx-auto" style={{ color: "#6B7280" }}>
            AI-powered roadmap tailored to your resume, preferences, and job match history.
            Upload a resume and set preferences first.
          </p>
          {error && <p className="text-xs font-mono mb-4" style={{ color: "#ef4444" }}>{error}</p>}
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="font-mono font-bold text-xs px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#00D964", color: "#0a0a0b" }}
          >
            {analyzing ? "Analyzing…" : "Generate Roadmap"}
          </button>
        </div>
      </>
    );
  }

  const salaryFmt = (n: number) => `${roadmap.salaryRange.currency} ${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <nav className="flex items-center gap-1.5 text-[11px] font-mono mb-3" style={{ color: "#6B7280" }}>
          <span>Career Centre</span>
          <span className="opacity-40">/</span>
          <span className="text-white">Career Advisor</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white text-[28px] font-bold mb-1">{roadmap.targetRole}</h1>
            <p className="text-xs font-mono mt-1" style={{ color: "#6B7280" }}>{roadmap.currentLevel}</p>
            <p className="text-xs font-mono mt-1 italic" style={{ color: "#00D964" }}>{roadmap.keyMessage}</p>
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            className="flex-shrink-0 text-xs font-mono rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            style={{ color: "#00D964", border: "1px solid rgba(0,217,100,0.3)" }}
          >
            {analyzing ? "Analyzing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="text-center">
          <p className="font-mono font-bold text-sm" style={{ color: "#00D964" }}>
            {salaryFmt(roadmap.salaryRange.min)}–{salaryFmt(roadmap.salaryRange.max)}
          </p>
          <p className="text-[10px] font-mono mt-0.5" style={{ color: "#6B7280" }}>Salary Range</p>
        </Card>
        <Card className="text-center">
          <p className="text-white font-mono font-bold text-sm">{roadmap.strengths.length}</p>
          <p className="text-[10px] font-mono mt-0.5" style={{ color: "#6B7280" }}>Strengths</p>
        </Card>
        <Card className="text-center">
          <p className="font-mono font-bold text-sm" style={{ color: "#f97316" }}>{roadmap.skillGaps.length}</p>
          <p className="text-[10px] font-mono mt-0.5" style={{ color: "#6B7280" }}>Skill Gaps</p>
        </Card>
        <Card className="text-center">
          <p className="text-white font-mono font-bold text-sm">{roadmap.roadmap.length}</p>
          <p className="text-[10px] font-mono mt-0.5" style={{ color: "#6B7280" }}>Milestones</p>
        </Card>
      </div>

      {/* Strengths */}
      <Card>
        <SectionLabel>Strengths</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {roadmap.strengths.map((s, i) => (
            <span
              key={i}
              className="text-xs font-mono px-2.5 py-1 rounded-full"
              style={{ color: "#00D964", border: "1px solid rgba(0,217,100,0.2)", backgroundColor: "rgba(0,217,100,0.06)" }}
            >
              {s}
            </span>
          ))}
        </div>
      </Card>

      {/* Skill Gaps */}
      <Card>
        <SectionLabel>Skill Gaps</SectionLabel>
        <div className="space-y-2">
          {roadmap.skillGaps.map((gap, i) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded-full mt-0.5"
                style={PRIORITY_STYLES[gap.priority as Priority] ?? PRIORITY_STYLES.low}
              >
                {gap.priority}
              </span>
              <div className="flex-1">
                <p className="text-white text-xs font-mono font-bold">{gap.skill}</p>
                {gap.resources.length > 0 && (
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: "#444" }}>{gap.resources.join(" · ")}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Roadmap timeline */}
      <Card>
        <SectionLabel>Roadmap</SectionLabel>
        <div className="relative pl-4">
          <div className="absolute left-0 top-2 bottom-2 w-px" style={{ backgroundColor: "rgba(0,217,100,0.2)" }} />
          <div className="space-y-5">
            {roadmap.roadmap.map((step, i) => (
              <div key={i} className="relative">
                <div
                  className="absolute -left-[17px] top-1 w-2 h-2 rounded-full border-2"
                  style={{ backgroundColor: "#00D964", borderColor: "#0A0A0B" }}
                />
                <p className="text-[10px] font-mono mb-1" style={{ color: "#00D964" }}>{step.timeframe}</p>
                <p className="text-white text-xs font-mono font-bold mb-1">{step.milestone}</p>
                <ul className="space-y-0.5">
                  {step.actions.map((a, j) => (
                    <li key={j} className="text-[10px] font-mono flex gap-2" style={{ color: "#6B7280" }}>
                      <span style={{ color: "rgba(0,217,100,0.4)" }}>▸</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {roadmap.topCompanies.length > 0 && (
        <Card>
          <SectionLabel>Target Companies</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {roadmap.topCompanies.map((c, i) => (
              <span key={i} className="text-xs font-mono px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}>{c}</span>
            ))}
          </div>
        </Card>
      )}

      {roadmap.certificationRecommendations.length > 0 && (
        <Card>
          <SectionLabel>Recommended Certifications</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {roadmap.certificationRecommendations.map((c, i) => (
              <span
                key={i}
                className="text-xs font-mono px-2.5 py-1 rounded-full"
                style={{ color: "#00D964", border: "1px solid rgba(0,217,100,0.2)", backgroundColor: "rgba(0,217,100,0.06)" }}
              >
                {c}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
