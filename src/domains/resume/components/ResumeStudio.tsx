"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FileText, Upload, Download, Loader2, Eye, RotateCcw,
  Copy, Check, ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import type { Resume, ResumeVersion } from "@/domains/resume/services/resume.service";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import type { AtsScore } from "@/ai/schemas/atsScore";
import { TEMPLATES, type TemplateKey } from "./templates";
import JDMatcher from "./JDMatcher";
import VersionList from "./VersionList";

// Template display config — friendly names + colored header bars for thumbnails
const TEMPLATE_DISPLAY: { key: TemplateKey; label: string; color: string }[] = [
  { key: "minimal",   label: "Minimal",   color: "#00D964" },
  { key: "pipeline",  label: "Classic",   color: "#3B82F6" },
  { key: "blueprint", label: "Compact",   color: "#8B5CF6" },
  { key: "corporate", label: "Technical", color: "#F59E0B" },
  { key: "sarath",    label: "Executive", color: "#EC4899" },
  { key: "dashboard", label: "Sidebar",   color: "#06B6D4" },
  { key: "terminal",  label: "Clean",     color: "#9CA3AF" },
];

const SECTION_LABELS: Record<string, string> = {
  contactInfo:    "Contact Info",
  workExperience: "Work Experience",
  education:      "Education",
  skills:         "Skills Match",
  formatting:     "Formatting",
};

function scoreColor(pct: number) {
  if (pct >= 90) return "#00D964";
  if (pct >= 65) return "#F59E0B";
  return "#EF4444";
}

function ScoreIcon({ pct }: { pct: number }) {
  if (pct >= 90) return <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#00D964" }} />;
  if (pct >= 65) return <AlertCircle  className="w-4 h-4 flex-shrink-0" style={{ color: "#F59E0B" }} />;
  return <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#EF4444" }} />;
}

type RightTab = "preview" | "ats" | "cover" | "optimize" | "jdmatch" | "versions";

type BulletPair = { original: string; suggested: string };
type ExperienceOptimization = {
  jobTitle: string;
  company: string;
  pairs: BulletPair[];
  extraSuggested: string[];
};

