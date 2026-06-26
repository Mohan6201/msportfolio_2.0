"use client";
import { useEffect, useState } from "react";
import { Loader2, Server, ToggleRight, ToggleLeft, Plug, Lock, CheckCircle2, MinusCircle } from "lucide-react";

type SiteSettings = {
  environment: {
    nodeEnv: string;
    nodeVersion: string;
    vercelEnv: string;
    deploymentUrl: string;
    region: string | null;
  };
  models: { chat: string; extract: string; embedding: string };
  features: {
    googleOAuth: boolean;
    ktCentre: boolean;
    jobBoard: boolean;
    aiResume: boolean;
    interview: boolean;
  };
  connectedServices: Record<string, boolean>;
};

function Card({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#16161A] border border-[#26262B] rounded-2xl p-5">
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

function FeatureToggle({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[#26262B]/40 last:border-0">
      <span className="text-[#9CA3AF] font-mono text-[12px]">{label}</span>
      {on ? (
        <ToggleRight className="w-6 h-6 text-[#00D964]" />
      ) : (
        <ToggleLeft className="w-6 h-6 text-[#4B5563]" />
      )}
    </div>
  );
}

function ServiceRow({ name, set }: { name: string; set: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[#26262B]/40 last:border-0">
      <span className="text-[#9CA3AF] font-mono text-[11px]">{name}</span>
      {set ? (
        <span className="inline-flex items-center gap-1 text-[#00D964] font-mono text-[11px]"><CheckCircle2 className="w-3.5 h-3.5" /> configured</span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[#6B7280] font-mono text-[11px]"><MinusCircle className="w-3.5 h-3.5" /> not set</span>
      )}
    </div>
  );
}

export function SiteSettingsTab() {
  const [data, setData]       = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/site-settings").then(r => r.json()).then(j => { setData(j); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 text-[#00D964] animate-spin" /></div>;
  if (!data) return <div className="text-[#6B7280] font-mono text-sm py-10 text-center">Failed to load settings.</div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#16161A] border border-[#26262B] flex items-center justify-center">
            <Settings className="w-4 h-4 text-[#00D964]" />
          </div>
          <div>
            <h2 className="text-[#E5E7EB] font-mono text-sm font-semibold">Site Settings</h2>
            <p className="text-[#6B7280] font-mono text-[11px]">System configuration overview</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16161A] border border-[#26262B] text-[#6B7280] font-mono text-[11px]">
          <Lock className="w-3.5 h-3.5" /> Read-only
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Environment */}
        <Card icon={Server} title="Environment">
          <Row label="Deployment URL" value={<a href={data.environment.deploymentUrl} target="_blank" rel="noreferrer" className="text-[#00D964] hover:underline">{data.environment.deploymentUrl.replace(/^https?:\/\//, "")}</a>} />
          <Row label="Vercel Env" value={<span className="capitalize">{data.environment.vercelEnv}</span>} />
          <Row label="Node Env" value={data.environment.nodeEnv} />
          <Row label="Node.js" value={data.environment.nodeVersion} />
          {data.environment.region && <Row label="Region" value={data.environment.region} />}
          <Row label="Chat Model" value={data.models.chat} />
          <Row label="Extract Model" value={data.models.extract} />
          <Row label="Embedding Model" value={data.models.embedding} />
        </Card>

        {/* Features */}
        <Card icon={ToggleRight} title="Features">
          <FeatureToggle label="Google OAuth" on={data.features.googleOAuth} />
          <FeatureToggle label="KT Centre" on={data.features.ktCentre} />
          <FeatureToggle label="Job Board" on={data.features.jobBoard} />
          <FeatureToggle label="AI Resume" on={data.features.aiResume} />
          <FeatureToggle label="Interview" on={data.features.interview} />
          <p className="text-[#4B5563] font-mono text-[10px] mt-3">Toggles reflect current configuration. This view is read-only.</p>
        </Card>

        {/* Connected Services */}
        <Card icon={Plug} title="Connected Services">
          {Object.entries(data.connectedServices).map(([name, set]) => (
            <ServiceRow key={name} name={name} set={set} />
          ))}
          <p className="text-[#4B5563] font-mono text-[10px] mt-3">Shows whether each secret is set — values are never exposed.</p>
        </Card>
      </div>
    </div>
  );
}
