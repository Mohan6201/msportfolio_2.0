"use client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

const NAV = [
  { label: "Dashboard", href: "/account" },
  { label: "Resume Studio", href: "/account/resume" },
  { label: "Jobs", href: "/account/jobs" },
  { label: "Career Advisor", href: "/account/career" },
  { label: "Interview Lab", href: "/account/interview" },
  { label: "Job Preferences", href: "/account/settings" },
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

  async function handleLogout() {
    await authClient.signOut();
    router.push("/account/login");
  }

  return (
    <div className="min-h-screen bg-darkBrown flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-56 bg-white/3 border-b md:border-b-0 md:border-r border-white/10 flex flex-col p-4 gap-2">
        <div className="mb-4">
          <p className="text-xs font-mono text-lightGrey">Signed in as</p>
          <p className="text-sm font-mono text-white truncate">{userName}</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-mono transition-colors ${
                pathname === item.href
                  ? "bg-cyan/20 text-cyan"
                  : "text-lightGrey hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="px-3 py-2 rounded-lg text-sm font-mono text-lightGrey hover:text-white hover:bg-white/5 text-left transition-colors"
        >
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
