"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import Image from "next/image";
import {
  LayoutDashboard, User, Briefcase, Zap, FolderOpen, Award,
  BookOpen, Tag, Users, Target, Shuffle, Mail, Bell,
  Settings, ShieldCheck, LogOut, Search, Plus, ChevronDown, Images,
} from "lucide-react";

import { DashboardHome }      from "./tabs/DashboardHome";
import { ProfileTab }         from "./tabs/ProfileTab";
import { SkillsTab }          from "./tabs/SkillsTab";
import { ExperienceTab }      from "./tabs/ExperienceTab";
import { ProjectsTab }        from "./tabs/ProjectsTab";
import { CertificationsTab }  from "./tabs/CertificationsTab";
import { SocialLinksTab }     from "./tabs/SocialLinksTab";
import { MessagesTab }        from "./tabs/MessagesTab";
import { AnalyticsTab }       from "./tabs/AnalyticsTab";
import { KTDocumentsTab }     from "./tabs/KTDocumentsTab";
import { KTCategoriesTab }    from "./tabs/KTCategoriesTab";
import { UsersTab }            from "./tabs/UsersTab";
import { JobMatchesTab }       from "./tabs/JobMatchesTab";
import { JobPreferencesTab }   from "./tabs/JobPreferencesTab";
import { SiteSettingsTab }     from "./tabs/SiteSettingsTab";
import { MediaLibraryTab }    from "./tabs/MediaLibraryTab";

const authClient = createAuthClient();

type Section =
  | "dashboard" | "profile" | "experience" | "skills" | "projects"
  | "certifications" | "social"
  | "kt-documents" | "kt-categories"
  | "users" | "job-preferences" | "job-matches"
  | "messages"
  | "analytics" | "site-settings" | "admin-account" | "media-library";

interface NavItem { id: Section; label: string; icon: React.ElementType }
interface NavGroup { label: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "CONTENT",
    items: [
      { id: "profile",        label: "Profile",        icon: User },
      { id: "experience",     label: "Experience",     icon: Briefcase },
      { id: "skills",         label: "Skills",         icon: Zap },
      { id: "projects",       label: "Projects",       icon: FolderOpen },
      { id: "certifications", label: "Certifications", icon: Award },
    ],
  },
  {
    label: "KT CENTRE",
    items: [
      { id: "kt-documents",  label: "Documents",  icon: BookOpen },
      { id: "kt-categories", label: "Categories", icon: Tag },
    ],
  },
  {
    label: "ACCOUNT CENTRE",
    items: [
      { id: "users",           label: "Users",           icon: Users },
      { id: "job-preferences", label: "Job Preferences", icon: Target },
      { id: "job-matches",     label: "Job Matches",     icon: Shuffle },
    ],
  },
  {
    label: "ENGAGEMENT",
    items: [
      { id: "messages", label: "Messages", icon: Mail },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { id: "analytics",     label: "Analytics",    icon: LayoutDashboard },
      { id: "media-library", label: "Media Library", icon: Images },
      { id: "social",       label: "Social Links",  icon: Shuffle },
      { id: "site-settings", label: "Site Settings", icon: Settings },
      { id: "admin-account", label: "Admin Account", icon: ShieldCheck },
    ],
  },
];

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-xl">🚧</div>
      <p className="text-[#e0e0e0] font-mono text-sm capitalize">{label.replace(/-/g, " ")}</p>
      <p className="text-[#555] font-mono text-xs">Coming soon</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [active, setActive]       = useState<Section>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch]       = useState("");
  const router = useRouter();

  const logout = async () => {
    await authClient.signOut();
    router.push("/admin/login");
  };

  const navigate = (s: string) => setActive(s as Section);

  const renderContent = () => {
    const key = `${active}-${refreshKey}`;
    switch (active) {
      case "dashboard":      return <DashboardHome key={key} onNavigate={navigate} />;
      case "profile":        return <ProfileTab key={key} />;
      case "experience":     return <ExperienceTab key={key} />;
      case "skills":         return <SkillsTab key={key} />;
      case "projects":       return <ProjectsTab key={key} />;
      case "certifications": return <CertificationsTab key={key} />;
      case "social":         return <SocialLinksTab key={key} />;
      case "messages":       return <MessagesTab key={key} />;
      case "analytics":      return <AnalyticsTab key={key} />;
      case "kt-documents":   return <KTDocumentsTab key={key} />;
      case "kt-categories":  return <KTCategoriesTab key={key} />;
      case "users":          return <UsersTab key={key} />;
      case "job-matches":    return <JobMatchesTab key={key} />;
      case "job-preferences":return <JobPreferencesTab key={key} />;
      case "site-settings":  return <SiteSettingsTab key={key} />
      case "media-library":  return <MediaLibraryTab key={key} />
      default:               return <ComingSoon label={active} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0d0d0d] overflow-hidden">

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="w-60 flex-shrink-0 flex flex-col h-full bg-[#111111] border-r border-[#1e1e1e] overflow-y-auto scrollbar-hide">

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#1e1e1e] flex-shrink-0">
          <Image src="/icons/Actual_Logo.ico" alt="MS" width={30} height={30} className="rounded-lg flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[#e0e0e0] font-bold text-[13px] leading-tight truncate">MS Portfolio</p>
            <p className="text-[#555] text-[10px] font-mono">CMS Admin</p>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-5">
          {NAV.map((group) => (
            <div key={group.label}>
              <p className="text-[#444] text-[9px] font-mono uppercase tracking-widest mb-2 px-2">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActive(item.id); setRefreshKey(k => k); }}
                      className={`flex items-center gap-2.5 w-full text-left px-2.5 py-2 rounded-lg text-[13px] font-mono transition-all duration-150 ${
                        isActive
                          ? "bg-[#00ff88]/8 text-[#00ff88] border-l-2 border-[#00ff88] pl-[9px]"
                          : "text-[#666] hover:text-[#bbb] hover:bg-[#ffffff05] border-l-2 border-transparent pl-[9px]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Version + logout */}
        <div className="px-4 py-3 border-t border-[#1e1e1e] flex items-center justify-between flex-shrink-0">
          <span className="text-[#333] text-[10px] font-mono">v2.4.1 · production</span>
          <button onClick={logout} title="Sign out"
            className="text-[#444] hover:text-red transition-colors p-1">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-13 flex items-center gap-3 px-5 border-b border-[#1e1e1e] bg-[#111111] flex-shrink-0" style={{ height: "52px" }}>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search content..."
              className="w-full max-w-xs bg-[#1a1a1a] border border-[#252525] rounded-lg pl-8 pr-4 py-1.5 text-[#e0e0e0] text-[12px] font-mono placeholder-[#3a3a3a] focus:outline-none focus:border-[#00ff88]/30 transition-colors"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="text-[#444] hover:text-[#888] transition-colors p-1.5 rounded-lg hover:bg-[#1a1a1a]"
            title="Refresh"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.5-4.5M20 15a9 9 0 01-14.5 4.5" />
            </svg>
          </button>

          {/* Bell */}
          <button className="relative p-1.5 text-[#555] hover:text-[#e0e0e0] transition-colors rounded-lg hover:bg-[#1a1a1a]">
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          </button>

          {/* Add */}
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00cc66] hover:bg-[#00ff88] text-black text-[12px] font-mono font-bold transition-colors">
            <Plus className="w-3 h-3" /> Add <ChevronDown className="w-2.5 h-2.5" />
          </button>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#00ff88] text-[10px] font-mono font-bold flex-shrink-0">
            MS
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0d0d0d]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
