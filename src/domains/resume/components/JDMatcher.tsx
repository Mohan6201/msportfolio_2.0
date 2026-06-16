"use client";
import { useState } from "react";
import type { JdMatchResult } from "@/ai/schemas/atsScore";

export default function JDMatcher({
  resumeId,
  onTailor,
}: {
  resumeId: number;
  onTailor?: (jdText: string) => void;
}) {
  const [jdText, setJdText] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<JdMatchResult | null>(null);
  const [error, setError] = useState("");

  async function runMatch() {
    if (!jdText.trim()) return;
    setRunning(true);
    setError("");
    try {
      const res = await fetch(`/api/account/resume/${resumeId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "jd_match", jdText }),
      });
      if (!res.ok) throw new Error("Match analysis failed");
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
      <h3 className="text-white font-mono font-bold mb-1">JD Match Analyzer</h3>
      <p className="text-lightGrey text-xs font-mono mb-5">
        Paste a job description to see how well your resume matches
      </p>

      <textarea
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
        rows={6}
        placeholder="Paste the full job description here…"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-cyan/50 resize-none mb-3"
      />

      <div className="flex gap-3 mb-6">
        <button
          onClick={runMatch}
          disabled={running || !jdText.trim()}
          className="bg-cyan text-black font-mono font-bold text-xs px-5 py-2 rounded-lg hover:bg-lightCyan transition-colors disabled:opacity-50"
        >
          {running ? "Analyzing…" : result ? "Re-analyze" : "Analyze Match"}
        </button>
        {result && onTailor && (
          <button
            onClick={() => onTailor(jdText)}
            className="border border-cyan/30 text-cyan font-mono text-xs px-4 py-2 rounded-lg hover:bg-cyan/10 transition-colors"
          >
            Tailor Resume →
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs font-mono mb-4">{error}</p>}

      {result && (
        <div className="space-y-4">
          {/* Score */}
          <div className="glass rounded-xl border border-white/10 p-5 flex items-center gap-5">
            <div className="text-center">
              <p className={`text-4xl font-bold font-mono ${matchColor(result.matchScore)}`}>
                {result.matchScore}
              </p>
              <p className="text-lightGrey text-[10px] font-mono">/100 match</p>
            </div>
            <div>
              <p className="text-white text-xs font-mono font-bold mb-1">Cover Letter Hook</p>
              <p className="text-lightGrey text-xs font-mono italic">"{result.coverLetterHook}"</p>
            </div>
          </div>

          {/* Skills */}
          <div className="glass rounded-xl border border-white/10 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-green text-[10px] font-mono font-bold uppercase tracking-wider mb-2">Matched Skills</p>
                <div className="flex flex-wrap gap-1">
                  {result.matchedSkills.map((s, i) => (
                    <span key={i} className="text-[10px] font-mono bg-green/10 border border-green/20 text-green px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-orange text-[10px] font-mono font-bold uppercase tracking-wider mb-2">Missing Skills</p>
                <div className="flex flex-wrap gap-1">
                  {result.missingSkills.map((s, i) => (
                    <span key={i} className="text-[10px] font-mono bg-orange/10 border border-orange/20 text-orange px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strong / Weak / Suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass rounded-xl border border-green/20 p-4">
              <p className="text-green text-[10px] font-mono font-bold uppercase tracking-wider mb-2">Strong Points</p>
              <ul className="space-y-1">
                {result.strongPoints.map((s, i) => (
                  <li key={i} className="text-xs font-mono text-lightGrey flex gap-2">
                    <span className="text-green">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-xl border border-orange/20 p-4">
              <p className="text-orange text-[10px] font-mono font-bold uppercase tracking-wider mb-2">Weak Points</p>
              <ul className="space-y-1">
                {result.weakPoints.map((s, i) => (
                  <li key={i} className="text-xs font-mono text-lightGrey flex gap-2">
                    <span className="text-orange">→</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {result.suggestions.length > 0 && (
            <div className="glass rounded-xl border border-white/10 p-4">
              <p className="text-white text-[10px] font-mono font-bold uppercase tracking-wider mb-2">Suggestions</p>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-xs font-mono text-lightGrey flex gap-2">
                    <span className="text-cyan">·</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function matchColor(score: number) {
  return score >= 75 ? "text-green" : score >= 50 ? "text-orange" : "text-red-400";
}
