"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Prefs = {
  targetRoles?: string;
  preferredLocations?: string;
  remotePreference?: string;
  employmentType?: string;
  minSalary?: number | null;
  keywords?: string;
};

function parseArr(v: string | undefined): string[] {
  try {
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
  }
}

export default function AccountDashboard({ userName }: { userName: string }) {
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    fetch("/api/account/preferences")
      .then((r) => r.json())
      .then(setPrefs)
      .catch(() => setPrefs({}));
  }, []);

  const roles = parseArr(prefs?.targetRoles);
  const locations = parseArr(prefs?.preferredLocations);
  const keywords = parseArr(prefs?.keywords);

  return (
    <div className="max-w-3xl">
      <h1 className="font-special text-2xl font-bold text-white mb-1">
        Welcome back, {userName.split(" ")[0]}
      </h1>
      <p className="text-lightGrey text-sm font-mono mb-8">Your Career Centre dashboard</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Target Roles" value={roles.length} />
        <StatCard label="Locations" value={locations.length} />
        <StatCard label="Keywords" value={keywords.length} />
      </div>

      <div className="glass rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-mono font-bold text-sm">Job Preferences</h2>
          <Link
            href="/account/settings"
            className="text-xs font-mono text-cyan hover:underline"
          >
            Edit →
          </Link>
        </div>

        {!prefs ? (
          <p className="text-lightGrey text-xs font-mono">Loading…</p>
        ) : roles.length === 0 ? (
          <p className="text-lightGrey text-xs font-mono">
            No preferences set yet.{" "}
            <Link href="/account/settings" className="text-cyan hover:underline">
              Set them up →
            </Link>
          </p>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <PrefRow label="Remote" value={prefs.remotePreference ?? "any"} />
            <PrefRow label="Min Salary" value={prefs.minSalary ? `$${prefs.minSalary.toLocaleString()}` : "—"} />
            <PrefRow label="Roles" value={roles.join(", ") || "—"} />
            <PrefRow label="Locations" value={locations.join(", ") || "—"} />
          </dl>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-xl border border-white/10 p-4">
      <p className="text-lightGrey text-xs font-mono mb-1">{label}</p>
      <p className="text-white font-special text-2xl font-bold">{value}</p>
    </div>
  );
}

function PrefRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-lightGrey">{label}</dt>
      <dd className="text-white mt-0.5">{value}</dd>
    </div>
  );
}
