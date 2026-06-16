"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Resume, ResumeVersion } from "@/domains/resume/services/resume.service";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import { TEMPLATES, type TemplateKey } from "./templates";
import ATSAnalyzer from "./ATSAnalyzer";
import JDMatcher from "./JDMatcher";
import CoverLetterGen from "./CoverLetterGen";
import VersionList from "./VersionList";

type Tab = "templates" | "ats" | "jd" | "cover" | "versions";

const TABS: { id: Tab; label: string }[] = [
  { id: "templates", label: "Templates" },
  { id: "ats", label: "ATS Score" },
  { id: "jd", label: "JD Match" },
  { id: "cover", label: "Cover Letter" },
  { id: "versions", label: "Versions" },
];

export default function ResumeStudio() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState<Resume | null>(null);
  const [currentVersion, setCurrentVersion] = useState<ResumeVersion | null>(null);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>("pipeline");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadResumes = useCallback(async () => {
    const res = await fetch("/api/account/resume");
    const data = await res.json();
    setResumes(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => { loadResumes(); }, [loadResumes]);

  async function selectResume(resume: Resume) {
    setLoading(true);
    setSelected(resume);
    setError("");
    try {
      const [vRes, rRes] = await Promise.all([
        fetch(`/api/account/resume/${resume.id}/versions`),
        fetch(`/api/account/resume/${resume.id}`),
      ]);
      const vData = await vRes.json();
      const rData = await rRes.json();
      setVersions(Array.isArray(vData) ? vData : []);
      setCurrentVersion(rData.latestVersion ?? null);
      if (rData.latestVersion) {
        setResumeData(JSON.parse(rData.latestVersion.structuredData));
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", selected.title);
      const res = await fetch("/api/account/resume/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Upload failed");
      }
      const result = await res.json();
      setResumeData(result.structuredData);
      await selectResume(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function createResume() {
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/account/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      const resume = await res.json();
      await loadResumes();
      setNewTitle("");
      setCreating(false);
      await selectResume(resume);
    } finally {
      setLoading(false);
    }
  }

  async function deleteResume(id: number) {
    await fetch(`/api/account/resume/${id}`, { method: "DELETE" });
    if (selected?.id === id) {
      setSelected(null);
      setCurrentVersion(null);
      setResumeData(null);
    }
    await loadResumes();
  }

  function printResume() {
    window.print();
  }

  const TemplateComponent = TEMPLATES.find((t) => t.key === selectedTemplate)?.component;

  return (
    <div className="flex gap-6 h-full">
      {/* Left panel — resume list */}
      <div className="w-56 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-mono font-bold text-sm">Resumes</h2>
          <button
            onClick={() => setCreating(true)}
            className="text-xs font-mono text-cyan hover:underline"
          >
            + New
          </button>
        </div>

        {creating && (
          <div className="mb-3 flex flex-col gap-2">
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createResume()}
              placeholder="Resume title"
              className="w-full bg-white/5 border border-cyan/30 rounded-lg px-3 py-1.5 text-white text-xs font-mono focus:outline-none"
            />
            <div className="flex gap-2">
              <button onClick={createResume} className="bg-cyan text-black text-xs font-mono font-bold px-3 py-1 rounded-lg">Create</button>
              <button onClick={() => setCreating(false)} className="text-xs font-mono text-lightGrey hover:text-white">Cancel</button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          {resumes.length === 0 && !creating && (
            <p className="text-lightGrey text-xs font-mono">No resumes yet. Create one to get started.</p>
          )}
          {resumes.map((r) => (
            <div
              key={r.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                selected?.id === r.id
                  ? "bg-cyan/10 border border-cyan/30 text-cyan"
                  : "text-lightGrey hover:text-white hover:bg-white/5"
              }`}
              onClick={() => selectResume(r)}
            >
              <span className="text-xs font-mono truncate">{r.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteResume(r.id); }}
                className="opacity-0 group-hover:opacity-100 text-red-400 text-[10px] hover:text-red-300 ml-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — studio */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lightGrey font-mono text-sm mb-2">Select or create a resume to get started</p>
            <button
              onClick={() => setCreating(true)}
              className="bg-cyan text-black font-mono font-bold text-xs px-4 py-2 rounded-lg hover:bg-lightCyan transition-colors"
            >
              + New Resume
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-mono font-bold">{selected.title}</h2>
                {currentVersion && (
                  <p className="text-lightGrey text-xs font-mono">
                    v{currentVersion.versionNumber} · {new Date(currentVersion.createdAt).toLocaleDateString("en-GB")}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {/* Upload button */}
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleUpload} />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="text-xs font-mono border border-white/20 text-lightGrey px-3 py-1.5 rounded-lg hover:border-cyan/40 hover:text-cyan transition-colors disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : "Upload PDF"}
                </button>
                {resumeData && (
                  <button
                    onClick={printResume}
                    className="text-xs font-mono bg-cyan text-black font-bold px-3 py-1.5 rounded-lg hover:bg-lightCyan transition-colors"
                  >
                    Export PDF
                  </button>
                )}
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-mono mb-3">{error}</p>}

            {!resumeData && !loading && (
              <div className="glass rounded-xl border border-white/10 p-8 text-center mb-4">
                <p className="text-lightGrey font-mono text-xs mb-4">No content yet. Upload a PDF to extract your resume data.</p>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="bg-cyan text-black font-mono font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-lightCyan transition-colors"
                >
                  Upload Resume PDF
                </button>
              </div>
            )}

            {loading && (
              <p className="text-lightGrey text-xs font-mono text-center py-8">Loading…</p>
            )}

            {resumeData && (
              <>
                {/* Tabs */}
                <div className="flex gap-1 mb-5 border-b border-white/10 pb-0">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-xs font-mono rounded-t-lg transition-colors border-b-2 ${
                        activeTab === tab.id
                          ? "text-cyan border-cyan"
                          : "text-lightGrey border-transparent hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "templates" && (
                  <div>
                    {/* Template selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setSelectedTemplate(t.key)}
                          className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                            selectedTemplate === t.key
                              ? "border-cyan bg-cyan/10 text-cyan"
                              : "border-white/10 text-lightGrey hover:border-white/30"
                          }`}
                        >
                          <p className="text-xs font-mono font-bold">{t.name}</p>
                          <p className="text-[10px] font-mono text-lightGrey/60 mt-0.5 leading-tight">{t.description}</p>
                        </button>
                      ))}
                    </div>

                    {/* Template preview */}
                    <div className="border border-white/10 rounded-xl overflow-hidden">
                      <div className="bg-white/3 px-4 py-2 flex justify-between items-center">
                        <span className="text-xs font-mono text-lightGrey">Preview — {TEMPLATES.find(t => t.key === selectedTemplate)?.name}</span>
                        <button
                          onClick={printResume}
                          className="text-xs font-mono text-cyan hover:underline"
                        >
                          Export PDF →
                        </button>
                      </div>
                      <div className="overflow-auto max-h-[700px]">
                        {TemplateComponent && <TemplateComponent data={resumeData} />}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "ats" && <ATSAnalyzer resumeId={selected.id} />}
                {activeTab === "jd" && <JDMatcher resumeId={selected.id} />}
                {activeTab === "cover" && <CoverLetterGen resumeId={selected.id} />}
                {activeTab === "versions" && currentVersion && (
                  <div>
                    <p className="text-lightGrey text-xs font-mono mb-4">
                      Each save creates a new version. Click a version to preview it.
                    </p>
                    <VersionList
                      versions={versions}
                      currentVersionId={currentVersion.id}
                      onSelect={(v) => {
                        setCurrentVersion(v);
                        setResumeData(JSON.parse(v.structuredData));
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Print-only area */}
      <style>{`
        @media print {
          body > *:not(#resume-print-root) { display: none !important; }
          #resume-print-root { display: block !important; }
        }
      `}</style>
    </div>
  );
}
