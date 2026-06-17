"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAuthClient } from "better-auth/react";
import {
  LayoutDashboard, FileText, Briefcase, TrendingUp,
  MessageSquare, Settings, LogOut, ChevronRight, Menu, X,
} from "lucide-react";

const authClient = createAuthClient();

const NAV = [
  { label: "Dashboard",      href: "/account",           icon: LayoutDashboard },
  { label: "Resume Studio",  href: "/account/resume",    icon: FileText },
  { label: "Jobs",           href: "/account/jobs",      icon: Briefcase },
  { label: "Career Advisor", href: "/account/career",    icon: TrendingUp },
  { label: "Interview Lab",  href: "/account/interview", icon: MessageSquare },
  { label: "Preferences",   href: "/account/settings",  icon: Settings },
];

export default function AccountLayout({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    await authClient.signOut();
    router.push("/account/login");
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  /* Shared sidebar content — reused by the desktop rail and the mobile drawer */
  const SidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: "1px solid #26262B" }}>
        <Image src="/icons/Actual_Logo.ico" alt="MS" width={30} height={30} className="rounded-lg flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-white font-bold text-[13px] leading-tight truncate">MS Portfolio</p>
          <p className="text-[10px] font-mono" style={{ color: "#6B7280" }}>Career Centre</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="text-[9px] font-mono uppercase tracking-widest px-2 mb-2" style={{ color: "#444" }}>
          Navigation
        </p>
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== "/account" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] font-mono transition-all duration-150"
              style={{
                backgroundColor: isActive ? "rgba(0,217,100,0.08)" : "transparent",
                color: isActive ? "#00D964" : "#666",
                borderLeft: isActive ? "2px solid #00D964" : "2px solid transparent",
                paddingLeft: "9px",
              }}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-3 flex flex-col gap-1" style={{ borderTop: "1px solid #26262B" }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-mono font-bold flex-shrink-0"
            style={{ backgroundColor: "rgba(0,217,100,0.15)", color: "#00D964", border: "1px solid rgba(0,217,100,0.25)" }}
          >
            {initials}
          </div>
          <p className="text-[12px] font-mono truncate flex-1" style={{ color: "#9CA3AF" }}>
            {userName.split(" ")[0]}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-[12px] font-mono transition-colors text-left"
          style={{ color: "#555" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
          onMouseLeave={e => (e.currentTarget.style.color = "#555")}
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          Sign Out
        </button>
        <div className="px-2 pt-1">
          <Link href="/" className="flex items-center gap-1.5 text-[10px] font-mono transition-colors" style={{ color: "#333" }}>
            <ChevronRight className="w-3 h-3 rotate-180" /> Back to portfolio
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#0A0A0B" }}>

      {/* ── Desktop sidebar (lg+) ──────────────────────────────────────── */}
      <aside
        className="hidden lg:flex w-60 flex-shrink-0 flex-col h-full overflow-y-auto"
        style={{ backgroundColor: "#111113", borderRight: "1px solid #26262B" }}
      >
        {SidebarContent}
      </aside>

      {/* ── Mobile drawer overlay ──────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer panel ────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] flex flex-col overflow-y-auto transition-transform duration-300 lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#111113", borderRight: "1px solid #26262B" }}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
          className="absolute top-4 right-3 z-10 p-1.5 rounded-lg"
          style={{ color: "#9CA3AF" }}
        >
          <X className="w-5 h-5" />
        </button>
        {SidebarContent}
      </aside>

      {/* ── Main column ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile top bar */}
        <header
          className="flex lg:hidden items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ backgroundColor: "#111113", borderBottom: "1px solid #26262B" }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="p-1.5 rounded-lg"
            style={{ color: "#9CA3AF", border: "1px solid #26262B" }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <Image src="/icons/Actual_Logo.ico" alt="MS" width={24} height={24} className="rounded-md flex-shrink-0" />
            <p className="text-white font-bold text-[13px] truncate">MS Portfolio</p>
          </div>
        </header>

        {/* ── Main ─────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8" style={{ backgroundColor: "#0A0A0B" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
