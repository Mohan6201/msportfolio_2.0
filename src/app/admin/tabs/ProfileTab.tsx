"use client";
import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";

type Profile = {
  fullName: string; title: string; bio: string; location: string;
  email: string; phone: string; currentCompany: string; currentDesignation: string;
  careerStartDate: string; resumeUrl: string | null; githubUrl: string | null;
  linkedinUrl: string | null; avatarUrl: string | null;
};

const field = (label: string, el: React.ReactNode) => (
  <div key={label}>
    <label className="block text-xs font-mono text-lightGrey mb-1">{label}</label>
    {el}
  </div>
);

const inp = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan/50";

export function ProfileTab() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/profile").then(r => r.json()).then(j => {
      setProfile(j.data);
      setForm(j.data ?? {});
      setLoading(false);
    });
  }, []);

  const set = (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan animate-spin" /></div>;
  if (!profile) return <p className="text-lightGrey text-sm">No profile found. Run <code className="text-cyan">npm run db:seed</code></p>;

  return (
    <div className="max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {field("Full Name",            <input className={inp} value={form.fullName ?? ""} onChange={set("fullName")} />)}
        {field("Title",                <input className={inp} value={form.title ?? ""} onChange={set("title")} />)}
        {field("Current Company",      <input className={inp} value={form.currentCompany ?? ""} onChange={set("currentCompany")} />)}
        {field("Current Designation",  <input className={inp} value={form.currentDesignation ?? ""} onChange={set("currentDesignation")} />)}
        {field("Email",                <input className={inp} type="email" value={form.email ?? ""} onChange={set("email")} />)}
        {field("Phone",                <input className={inp} value={form.phone ?? ""} onChange={set("phone")} />)}
        {field("Location",             <input className={inp} value={form.location ?? ""} onChange={set("location")} />)}
        {field("Career Start Date",    <input className={inp} type="date" value={form.careerStartDate ?? ""} onChange={set("careerStartDate")} />)}
        {field("GitHub URL",           <input className={inp} value={form.githubUrl ?? ""} onChange={set("githubUrl")} />)}
        {field("LinkedIn URL",         <input className={inp} value={form.linkedinUrl ?? ""} onChange={set("linkedinUrl")} />)}
        {field("Resume URL",           <input className={inp} value={form.resumeUrl ?? ""} onChange={set("resumeUrl")} />)}
        {field("Avatar URL",           <input className={inp} value={form.avatarUrl ?? ""} onChange={set("avatarUrl")} />)}
      </div>
      {field("Bio", <textarea className={`${inp} min-h-[100px] resize-y`} value={form.bio ?? ""} onChange={set("bio")} />)}

      <button onClick={save} disabled={saving}
        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan text-black font-mono font-bold text-sm hover:bg-lightCyan transition-colors disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? "Saved!" : saving ? "Saving…" : "Save Profile"}
      </button>
    </div>
  );
}
