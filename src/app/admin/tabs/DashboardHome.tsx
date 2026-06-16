"use client";
import { useEffect, useState } from "react";
import {
  FolderOpen, FileText, BookOpen, Mail, TrendingUp, TrendingDown,
  FolderPlus, Upload, MessageSquare, User, Eye,
  Edit3, Phone, UploadCloud, Archive, Award, Loader2,
} from "lucide-react";

interface DashboardData {
  projectCount: number;
  ktDocCount: number;
  unreadMessages: number;
  totalMessages: number;
  recentProjects: { id: number; name: string; year: string }[];
  recentKTDocs: { id: number; title: string; uploadedAt: string; category: string }[];
}

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, delta, deltaPositive, icon: Icon,
}: {
  label: string; value: number; delta: string; deltaPositive: boolean; icon: React.ElementType;
}) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#2a2a2a] relative overflow-hidden">
      <div className="absolute top-4 right-4 text-[#333]">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[#666] text-[12px] font-mono uppercase tracking-wider mb-3">{label}</p>
      <p className="text-[#e0e0e0] text-5xl font-bold font-mono leading-none mb-3">{value}</p>
      <div className={`flex items-center gap-1 text-[11px] font-mono ${deltaPositive ? "text-[#00cc66]" : "text-[#cc3300]"}`}>
        {deltaPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {delta}
      </div>
    </div>
  );
}

// ── Status Pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: "Published" | "Draft" | "Archived" }) {
  const styles = {
    Published: "bg-[#00cc66]/15 text-[#00cc66] border-[#00cc66]/30",
    Draft:     "bg-[#cc8800]/15 text-[#cc8800] border-[#cc8800]/30",
    Archived:  "bg-[#cc3300]/15 text-[#cc3300] border-[#cc3300]/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono ${styles[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function TypeTag({ type }: { type: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full border border-[#333] text-[#888] text-[10px] font-mono">
      {type}
    </span>
  );
}

// ── Profile Completeness ─────────────────────────────────────────────────────

const PROFILE_SECTIONS = [
  { label: "Experience",     pct: 95 },
  { label: "Skills",         pct: 88 },
  { label: "Projects",       pct: 79 },
  { label: "Certifications", pct: 67 },
];

function sectionColor(pct: number) {
  if (pct >= 90) return "#00cc66";
  if (pct >= 75) return "#cc8800";
  return "#cc3300";
}
function sectionIcon(pct: number) {
  if (pct >= 90) return "✅";
  if (pct >= 75) return "🕐";
  return "❌";
}

