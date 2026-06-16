"use client";
import { useState } from "react";
import type { CoverLetter } from "@/domains/resume/services/resume.service";

export default function CoverLetterGen({ resumeId }: { resumeId: number }) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jdText, setJdText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!jobTitle.trim() || !company.trim()) return;
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/account/resume/${resumeId}/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, company, jdText: jdText.trim() || undefined }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setLetter(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  }

  async function copy() {
    if (!letter) return;
    await navigator.clipboard.writeText(letter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-2xl">
      <h3 className="text-white font-mono font-bold mb-1">Cover Letter Generator</h3>
      <p className="text-lightGrey text-xs font-mono mb-5">
        AI-generated cover letter tailored to the role
      </p>

      <div className="glass rounded-xl border border-white/10 p-5 mb-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Job Title *</label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-cyan/50"
              placeholder="DevOps Engineer"
            />
          </div>
          <div>
            <label className="field-label">Company *</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-cyan/50"
              placeholder="Acme Corp"
            />
          </div>
        </div>
        <div>
          <label className="field-label">Job Description (optional — improves quality)</label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-cyan/50 resize-none"
            placeholder="Paste the job description for a more tailored letter…"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={generate}
            disabled={generating || !jobTitle.trim() || !company.trim()}
            className="bg-cyan text-black font-mono font-bold text-xs px-5 py-2 rounded-lg hover:bg-lightCyan transition-colors disabled:opacity-50"
          >
            {generating ? "Generating…" : letter ? "Regenerate" : "Generate Cover Letter"}
          </button>
          {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
        </div>
      </div>

      {letter && (
        <div className="glass rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-mono text-xs font-bold">{letter.jobTitle} at {letter.company}</p>
              <p className="text-lightGrey text-[10px] font-mono">
                Generated {new Date(letter.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <button
              onClick={copy}
              className="text-xs font-mono border border-white/20 text-lightGrey px-3 py-1.5 rounded-lg hover:border-cyan/40 hover:text-cyan transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="bg-white/3 rounded-lg p-4 text-xs font-sans text-lightGrey leading-relaxed whitespace-pre-wrap">
            {letter.content}
          </div>
        </div>
      )}
    </div>
  );
}
