"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";
import {
  Eye, Mail, MessageSquare, Users,
  User, Zap, Briefcase, FolderOpen, Award, Link2,
  LogOut, RefreshCw, BarChart2,
} from "lucide-react";
import { OverviewTab }       from "./tabs/OverviewTab";
import { MessagesTab }       from "./tabs/MessagesTab";
import { CommentsTab }       from "./tabs/CommentsTab";
import { SubscribersTab }    from "./tabs/SubscribersTab";
import { ProfileTab }        from "./tabs/ProfileTab";
import { SkillsTab }         from "./tabs/SkillsTab";
import { ExperienceTab }     from "./tabs/ExperienceTab";
import { ProjectsTab }       from "./tabs/ProjectsTab";
import { CertificationsTab } from "./tabs/CertificationsTab";
import { SocialLinksTab }    from "./tabs/SocialLinksTab";
import { AnalyticsTab }      from "./tabs/AnalyticsTab";

const authClient = createAuthClient();

type Tab =
  | "overview" | "messages" | "comments" | "subscribers" | "analytics"
  | "profile"  | "skills"   | "experience" | "projects" | "certifications" | "social";

interface TabDef { id: Tab; label: string; icon: React.ReactNode; group: "engage" | "cms" }

const TABS: TabDef[] = [
  { id: "overview",       label: "Overview",       icon: <Eye className="w-4 h-4" />,          group: "engage" },
  { id: "analytics",     label: "Analytics",      icon: <BarChart2 className="w-4 h-4" />,    group: "engage" },
  { id: "messages",       label: "Messages",       icon: <Mail className="w-4 h-4" />,          group: "engage" },
  { id: "comments",       label: "Comments",       icon: <MessageSquare className="w-4 h-4" />, group: "engage" },
  { id: "subscribers",    label: "Subscribers",    icon: <Users className="w-4 h-4" />,         group: "engage" },
  { id: "profile",        label: "Profile",        icon: <User className="w-4 h-4" />,          group: "cms" },
  { id: "skills",         label: "Skills",         icon: <Zap className="w-4 h-4" />,           group: "cms" },
  { id: "experience",     label: "Experience",     icon: <Briefcase className="w-4 h-4" />,     group: "cms" },
  { id: "projects",       label: "Projects",       icon: <FolderOpen className="w-4 h-4" />,    group: "cms" },
  { id: "certifications", label: "Certifications", icon: <Award className="w-4 h-4" />,         group: "cms" },
  { id: "social",         label: "Social Links",   icon: <Link2 className="w-4 h-4" />,         group: "cms" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  const logout = async () => {
    await authClient.signOut();
    router.push("/admin/login");
  };

  const engageTabs = TABS.filter(t => t.group === "engage");
  const cmsTabs    = TABS.filter(t => t.group === "cms");

  const tabBtn = (t: TabDef) => (
    <button
      key={t.id}
      onClick={() => setTab(t.id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        tab === t.id
          ? "bg-cyan text-black"
          : "bg-black/30 border border-lightBrown text-lightGrey hover:border-cyan/40 hover:text-cyan"
      }`}
    >
      {t.icon} {t.label}
    </button>
  );

  return (
    <main className="min-h-screen bg-darkBrown px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white font-special">Admin Dashboard</h1>
            <p className="text-lightGrey text-sm mt-1 font-mono">MS Portfolio Control Center</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-lightBrown text-lightGrey hover:border-cyan hover:text-cyan transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Tab groups */}
        <div className="flex flex-col gap-3 mb-8">
          <div>
            <p className="text-[10px] font-mono text-lightGrey/40 uppercase tracking-widest mb-2">Engagement</p>
            <div className="flex flex-wrap gap-2">{engageTabs.map(tabBtn)}</div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-lightGrey/40 uppercase tracking-widest mb-2">Content Management</p>
            <div className="flex flex-wrap gap-2">{cmsTabs.map(tabBtn)}</div>
          </div>
        </div>

        {/* Tab content */}
        <div key={`${tab}-${refreshKey}`}>
          {tab === "overview"       && <OverviewTab />}
          {tab === "analytics"      && <AnalyticsTab />}
          {tab === "messages"       && <MessagesTab />}
          {tab === "comments"       && <CommentsTab />}
          {tab === "subscribers"    && <SubscribersTab />}
          {tab === "profile"        && <ProfileTab />}
          {tab === "skills"         && <SkillsTab />}
          {tab === "experience"     && <ExperienceTab />}
          {tab === "projects"       && <ProjectsTab />}
          {tab === "certifications" && <CertificationsTab />}
          {tab === "social"         && <SocialLinksTab />}
        </div>
      </div>
    </main>
  );
}
