"use client";
import { useEffect, useState } from "react";
import {
  Loader2, Settings, Server, ToggleRight, ToggleLeft,
  Plug, Lock, CheckCircle2, MinusCircle, Eye, EyeOff,
} from "lucide-react";

type SiteSettings = {
  environment: { nodeEnv: string; nodeVersion: string; vercelEnv: string; deploymentUrl: string; region: string | null };
  models: { chat: string; extract: string; embedding: string };
  features: { googleOAuth: boolean; ktCentre: boolean; jobBoard: boolean; aiResume: boolean; interview: boolean };
  connectedServices: Record<string, boolean>;
};

type Visibility = Record<string, boolean>;

const SECTIONS: { key: string; label: string; desc: string }[] = [
  { key: "about",        label: "About Me",       desc: "Bio and personal info section" },
  { key: "experience",   label: "Experience",     desc: "Work history timeline" },
  { key: "skills",       label: "Skills",         desc: "Tech stack and skill levels" },
  { key: "projects",     label: "Projects",       desc: "Portfolio project cards" },
  { key: "certifications", label: "Certifications", desc: "Cert badges and credentials" },
  { key: "achievements", label: "Achievements",   desc: "Stats bar (years, projects, etc)" },
  { key: "resume",       label: "Resume",         desc: "Resume download section" },
  { key: "services",     label: "Services",       desc: "What I offer section" },
  { key: "careerCentre", label: "Career Centre",  desc: "Job search CTA section" },
  { key: "githubStats",  label: "GitHub Stats",   desc: "Live GitHub contribution graph" },
  { key: "ktCentre",     label: "KT Centre",      desc: "Knowledge base / PDF library" },
  { key: "blog",         label: "Blog",           desc: "Blog posts section" },
  { key: "contact",      label: "Contact",        desc: "Contact form and details" },
];

function Card({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-[#00D964]" />
        <h3 className="text-[#E5E7EB] font-mono text-[13px] font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[#26262B]/40 last:border-0">
      <span className="text-[#6B7280] font-mono text-[11px]">{label}</span>
      <span className="text-[#E5E7EB] font-mono text-[12px] truncate max-w-[60%] text-right">{value}</span>
    </div>
  );
}

export function SiteSettingsTab() {
  const [data,       setData]       = useState<SiteSettings | null>(null);
  const [visibility, setVisibility] = useState<Visibility | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/site-settings").then(r => r.json()),
      fetch("/api/admin/visibility").then(r => r.json()),
    ]).then(([siteData, vis]) => {
      setData(siteData);
      setVisibility(vis);
      setLoading(false);
    });
  }, []);

  async function toggleSection(key: string) {
    if (!visibility) return;
    const updated = { ...visibility, [key]: !visibility[key] };
    setVisibility(updated);
    setSaving(true);
    await fetch("/api/admin/visibility", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: !visibility[key] }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 text-[#00D964] animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
            <Settings className="w-4 h-4 text-[#00D964]" />
          </div>
          <div>
            <h2 className="text-[#E5E7EB] font-mono text-sm font-semibold">Site Settings</h2>
            <p className="text-[#6B7280] font-mono text-[11px]">System config and section visibility</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-[#00D964] text-[11px] font-mono">Saved ✓</span>}
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00D964]" />}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono"
            style={{ backgroundColor: "#16161A", border: "1px solid #26262B", color: "#6B7280" }}>
            <Lock className="w-3.5 h-3.5" /> Env read-only
          </span>
        </div>
      </div>

      {/* Section Visibility — LIVE TOGGLES */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
        <div className="flex items-center gap-2 px-5 py-3 border-b" style={{ borderColor: "#26262B" }}>
          <Eye className="w-4 h-4 text-[#00D964]" />
          <h3 className="text-[#E5E7EB] font-mono text-[13px] font-semibold">Section Visibility</h3>
          <span className="ml-auto text-[10px] font-mono text-[#6B7280]">Changes apply immediately on next page load</span>
        </div>
        <div className="divide-y" style={{ borderColor: "#1e1e24" }}>
          {SECTIONS.map(s => {
            const on = visibility?.[s.key] ?? true;
            return (
              <div key={s.key} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[#E5E7EB] text-[13px] font-mono">{s.label}</p>
                  <p className="text-[#6B7280] text-[11px] font-mono">{s.desc}</p>
                </div>
                <button
                  onClick={() => toggleSection(s.key)}
                  className="flex items-center gap-1.5 text-[11px] font-mono transition-colors"
                  style={{ color: on ? "#00D964" : "#4B5563" }}
                >
                  {on
                    ? <><Eye className="w-4 h-4" /> Visible</>
                    : <><EyeOff className="w-4 h-4" /> Hidden</>
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Environment + Models */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card icon={Server} title="Environment">
            <Row label="Deployment URL" value={
              <a href={data.environment.deploymentUrl} target="_blank" rel="noreferrer"
                className="text-[#00D964] hover:underline">
                {data.environment.deploymentUrl.replace(/^https?:\/\//, "")}
              </a>
            } />
            <Row label="Vercel Env"   value={<span className="capitalize">{data.environment.vercelEnv}</span>} />
            <Row label="Node.js"      value={data.environment.nodeVersion} />
            {data.environment.region && <Row label="Region" value={data.environment.region} />}
            <Row label="Chat Model"   value={data.models.chat} />
            <Row label="Extract Model" value={data.models.extract} />
          </Card>

          <Card icon={Plug} title="Connected Services">
            {Object.entries(data.connectedServices).map(([name, set]) => (
              <div key={name} className="flex items-center justify-between gap-4 py-2 border-b border-[#26262B]/40 last:border-0">
                <span className="text-[#9CA3AF] font-mono text-[11px]">{name}</span>
                {set
                  ? <span className="inline-flex items-center gap-1 text-[#00D964] font-mono text-[11px]"><CheckCircle2 className="w-3.5 h-3.5" /> configured</span>
                  : <span className="inline-flex items-center gap-1 text-[#6B7280] font-mono text-[11px]"><MinusCircle className="w-3.5 h-3.5" /> not set</span>
                }
              </div>
            ))}
            <p className="text-[#4B5563] font-mono text-[10px] mt-3">Values never exposed — boolean only.</p>
          </Card>

          <Card icon={ToggleRight} title="Features">
            {Object.entries(data.features).map(([key, on]) => (
              <div key={key} className="flex items-center justify-between gap-4 py-2 border-b border-[#26262B]/40 last:border-0">
                <span className="text-[#9CA3AF] font-mono text-[12px] capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                {on ? <ToggleRight className="w-6 h-6 text-[#00D964]" /> : <ToggleLeft className="w-6 h-6 text-[#4B5563]" />}
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