function ProfileCompleteness() {
  const overall = Math.round(PROFILE_SECTIONS.reduce((s, x) => s + x.pct, 0) / PROFILE_SECTIONS.length);
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-5 border border-[#2a2a2a]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[#e0e0e0] font-bold text-sm">Profile Completeness</p>
          <p className="text-[#666] text-[11px] font-mono mt-0.5">Fill remaining sections to improve visibility</p>
        </div>
        <p className="text-[#00ff88] text-2xl font-bold font-mono">{overall}%</p>
      </div>

      {/* Overall bar */}
      <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden mb-5 mt-4">
        <div
          className="h-full rounded-full bg-[#00ff88] transition-all duration-700"
          style={{ width: `${overall}%` }}
        />
      </div>

      {/* Per-section */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {PROFILE_SECTIONS.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]">{sectionIcon(s.pct)}</span>
                <span className="text-[#888] text-[12px] font-mono">{s.label}</span>
              </div>
              <span className="text-[12px] font-mono font-bold" style={{ color: sectionColor(s.pct) }}>
                {s.pct}%
              </span>
            </div>
            <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.pct}%`, backgroundColor: sectionColor(s.pct) }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Quick Actions ────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: FolderPlus,   label: "Add Project",     href: "#projects" },
  { icon: UploadCloud,  label: "Upload KT Doc",   href: "/kt-centre" },
  { icon: MessageSquare,label: "View Messages",   href: "#messages" },
  { icon: User,         label: "Edit Profile",    href: "#profile" },
  { icon: Eye,          label: "Preview Site",    href: "/", target: "_blank" },
];

function QuickActions({ onNavigate }: { onNavigate: (s: string) => void }) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <p className="text-[#e0e0e0] font-bold text-sm">Quick Actions</p>
      </div>
      <div className="divide-y divide-[#222]">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={() => {
                if (a.target) window.open(a.href, "_blank");
                else onNavigate(a.href.replace("#", ""));
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-[#888] hover:text-[#00ff88] hover:bg-[#ffffff04] transition-all text-left group"
            >
              <Icon className="w-4 h-4 flex-shrink-0 group-hover:text-[#00ff88] text-[#555]" />
              <span className="text-[13px] font-mono">{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Recent Activity ──────────────────────────────────────────────────────────

const ACTIVITIES = [
  { icon: Edit3,       desc: "Project 'K8s Autoscaler' updated",       time: "2h ago" },
  { icon: Phone,       desc: "New contact message received",            time: "4h ago" },
  { icon: UploadCloud, desc: "KT doc 'DB failover runbook' uploaded",   time: "Yesterday" },
  { icon: Archive,     desc: "Blog post 'Helm charts' archived",        time: "2d ago" },
  { icon: Award,       desc: "Certification 'CKA' marked complete",     time: "3d ago" },
  { icon: User,        desc: "Profile section 'Experience' edited",     time: "4d ago" },
];

function RecentActivity() {
  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <p className="text-[#e0e0e0] font-bold text-sm">Recent Activity</p>
      </div>
      <div className="divide-y divide-[#1e1e1e]">
        {ACTIVITIES.map((a, i) => {
          const Icon = a.icon;
          return (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <div className="w-6 h-6 rounded-md bg-[#222] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3 h-3 text-[#555]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#e0e0e0] text-[12px] font-mono leading-snug">{a.desc}</p>
                <p className="text-[#555] text-[10px] font-mono mt-0.5">{a.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export function DashboardHome({ onNavigate }: { onNavigate?: (s: string) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin?tab=dashboard")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-[#00ff88] animate-spin" />
      </div>
    );
  }

  // Build recent content list from projects + KT docs
  type ContentRow = { id: number; title: string; type: "Project" | "KT Doc"; status: "Published" | "Draft"; date: string };
  const recentContent: ContentRow[] = [
    ...(data?.recentProjects ?? []).map(p => ({
      id: p.id, title: p.name, type: "Project" as const, status: "Published" as const, date: p.year,
    })),
    ...(data?.recentKTDocs ?? []).map(d => ({
      id: d.id, title: d.title, type: "KT Doc" as const, status: "Published" as const,
      date: new Date(d.uploadedAt).toLocaleDateString("en-CA"),
    })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-[#e0e0e0] text-3xl font-bold">Dashboard</h1>
        <p className="text-[#00ff88] text-[12px] font-mono mt-1">{dateStr} · production</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Projects"   value={data?.projectCount ?? 0}   delta="+2 this month"      deltaPositive={true}  icon={FolderOpen} />
        <StatCard label="Published Posts"  value={2}                          delta="+1 this month"      deltaPositive={true}  icon={FileText}   />
        <StatCard label="KT Documents"     value={data?.ktDocCount ?? 0}      delta="-1 recently"        deltaPositive={false} icon={BookOpen}   />
        <StatCard label="Unread Messages"  value={data?.unreadMessages ?? 0}  delta={`+${data?.unreadMessages ?? 0} since yesterday`} deltaPositive={false} icon={Mail} />
      </div>

      {/* Middle row: content table + right panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
        {/* Recent Content */}
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a]">
            <p className="text-[#e0e0e0] font-bold text-sm">Recent Content</p>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#00ff88]/10 text-[#00ff88] text-[10px] font-mono border border-[#00ff88]/20">All</span>
              <button className="text-[#444] hover:text-[#888] transition-colors">
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {recentContent.length === 0 ? (
            <div className="px-5 py-10 text-center text-[#555] font-mono text-sm">No content yet</div>
          ) : (
            <div className="divide-y divide-[#1e1e1e]">
              {recentContent.map((row) => (
                <div key={`${row.type}-${row.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#ffffff03] transition-colors group">
                  <div className="w-7 h-7 rounded-md bg-[#222] flex items-center justify-center flex-shrink-0">
                    {row.type === "Project" ? (
                      <FolderOpen className="w-3.5 h-3.5 text-[#555]" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 text-[#555]" />
                    )}
                  </div>
                  <p className="flex-1 text-[#e0e0e0] text-[13px] font-mono truncate">
                    {row.title}
                  </p>
                  <TypeTag type={row.type} />
                  <StatusPill status={row.status} />
                  <span className="text-[#555] text-[11px] font-mono w-24 text-right flex-shrink-0">{row.date}</span>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-3 border-t border-[#222]">
            <button
              onClick={() => onNavigate?.("projects")}
              className="text-[#00ff88] text-[12px] font-mono hover:underline flex items-center gap-1"
            >
              View all content →
            </button>
          </div>
        </div>

        {/* Right: Quick Actions + Recent Activity */}
        <div className="flex flex-col gap-4">
          <QuickActions onNavigate={onNavigate ?? (() => {})} />
          <RecentActivity />
        </div>
      </div>

      {/* Profile Completeness */}
      <ProfileCompleteness />
    </div>
  );
}
