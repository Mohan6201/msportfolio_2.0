"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Briefcase, TrendingUp, MessageSquare, Settings, ArrowRight } from "lucide-react";

type Prefs = {
  targetRoles?: string;
  preferredLocations?: string;
  remotePreference?: string;
  employmentType?: string;
  minSalary?: number | null;
  keywords?: string;
};

function parseArr(v: string | undefined): string[] {
  try { return v ? JSON.parse(v) : []; } catch { return []; }
}

const QUICK_LINKS = [
  { label: "Resume Studio",  href: "/account/resume",    icon: FileText,     desc: "Upload or update your resume" },
  { label: "Job Search",     href: "/account/jobs",      icon: Briefcase,    desc: "Browse AI-matched job listings" },
  { label: "Career Advisor", href: "/account/career",    icon: TrendingUp,   desc: "Generate your career roadmap" },
  { label: "Interview Lab",  href: "/account/interview", icon: MessageSquare, desc: "Practice with AI feedback" },
  { label: "Preferences",   href: "/account/settings",  icon: Settings,     desc: "Set target roles and locations" },
];

export default function AccountDashboard({ userName }: { userName: string }) {
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    fetch("/api/account/preferences")
      .then(r => r.json())
      .then(setPrefs)
      .catch(() => setPrefs({}));
  }, []);

  const roles     = parseArr(prefs?.targetRoles);
  const locations = parseArr(prefs?.preferredLocations);
  const keywords  = parseArr(prefs?.keywords);

  const firstName = userName.split(" ")[0];

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-7">
        <nav className="flex items-center gap-1.5 text-[11px] font-mono mb-3" style={{ color: "#6B7280" }}>
          <span>Career Centre</span>
          <span className="opacity-40">/</span>
          <span className="text-white">Dashboard</span>
        </nav>
        <h1 className="text-white text-[28px] font-bold mb-1">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm font-mono" style={{ color: "#6B7280" }}>
          Your Career Centre — everything in one place
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Target Roles", value: roles.length },
          { label: "Locations",    value: locations.length },
          { label: "Keywords",     value: keywords.length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
          >
            <p className="text-[11px] font-mono uppercase tracking-widest mb-2" style={{ color: "#6B7280" }}>{label}</p>
            <p className="text-white text-4xl font-bold font-mono leading-none">
              {prefs === null ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid #26262B" }}>
        <div className="px-5 py-3" style={{ backgroundColor: "#16161A", borderBottom: "1px solid #26262B" }}>
          <p className="text-white font-bold text-sm">Quick Access</p>
        </div>
        <div style={{ backgroundColor: "#0d0d10" }}>
          {QUICK_LINKS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-5 py-3.5 group transition-colors"
                style={{
                  borderBottom: i < QUICK_LINKS.length - 1 ? "1px solid #1e1e24" : "none",
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-[#00D964]/15"
                  style={{ backgroundColor: "#16161A" }}
                >
                  <Icon className="w-4 h-4 transition-colors" style={{ color: "#555" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[13px] font-mono">{item.label}</p>
                  <p className="text-[11px] font-mono" style={{ color: "#6B7280" }}>{item.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#00D964" }} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Preferences summary */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #26262B" }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ backgroundColor: "#16161A", borderBottom: "1px solid #26262B" }}>
          <p className="text-white font-bold text-sm">Job Preferences</p>
          <Link href="/account/settings" className="text-[12px] font-mono font-semibold" style={{ color: "#00D964" }}>
            Edit →
          </Link>
        </div>
        <div className="px-5 py-4" style={{ backgroundColor: "#0d0d10" }}>
          {prefs === null ? (
            <p className="text-[12px] font-mono" style={{ color: "#6B7280" }}>Loading…</p>
          ) : roles.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-[13px] font-mono mb-2" style={{ color: "#6B7280" }}>
                No preferences set yet.
              </p>
              <Link href="/account/settings" className="text-[12px] font-mono font-semibold" style={{ color: "#00D964" }}>
                Set up your preferences →
              </Link>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
              {[
                { label: "Remote",   value: prefs.remotePreference ?? "any" },
                { label: "Salary",   value: prefs.minSalary ? `$${prefs.minSalary.toLocaleString()}+` : "—" },
                { label: "Roles",    value: roles.join(", ") || "—" },
                { label: "Locations", value: locations.join(", ") || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-[10px] font-mono uppercase tracking-widest mb-0.5" style={{ color: "#6B7280" }}>{label}</dt>
                  <dd className="text-white text-[13px] font-mono">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