export default function ResumeStudio() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Resume state
  const [,               setResumes]        = useState<Resume[]>([]);
  const [selected,       setSelected]       = useState<Resume | null>(null);
  const [currentVersion, setCurrentVersion] = useState<ResumeVersion | null>(null);
  const [resumeData,     setResumeData]     = useState<ResumeData | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [uploadError,    setUploadError]    = useState("");
  const [dragging,       setDragging]       = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Template
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>("minimal");

  // Right panel — defaults to the live preview so uploading/switching templates has an
  // immediately visible effect instead of only mattering at export/print time.
  const [activeTab, setActiveTab] = useState<RightTab>("preview");

  // ATS
  const [analyzing,    setAnalyzing]    = useState(false);
  const [atsResult,    setAtsResult]    = useState<AtsScore | null>(null);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [suggestions,  setSuggestions]  = useState<{ text: string; checked: boolean }[]>([]);

  // Cover Letter
  const [jdExpanded,      setJdExpanded]      = useState(false);
  const [jdText,          setJdText]          = useState("");
  const [coverJobTitle,   setCoverJobTitle]   = useState("");
  const [coverCompany,    setCoverCompany]    = useState("");
  const [coverLetter,     setCoverLetter]     = useState("");
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverError,      setCoverError]      = useState("");
  const [copiedCover,     setCopiedCover]     = useState(false);
  const [atsError,        setAtsError]        = useState("");

  // Optimize
  const [tailoring,      setTailoring]      = useState(false);
  const [tailoredData,   setTailoredData]   = useState<ResumeData | null>(null);
  const [tailorError,    setTailorError]    = useState("");
  const [applyingTailor, setApplyingTailor] = useState(false);
  const [tailorApplied,  setTailorApplied]  = useState(false);

  // Versions
  const [versions, setVersions] = useState<ResumeVersion[]>([]);

  const loadResumes = useCallback(async () => {
    const res = await fetch("/api/account/resume");
    const data = await res.json();
    return Array.isArray(data) ? data : ([] as Resume[]);
  }, []);

  const loadVersions = useCallback(async (resumeId: number) => {
    try {
      const res = await fetch(`/api/account/resume/${resumeId}/versions`);
      if (!res.ok) return;
      const data = await res.json();
      setVersions(Array.isArray(data) ? data : []);
    } catch {
      setVersions([]);
    }
  }, []);

  async function selectResume(resume: Resume) {
    setLoading(true);
    setSelected(resume);
    setUploadError("");
    setAtsResult(null);
    setSuggestions([]);
    setTailoredData(null);
    setTailorError("");
    setTailorApplied(false);
    try {
      const rRes = await fetch(`/api/account/resume/${resume.id}`);
      const rData = await rRes.json();
      setCurrentVersion(rData.latestVersion ?? null);
      if (rData.latestVersion?.structuredData) {
        setResumeData(JSON.parse(rData.latestVersion.structuredData));
      } else {
        setResumeData(null);
      }
      await loadVersions(resume.id);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectVersion(v: ResumeVersion) {
    setCurrentVersion(v);
    try {
      setResumeData(JSON.parse(v.structuredData));
    } catch {
      setResumeData(null);
    }
  }

  useEffect(() => {
    loadResumes().then(list => {
      setResumes(list);
      if (list.length > 0) selectResume(list[0]);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", selected?.title ?? file.name.replace(/\.[^.]+$/, ""));
      const res = await fetch("/api/account/resume/upload", { method: "POST", body: formData });
      if (!res.ok) {
        let msg = "Upload failed";
        try { const d = await res.json(); msg = d.error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      let result: { structuredData: typeof resumeData; resumeId: number; versionId: number };
      try { result = await res.json(); } catch {
        throw new Error("Resume uploaded but parsing response failed. Try refreshing.");
      }
      setResumeData(result.structuredData);
      const list = await loadResumes();
      setResumes(list);
      // Select the resume this upload actually created — not list[0]/`selected`, which can
      // point at a different (possibly older or version-less) resume once a user has more
      // than one row, silently reverting the UI to "no resume" right after a real success.
      const uploaded = list.find(r => r.id === result.resumeId);
      if (uploaded) await selectResume(uploaded);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  async function runAtsAnalysis() {
    if (!selected) return;
    setAnalyzing(true);
    setAtsError("");
    try {
      const res = await fetch(`/api/account/resume/${selected.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ats" }),
      });
      if (!res.ok) {
        let msg = "Analysis failed";
        try { const d = await res.json(); msg = d.error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      const { result } = await res.json();
      setAtsResult(result);
      setLastAnalyzed(new Date());
      if (result.improvements?.length) {
        setSuggestions(result.improvements.map((text: string) => ({ text, checked: false })));
      }
    } catch (err) {
      setAtsError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function generateCoverLetter() {
    if (!selected) return;
    if (!coverJobTitle.trim()) { setCoverError("Please enter the job title."); return; }
    if (!coverCompany.trim())  { setCoverError("Please enter the company name."); return; }
    setGeneratingCover(true);
    setCoverError("");
    try {
      const res = await fetch(`/api/account/resume/${selected.id}/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: coverJobTitle.trim(),
          company:  coverCompany.trim(),
          jdText:   jdText.trim() || undefined,
        }),
      });
      if (!res.ok) {
        let msg = "Generation failed";
        try { const d = await res.json(); msg = d.error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      const data = await res.json();
      setCoverLetter(data.content ?? "");
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : "Failed to generate. Please try again.");
    } finally {
      setGeneratingCover(false);
    }
  }

  async function copyCoverLetter() {
    if (!coverLetter) return;
    await navigator.clipboard.writeText(coverLetter);
    setCopiedCover(true);
    setTimeout(() => setCopiedCover(false), 2000);
  }

  function downloadCoverLetter() {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "cover-letter.txt"; a.click();
    URL.revokeObjectURL(url);
  }

  async function runOptimize(jd?: string) {
    if (!selected) return;
    setTailoring(true);
    setTailorError("");
    setTailorApplied(false);
    try {
      const res = await fetch(`/api/account/resume/${selected.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "tailor", jdText: jd || undefined }),
      });
      if (!res.ok) {
        let msg = "Optimization failed";
        try { const d = await res.json(); msg = d.error ?? msg; } catch { /* ignore */ }
        throw new Error(msg);
      }
      const { result } = await res.json();
      setTailoredData(result as ResumeData);
    } catch (err) {
      setTailorError(err instanceof Error ? err.message : "Optimization failed. Please try again.");
    } finally {
      setTailoring(false);
    }
  }

  async function applyOptimization() {
    if (!selected || !tailoredData) return;
    setApplyingTailor(true);
    setTailorError("");
    try {
      const res = await fetch(`/api/account/resume/${selected.id}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ structuredData: tailoredData }),
      });
      if (!res.ok) throw new Error("Failed to save new version");
      const newVersion: ResumeVersion = await res.json();
      setCurrentVersion(newVersion);
      setResumeData(tailoredData);
      setTailorApplied(true);
      await loadVersions(selected.id);
    } catch (err) {
      setTailorError(err instanceof Error ? err.message : "Failed to apply optimization.");
    } finally {
      setApplyingTailor(false);
    }
  }

  const hasResume = !!resumeData;
  const lastAnalyzedStr = lastAnalyzed
    ? lastAnalyzed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
      " · " + lastAnalyzed.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : null;
  const doneCount = suggestions.filter(s => s.checked).length;
  const atsSections = atsResult
    ? Object.entries(atsResult.sections).map(([key, sec]) => ({
        key,
        label: SECTION_LABELS[key] ?? key,
        score: sec.score,
      }))
    : [];
  const TemplateComponent = TEMPLATES.find(t => t.key === selectedTemplate)?.component;

  // Zip original vs. tailored bullet points per work-experience entry, index-aligned,
  // defensively handling any length mismatch (tailorResume is prompted to preserve structure,
  // but never guaranteed).
  const experienceOptimizations: ExperienceOptimization[] = (() => {
    if (!resumeData || !tailoredData) return [];
    const origExp = resumeData.experiences ?? [];
    const tailExp = tailoredData.experiences ?? [];
    const expCount = Math.min(origExp.length, tailExp.length);
    const out: ExperienceOptimization[] = [];
    for (let i = 0; i < expCount; i++) {
      const orig = origExp[i];
      const tail = tailExp[i];
      const origResp = orig.responsibilities ?? [];
      const tailResp = tail.responsibilities ?? [];
      const pairCount = Math.min(origResp.length, tailResp.length);
      const pairs: BulletPair[] = [];
      for (let j = 0; j < pairCount; j++) {
        pairs.push({ original: origResp[j], suggested: tailResp[j] });
      }
      const extraSuggested = tailResp.slice(pairCount);
      if (pairs.length > 0 || extraSuggested.length > 0) {
        out.push({ jobTitle: orig.jobTitle, company: orig.company, pairs, extraSuggested });
      }
    }
    return out;
  })();

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-7">
        <div>
          <nav className="flex items-center gap-1.5 text-[11px] font-mono mb-3" style={{ color: "#6B7280" }}>
            <span>Career Centre</span>
            <ChevronRight className="w-3 h-3 opacity-40" />
            <span className="text-white">Resume Studio</span>
          </nav>
          <h1 className="text-white text-2xl sm:text-[28px] font-bold mb-1">Resume Studio</h1>
          <p className="text-sm font-mono" style={{ color: "#6B7280" }}>
            Upload, analyze, and tailor your resume for DevOps &amp; Cloud roles
          </p>
        </div>
        {lastAnalyzedStr && (
          <div
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-mono"
            style={{ backgroundColor: "#16161A", border: "1px solid #26262B", color: "#6B7280" }}
          >
            Last analyzed: {lastAnalyzedStr}
          </div>
        )}
      </div>

      {/* ── Two-Panel Layout ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start">

        {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
        <div className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-5">

          {/* "Your Resume" section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-3.5 h-3.5" style={{ color: "#6B7280" }} />
              <span className="text-white font-bold text-sm">Your Resume</span>
            </div>

            {loading && !uploading ? (
              <div
                className="rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#16161A", border: "1px solid #26262B", height: "96px" }}
              >
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#00D964" }} />
              </div>
            ) : hasResume && selected && currentVersion ? (
              /* Uploaded file card */
              <div className="rounded-lg p-4" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#00D964" }}
                  >
                    <FileText className="w-4 h-4 text-black" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-[12px] font-mono font-bold truncate">{selected.title}</p>
                    <p className="text-[11px] font-mono mt-0.5" style={{ color: "#6B7280" }}>
                      v{currentVersion.versionNumber} · {new Date(currentVersion.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-md border transition-colors"
                    style={{ borderColor: "#26262B", color: "#6B7280", backgroundColor: "#0A0A0B" }}
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="text-[11px] font-mono transition-colors disabled:opacity-50"
                    style={{ color: "#6B7280" }}
                  >
                    {uploading ? "Uploading…" : "Replace"}
                  </button>
                </div>
              </div>
            ) : (
              /* Dropzone */
              <div
                className="rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                style={{
                  border: `1px dashed ${dragging ? "#00D964" : "#26262B"}`,
                  backgroundColor: dragging ? "rgba(0,217,100,0.04)" : "#0A0A0B",
                  minHeight: "120px",
                  padding: "24px 16px",
                }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                {uploading
                  ? <Loader2 className="w-7 h-7 animate-spin mb-2" style={{ color: "#00D964" }} />
                  : <Upload   className="w-7 h-7 mb-2"             style={{ color: "#6B7280" }} />
                }
                <p className="text-white text-[12px] font-mono font-medium">
                  {uploading ? "Uploading…" : "Drop your resume here"}
                </p>
                {!uploading && (
                  <>
                    <p className="text-[11px] font-mono mt-0.5" style={{ color: "#6B7280" }}>or click to upload</p>
                    <p className="text-[10px] font-mono mt-2"   style={{ color: "#374151" }}>PDF · DOCX · max 5MB</p>
                  </>
                )}
              </div>
            )}

            {uploadError && (
              <p className="text-[11px] font-mono mt-2" style={{ color: "#EF4444" }}>{uploadError}</p>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={onFileInputChange} />
          </div>

          {/* Template grid */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest mb-2.5" style={{ color: "#6B7280" }}>
              Template
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2">
              {TEMPLATE_DISPLAY.map(t => {
                const isSel = selectedTemplate === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setSelectedTemplate(t.key)}
                    className="relative flex flex-col rounded-md overflow-hidden transition-all"
                    style={{ border: `2px solid ${isSel ? "#00D964" : "#26262B"}` }}
                  >
                    {isSel && (
                      <div
                        className="absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center z-10"
                        style={{ backgroundColor: "#00D964" }}
                      >
                        <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                      </div>
                    )}
                    {/* Colored header bar */}
                    <div style={{ height: "48px", backgroundColor: t.color, opacity: isSel ? 1 : 0.65 }} />
                    {/* Text-line simulators */}
                    <div className="px-1.5 py-1.5 flex flex-col gap-1" style={{ backgroundColor: "#f5f5f5" }}>
                      <div className="h-1 rounded-full bg-gray-300 w-full" />
                      <div className="h-1 rounded-full bg-gray-200 w-4/5" />
                      <div className="h-1 rounded-full bg-gray-100 w-3/5" />
                    </div>
                    {/* Label */}
                    <div className="px-1.5 py-1" style={{ backgroundColor: "#16161A" }}>
                      <span className="text-[10px] font-mono" style={{ color: isSel ? "#00D964" : "#6B7280" }}>
                        {t.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={hasResume ? () => window.print() : undefined}
            disabled={!hasResume}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-[14px] transition-all"
            style={{
              backgroundColor: hasResume ? "#00D964" : "#16161A",
              color:           hasResume ? "#0A0A0B" : "#374151",
              cursor:          hasResume ? "pointer" : "not-allowed",
              border:          hasResume ? "none"    : "1px solid #26262B",
            }}
          >
            <Download className="w-4 h-4" />
            Export to PDF
          </button>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Tab bar */}
          <div className="flex items-end gap-4 sm:gap-6 border-b mb-6 overflow-x-auto" style={{ borderColor: "#26262B" }}>
            {(["preview", "ats", "cover", "optimize", "jdmatch", "versions"] as const).map(tab => {
              const labels = { preview: "Preview", ats: "ATS Score", cover: "Cover Letter", optimize: "Optimize", jdmatch: "JD Match", versions: "Versions" };
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => { if (hasResume) setActiveTab(tab); }}
                  className="pb-3 text-[13px] font-mono transition-colors whitespace-nowrap flex-shrink-0"
                  style={{
                    color:        isActive ? "#FFFFFF" : "#6B7280",
                    cursor:       hasResume ? "pointer" : "not-allowed",
                    borderBottom: isActive ? "2px solid #00D964" : "2px solid transparent",
                    marginBottom: "-1px",
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
            {!hasResume && (
              <div
                className="ml-auto mb-2 px-2.5 py-1 rounded-full text-[10px] font-mono whitespace-nowrap flex-shrink-0"
                style={{ backgroundColor: "#16161A", border: "1px solid #26262B", color: "#6B7280" }}
              >
                Upload a resume to unlock
              </div>
            )}
          </div>

          {/* ── Empty state ────────────────────────────────────────────── */}
          {!hasResume ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
              >
                <FileText className="w-7 h-7" style={{ color: "#374151" }} />
              </div>
              <p className="text-white text-base font-bold mb-2">No resume uploaded yet</p>
              <p className="text-sm font-mono max-w-xs leading-relaxed" style={{ color: "#6B7280" }}>
                Upload your resume on the left to unlock ATS scoring, cover letter generation, and optimisation suggestions.
              </p>
            </div>

          ) : activeTab === "preview" ? (
            /* ── Live Preview tab ──────────────────────────────────────────
               Renders the exact same TemplateComponent used for print/export, just
               visible on-screen instead of hidden — switching templates in the picker
               updates this immediately, so template choice finally has a visible effect
               before you ever hit Export. */
            <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "#26262B" }}>
                <span className="text-[11px] font-mono" style={{ color: "#6B7280" }}>
                  Live preview — {TEMPLATES.find(t => t.key === selectedTemplate)?.name ?? "Template"}
                </span>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}
                >
                  <Download className="w-3 h-3" /> Export to PDF
                </button>
              </div>
              <div
                className="overflow-auto flex justify-center py-8 px-4"
                style={{ backgroundColor: "#1a1a1e", maxHeight: "80vh" }}
              >
                <div className="shadow-2xl" style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
                  {TemplateComponent && resumeData && <TemplateComponent data={resumeData} />}
                </div>
              </div>
            </div>

          ) : activeTab === "ats" ? (
            /* ── ATS Score tab ─────────────────────────────────────────── */
            <div className="space-y-4">
              {analyzing ? (
                <>
                  {/* Loading card */}
                  <div
                    className="rounded-lg p-8 flex flex-col items-center justify-center text-center"
                    style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
                  >
                    <Loader2 className="w-9 h-9 animate-spin mb-4" style={{ color: "#00D964" }} />
                    <p className="text-white text-base font-bold mb-1">Analyzing your resume...</p>
                    <p className="text-[12px] font-mono mb-5" style={{ color: "#00D964" }}>
                      Checking keywords, formatting, ATS compatibility
                    </p>
                    <div className="w-full max-w-xs h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#26262B" }}>
                      <div className="h-full rounded-full animate-pulse" style={{ backgroundColor: "#00D964", width: "65%" }} />
                    </div>
                  </div>
                  {/* Skeleton breakdown */}
                  <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
                    <p className="text-[10px] font-mono uppercase tracking-widest px-5 py-3 border-b" style={{ color: "#6B7280", borderColor: "#26262B" }}>
                      Score Breakdown
                    </p>
                    {["Contact Info", "Work Experience", "Education", "Skills Match", "Formatting"].map((label, i, arr) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 px-5 py-3"
                        style={{ borderBottom: i < arr.length - 1 ? "1px solid #1e1e24" : "none" }}
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#F59E0B" }} />
                        <span className="text-[13px] font-mono flex-1" style={{ color: "#6B7280" }}>{label}</span>
                        <span className="text-[12px] font-mono" style={{ color: "#374151" }}>—</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : !atsResult ? (
                /* Run button state */
                <div className="space-y-3">
                  {atsError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#EF4444" }} />
                      <p className="text-[12px] font-mono" style={{ color: "#EF4444" }}>{atsError}</p>
                    </div>
                  )}
                  <div
                    className="rounded-lg p-10 flex flex-col items-center justify-center text-center"
                    style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
                  >
                    <p className="text-white font-bold mb-2">Run ATS Analysis</p>
                    <p className="text-[12px] font-mono mb-5 max-w-sm" style={{ color: "#6B7280" }}>
                      Analyzes your resume against common ATS parsing rules and DevOps keywords
                    </p>
                    <button
                      onClick={runAtsAnalysis}
                      className="px-5 py-2.5 rounded-lg font-bold text-[13px] font-mono transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}
                    >
                      Run ATS Scan
                    </button>
                  </div>
                </div>
              ) : (
                /* Results */
                <>
                  {/* Overall score */}
                  <div
                    className="rounded-lg p-5 flex items-center justify-between"
                    style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
                  >
                    <div>
                      <p className="font-mono font-bold" style={{ fontSize: "40px", color: "#FFFFFF", lineHeight: 1 }}>
                        {atsResult.overallScore}
                        <span className="text-xl" style={{ color: "#6B7280" }}> / 100</span>
                      </p>
                      <p className="text-[12px] font-mono mt-1" style={{ color: scoreColor(atsResult.overallScore) }}>
                        {atsResult.overallScore >= 80 ? "Good — minor improvements possible" :
                         atsResult.overallScore >= 65 ? "Fair — some improvements needed" :
                         "Needs work — significant improvements required"}
                      </p>
                    </div>
                    <button
                      onClick={runAtsAnalysis}
                      className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-md transition-colors"
                      style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B", color: "#6B7280" }}
                    >
                      <RotateCcw className="w-3 h-3" /> Re-analyze
                    </button>
                  </div>

                  {/* Score breakdown */}
                  <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
                    <p className="text-[10px] font-mono uppercase tracking-widest px-5 py-3 border-b" style={{ color: "#6B7280", borderColor: "#26262B" }}>
                      Score Breakdown
                    </p>
                    {atsSections.map((row, i) => (
                      <div
                        key={row.key}
                        className="flex items-center gap-3 px-5 py-3"
                        style={{ borderBottom: i < atsSections.length - 1 ? "1px solid #1e1e24" : "none" }}
                      >
                        <ScoreIcon pct={row.score} />
                        <span className="text-[13px] font-mono flex-1 min-w-0 truncate text-white">{row.label}</span>
                        <div className="w-20 sm:w-44 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: "#26262B" }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${row.score}%`, backgroundColor: scoreColor(row.score) }}
                          />
                        </div>
                        <span className="text-[12px] font-mono w-9 text-right" style={{ color: scoreColor(row.score) }}>
                          {row.score}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Suggestions checklist */}
                  {suggestions.length > 0 && (
                    <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
                      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#26262B" }}>
                        <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#6B7280" }}>Suggestions</p>
                        <span className="text-[11px] font-mono" style={{ color: "#00D964" }}>
                          {doneCount}/{suggestions.length} done
                        </span>
                      </div>
                      {suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 px-5 py-4 cursor-pointer"
                          style={{ borderBottom: i < suggestions.length - 1 ? "1px solid #1e1e24" : "none" }}
                          onClick={() => setSuggestions(prev =>
                            prev.map((item, j) => j === i ? { ...item, checked: !item.checked } : item)
                          )}
                        >
                          <div
                            className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                            style={{
                              backgroundColor: s.checked ? "#00D964" : "transparent",
                              borderColor:     s.checked ? "#00D964" : "#374151",
                            }}
                          >
                            {s.checked && <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
                          </div>
                          <span
                            className="text-[13px] font-mono leading-relaxed"
                            style={{
                              color:          s.checked ? "#374151" : "#9CA3AF",
                              textDecoration: s.checked ? "line-through" : "none",
                            }}
                          >
                            {s.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Keywords */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg p-4" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: "#00D964" }}>Found Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {atsResult.keywords.found.slice(0, 12).map((k, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "rgba(0,217,100,0.1)", color: "#00D964", border: "1px solid rgba(0,217,100,0.2)" }}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg p-4" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: "#F59E0B" }}>Missing Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {atsResult.keywords.missing.slice(0, 12).map((k, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

          ) : activeTab === "cover" ? (
            /* ── Cover Letter tab ──────────────────────────────────────── */
            <div className="space-y-4">
              {/* Job details inputs */}
              <div className="rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest mb-1.5" style={{ color: "#6B7280" }}>
                    Job Title <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={coverJobTitle}
                    onChange={e => setCoverJobTitle(e.target.value)}
                    placeholder="e.g. Senior DevOps Engineer"
                    className="w-full rounded-md px-3 py-2 text-base sm:text-[12px] font-mono focus:outline-none transition-colors"
                    style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B", color: "#E0E0E0" }}
                    onFocus={e => (e.target.style.borderColor = "#00D964")}
                    onBlur={e  => (e.target.style.borderColor = "#26262B")}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest mb-1.5" style={{ color: "#6B7280" }}>
                    Company <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={coverCompany}
                    onChange={e => setCoverCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-md px-3 py-2 text-base sm:text-[12px] font-mono focus:outline-none transition-colors"
                    style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B", color: "#E0E0E0" }}
                    onFocus={e => (e.target.style.borderColor = "#00D964")}
                    onBlur={e  => (e.target.style.borderColor = "#26262B")}
                  />
                </div>
              </div>

              {/* Collapsible JD input */}
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
                <button
                  className="w-full flex items-center gap-2 px-4 py-3 text-left"
                  onClick={() => setJdExpanded(v => !v)}
                >
                  {jdExpanded
                    ? <ChevronDown  className="w-4 h-4" style={{ color: "#6B7280" }} />
                    : <ChevronRight className="w-4 h-4" style={{ color: "#6B7280" }} />
                  }
                  <span className="text-[13px] font-mono" style={{ color: "#6B7280" }}>
                    Paste job description (optional — improves tailoring)
                  </span>
                </button>
                {jdExpanded && (
                  <div className="px-4 pb-4">
                    <textarea
                      value={jdText}
                      onChange={e => setJdText(e.target.value)}
                      rows={5}
                      placeholder="Paste the full job description here..."
                      className="w-full rounded-lg px-3 py-2 text-base sm:text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-cyan/60 resize-none"
                      style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B", color: "#9CA3AF" }}
                    />
                  </div>
                )}
              </div>

              {/* Error */}
              {coverError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#EF4444" }} />
                  <p className="text-[12px] font-mono" style={{ color: "#EF4444" }}>{coverError}</p>
                </div>
              )}

              {/* Toolbar */}
              <div
                className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-lg"
                style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
              >
                <button
                  onClick={generateCoverLetter}
                  disabled={generatingCover}
                  className="flex items-center gap-1.5 text-[12px] font-mono font-bold px-3 py-1.5 rounded-md transition-opacity disabled:opacity-50 hover:opacity-90"
                  style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}
                >
                  {generatingCover ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                  {coverLetter ? "Regenerate" : "Generate"}
                </button>
                {coverLetter && (
                  <>
                    <button
                      onClick={copyCoverLetter}
                      className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-md transition-colors"
                      style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B", color: "#6B7280" }}
                    >
                      {copiedCover ? <Check className="w-3 h-3" style={{ color: "#00D964" }} /> : <Copy className="w-3 h-3" />}
                      {copiedCover ? "Copied ✓" : "Copy"}
                    </button>
                    <button
                      onClick={downloadCoverLetter}
                      className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-md transition-colors"
                      style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B", color: "#6B7280" }}
                    >
                      <Download className="w-3 h-3" /> Download
                    </button>
                    <span className="ml-auto text-[11px] font-mono" style={{ color: "#374151" }}>
                      {coverLetter.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </>
                )}
              </div>

              {/* Cover letter area */}
              <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #26262B" }}>
                {generatingCover ? (
                  <div className="flex items-center justify-center py-12" style={{ backgroundColor: "#16161A" }}>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" style={{ color: "#00D964" }} />
                    <span className="text-[13px] font-mono" style={{ color: "#6B7280" }}>Generating cover letter...</span>
                  </div>
                ) : coverLetter ? (
                  <textarea
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                    className="w-full px-5 py-4 text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan/60 resize-none"
                    style={{
                      backgroundColor: "#16161A",
                      color: "#FFFFFF",
                      minHeight: "400px",
                      fontFamily: "Inter, sans-serif",
                    }}
                  />
                ) : (
                  <div
                    className="flex flex-col items-center justify-center py-12 text-center"
                    style={{ backgroundColor: "#16161A" }}
                  >
                    <p className="text-[13px] font-mono" style={{ color: "#6B7280" }}>
                      Click Generate to create a tailored cover letter
                    </p>
                  </div>
                )}
              </div>
            </div>

          ) : activeTab === "jdmatch" ? (
            /* ── JD Match tab ──────────────────────────────────────────── */
            <div className="rounded-lg p-5" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
              {selected && (
                <JDMatcher
                  resumeId={selected.id}
                  onTailor={(jd) => { setActiveTab("optimize"); runOptimize(jd); }}
                />
              )}
            </div>

          ) : activeTab === "versions" ? (
            /* ── Versions tab ──────────────────────────────────────────── */
            <div className="rounded-lg p-5" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
              <p className="text-white font-mono font-bold text-sm mb-1">Version History</p>
              <p className="text-[12px] font-mono mb-4" style={{ color: "#6B7280" }}>
                Select a previous version to preview and switch to it
              </p>
              <VersionList
                versions={versions}
                currentVersionId={currentVersion?.id ?? 0}
                onSelect={handleSelectVersion}
              />
            </div>

          ) : (
            /* ── Optimize tab ──────────────────────────────────────────── */
            <div className="space-y-4">
              {tailoring ? (
                /* Loading card */
                <div
                  className="rounded-lg p-8 flex flex-col items-center justify-center text-center"
                  style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
                >
                  <Loader2 className="w-9 h-9 animate-spin mb-4" style={{ color: "#00D964" }} />
                  <p className="text-white text-base font-bold mb-1">Optimizing your resume...</p>
                  <p className="text-[12px] font-mono" style={{ color: "#00D964" }}>
                    Strengthening language, tightening bullet points
                  </p>
                </div>
              ) : !tailoredData ? (
                /* Run button state */
                <div className="space-y-3">
                  {tailorError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#EF4444" }} />
                      <p className="text-[12px] font-mono" style={{ color: "#EF4444" }}>{tailorError}</p>
                    </div>
                  )}
                  <div
                    className="rounded-lg p-10 flex flex-col items-center justify-center text-center"
                    style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
                  >
                    <p className="text-white font-bold mb-2">Optimize My Resume</p>
                    <p className="text-[12px] font-mono mb-5 max-w-sm" style={{ color: "#6B7280" }}>
                      AI rewrites your bullet points with stronger language and quantified impact — review before applying
                    </p>
                    <button
                      onClick={() => runOptimize()}
                      className="px-5 py-2.5 rounded-lg font-bold text-[13px] font-mono transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}
                    >
                      Optimize My Resume
                    </button>
                  </div>
                </div>
              ) : (
                /* Results */
                <>
                  {/* Toolbar */}
                  <div
                    className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 py-2.5 rounded-lg"
                    style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
                  >
                    <button
                      onClick={() => runOptimize()}
                      disabled={tailoring}
                      className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-md transition-colors"
                      style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B", color: "#6B7280" }}
                    >
                      <RotateCcw className="w-3 h-3" /> Re-optimize
                    </button>
                    <button
                      onClick={applyOptimization}
                      disabled={applyingTailor || tailorApplied}
                      className="flex items-center gap-1.5 text-[12px] font-mono font-bold px-3 py-1.5 rounded-md transition-opacity disabled:opacity-50 hover:opacity-90"
                      style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}
                    >
                      {applyingTailor
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <CheckCircle2 className="w-3 h-3" />
                      }
                      {tailorApplied ? "Applied ✓" : "Apply as New Version"}
                    </button>
                    {tailorApplied && currentVersion && (
                      <span className="text-[11px] font-mono" style={{ color: "#00D964" }}>
                        Saved as v{currentVersion.versionNumber}
                      </span>
                    )}
                  </div>

                  {tailorError && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#EF4444" }} />
                      <p className="text-[12px] font-mono" style={{ color: "#EF4444" }}>{tailorError}</p>
                    </div>
                  )}

                  {experienceOptimizations.length === 0 ? (
                    <div className="rounded-lg p-8 text-center" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
                      <p className="text-[13px] font-mono" style={{ color: "#6B7280" }}>
                        No bullet-level changes to review — your resume already reads strong.
                      </p>
                    </div>
                  ) : (
                    experienceOptimizations.map((exp, ei) => (
                      <div key={ei} className="rounded-lg overflow-hidden" style={{ border: "1px solid #26262B" }}>
                        {/* Experience header */}
                        <div className="px-5 py-3 border-b" style={{ backgroundColor: "#16161A", borderColor: "#26262B" }}>
                          <p className="text-white text-[13px] font-mono font-bold">{exp.jobTitle}</p>
                          <p className="text-[11px] font-mono" style={{ color: "#6B7280" }}>{exp.company}</p>
                        </div>
                        {/* Column labels */}
                        <div
                          className="hidden sm:grid grid-cols-2 gap-4 px-5 py-2 border-b"
                          style={{ backgroundColor: "#0d0d10", borderColor: "#26262B" }}
                        >
                          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#6B7280" }}>Original</span>
                          <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "#6B7280" }}>AI Suggested</span>
                        </div>
                        {/* Bullet pairs */}
                        {exp.pairs.map((pair, i) => (
                          <div
                            key={i}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 px-4 sm:px-5 py-4"
                            style={{
                              backgroundColor: i % 2 === 0 ? "#0d0d10" : "#16161A",
                              borderBottom: i < exp.pairs.length - 1 || exp.extraSuggested.length > 0 ? "1px solid #1e1e24" : "none",
                            }}
                          >
                            <span className="text-[13px] font-mono leading-relaxed" style={{ color: "#9CA3AF" }}>
                              {pair.original}
                            </span>
                            <span className="text-[13px] font-mono leading-relaxed" style={{ color: "#FFFFFF" }}>
                              {pair.suggested}
                            </span>
                          </div>
                        ))}
                        {/* Extra suggested bullets (tailored resume has more than original) */}
                        {exp.extraSuggested.length > 0 && (
                          <div className="px-4 sm:px-5 py-4" style={{ backgroundColor: "#16161A" }}>
                            <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "#6B7280" }}>
                              Additional suggested bullets
                            </p>
                            <ul className="space-y-1">
                              {exp.extraSuggested.map((b, i) => (
                                <li key={i} className="text-[13px] font-mono leading-relaxed" style={{ color: "#FFFFFF" }}>
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <p className="text-[11px] font-mono text-center" style={{ color: "#374151" }}>
                    AI-suggested rewrites based on your resume — apply to save as a new version
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Print-only template area — portaled straight onto <body>. The print CSS below hides
          every OTHER direct child of body; #resume-print-root has to actually be one for that
          to keep it visible. Rendered in place (nested many levels inside the app layout), an
          ancestor several levels up is what's actually the direct body child, so hiding "every
          body child that isn't #resume-print-root" hid that ancestor -- taking the print root
          down with it as a descendant, regardless of its own display value. That's what was
          producing a blank export: real content, hidden behind a hidden ancestor. */}
      {mounted && createPortal(
        <>
          <div id="resume-print-root" style={{ display: "none" }}>
            {TemplateComponent && resumeData && <TemplateComponent data={resumeData} />}
          </div>
          <style>{`
            @media print {
              body > *:not(#resume-print-root) { display: none !important; }
              #resume-print-root { display: block !important; }
            }
          `}</style>
        </>,
        document.body
      )}
    </>
  );
}
