"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, Trash2, ChevronDown, ShieldCheck, BadgeCheck, Users as UsersIcon } from "lucide-react";

type Role = "owner" | "admin" | "user" | "recruiter";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean | number;
  role: Role;
  image: string | null;
  createdAt: string | number;
};

const ASSIGNABLE: Role[] = ["admin", "user", "recruiter"];

const ROLE_STYLES: Record<Role, string> = {
  owner:     "bg-purple-500/15 text-purple-300 border-purple-500/30",
  admin:     "bg-blue-500/15 text-blue-300 border-blue-500/30",
  user:      "bg-[#26262B] text-[#9CA3AF] border-[#33333A]",
  recruiter: "bg-orange-500/15 text-orange-300 border-orange-500/30",
};

function fmtDate(v: string | number) {
  const d = new Date(typeof v === "number" ? v : v);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function UsersTab() {
  const [data, setData]       = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState("");
  const [busy, setBusy]       = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/users");
    const j = await r.json();
    setData(j.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Close role dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuFor(null);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const changeRole = async (id: string, role: Role) => {
    setBusy(id);
    setMenuFor(null);
    const r = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (r.ok) setData(d => d.map(u => (u.id === id ? { ...u, role } : u)));
    setBusy(null);
  };

  const remove = async (u: AdminUser) => {
    if (!confirm(`Delete user "${u.name || u.email}"? This permanently removes their account and data.`)) return;
    setBusy(u.id);
    const r = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    if (r.ok) setData(d => d.filter(x => x.id !== u.id));
    else {
      const j = await r.json().catch(() => ({}));
      alert(j.error ?? "Failed to delete user");
    }
    setBusy(null);
  };

  const filtered = data.filter(u => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (u.name ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q) || u.role.includes(q);
  });

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-7 h-7 text-[#00D964] animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#16161A] border border-[#26262B] flex items-center justify-center">
            <UsersIcon className="w-4 h-4 text-[#00D964]" />
          </div>
          <div>
            <h2 className="text-[#E5E7EB] font-mono text-sm font-semibold">Users</h2>
            <p className="text-[#6B7280] font-mono text-[11px]">{filtered.length} of {data.length} accounts</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280]" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name, email, role..."
            className="bg-[#16161A] border border-[#26262B] rounded-lg pl-8 pr-3 py-2 text-[#E5E7EB] text-[12px] font-mono w-64 placeholder-[#4B5563] focus:outline-none focus:border-[#00D964]/40 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#16161A] border border-[#26262B] rounded-2xl overflow-visible">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-[#26262B]">
              {["User", "Email", "Role", "Joined", "Verified", ""].map((h, i) => (
                <th key={i} className="text-left px-5 py-3 text-[#6B7280] text-[10px] uppercase tracking-widest font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-[#6B7280] text-center text-[12px]">No users found.</td></tr>
            )}
            {filtered.map(u => {
              const editable = u.role !== "owner";
              return (
                <tr key={u.id} className="border-b border-[#26262B]/50 hover:bg-white/[0.015] transition-colors">
                  {/* Avatar + name */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0d0d0d] border border-[#26262B] flex items-center justify-center text-[#00D964] text-[11px] font-bold flex-shrink-0">
                        {(u.name?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}
                      </div>
                      <span className="text-[#E5E7EB] truncate max-w-[160px]">{u.name || "—"}</span>
                    </div>
                  </td>
                  {/* Email */}
                  <td className="px-5 py-3 text-[#9CA3AF] truncate max-w-[220px]">{u.email}</td>
                  {/* Role badge / dropdown */}
                  <td className="px-5 py-3">
                    <div className="relative inline-block" ref={menuFor === u.id ? menuRef : undefined}>
                      <button
                        disabled={!editable || busy === u.id}
                        onClick={() => setMenuFor(m => (m === u.id ? null : u.id))}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border capitalize transition-opacity ${ROLE_STYLES[u.role]} ${editable ? "cursor-pointer hover:opacity-80" : "cursor-default opacity-90"}`}
                        title={editable ? "Change role" : "Owner role cannot be changed"}
                      >
                        {u.role === "owner" && <ShieldCheck className="w-3 h-3" />}
                        {u.role}
                        {editable && <ChevronDown className="w-3 h-3" />}
                      </button>
                      {menuFor === u.id && editable && (
                        <div className="absolute z-20 mt-1 left-0 w-36 bg-[#0d0d0d] border border-[#26262B] rounded-lg shadow-xl py-1">
                          {ASSIGNABLE.map(role => (
                            <button
                              key={role}
                              onClick={() => changeRole(u.id, role)}
                              className={`w-full text-left px-3 py-1.5 text-[11px] capitalize transition-colors hover:bg-white/[0.04] ${role === u.role ? "text-[#00D964]" : "text-[#9CA3AF]"}`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  {/* Joined */}
                  <td className="px-5 py-3 text-[#6B7280] text-[12px]">{fmtDate(u.createdAt)}</td>
                  {/* Verified */}
                  <td className="px-5 py-3">
                    {u.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[#00D964] text-[11px]"><BadgeCheck className="w-3.5 h-3.5" /> Verified</span>
                    ) : (
                      <span className="text-[#6B7280] text-[11px]">Unverified</span>
                    )}
                  </td>
                  {/* Delete */}
                  <td className="px-5 py-3 text-right">
                    <button
                      disabled={!editable || busy === u.id}
                      onClick={() => remove(u)}
                      className="p-1.5 rounded-lg border border-red-500/25 text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title={editable ? "Delete user" : "Owner cannot be deleted"}
                    >
                      {busy === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
