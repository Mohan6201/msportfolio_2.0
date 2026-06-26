"use client";
import { useEffect, useState } from "react";
import { Save, Loader2, User } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Profile = {
  fullName: string; title: string; bio: string; location: string;
  email: string; phone: string; currentCompany: string; currentDesignation: string;
  careerStartDate: string; resumeUrl: string | null; githubUrl: string | null;
  linkedinUrl: string | null; avatarUrl: string | null;
};

const inp = "w-full bg-[#0A0A0B] border border-[#26262B] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00D964] transition-colors placeholder-[#374151]";
const ta  = `${inp} resize-y min-h-[100px]`;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">{children}</label>;
}

export function ProfileTab() {
  const [form, setForm]       = useState<Partial<Profile>>({});
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    fetch("/api/admin/profile").then(r => r.json()).then(j => {
      if (!j.data) { setNoProfile(true); setLoading(false); return; }
      setForm(j.data);
      setLoading(false);
    });
  }, []);

  const set = (key: keyof Profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    await fetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 text-[#00D964] animate-spin" />
      </div>
    );
  }

  if (noProfile) {
    return (
      <div className="text-[#6B7280] font-mono text-sm py-10 text-center">
        No profile found. Run <code className="text-[#00D964]">npm run db:seed</code>
      </div>
    );
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(0,217,100,0.1)" }}>
          <User className="w-4 h-4 text-[#00D964]" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">Profile</p>
          <p className="text-[#6B7280] text-[11px] font-mono">Your public identity on the portfolio</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="rounded-xl p-5" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
        <p className="text-white font-bold text-xs mb-4">Avatar &amp; Identity</p>
        <ImageUploader
          value={form.avatarUrl ?? ""}
          onChange={url => setForm(f => ({ ...f, avatarUrl: url }))}
          folder="profile"
          label="Profile Photo / Avatar"
        />
      </div>

      {/* Basic info */}
      <div className="rounded-xl p-5 grid sm:grid-cols-2 gap-4" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
        <p className="text-white font-bold text-xs sm:col-span-2 mb-1">Basic Information</p>
        <div>
          <FieldLabel>Full Name</FieldLabel>
          <input className={inp} value={form.fullName ?? ""} onChange={set("fullName")} placeholder="Mohana Srinivasan" />
        </div>
        <div>
          <FieldLabel>Title / Role</FieldLabel>
          <input className={inp} value={form.title ?? ""} onChange={set("title")} placeholder="DevOps Engineer" />
        </div>
        <div>
          <FieldLabel>Current Company</FieldLabel>
          <input className={inp} value={form.currentCompany ?? ""} onChange={set("currentCompany")} />
        </div>
        <div>
          <FieldLabel>Current Designation</FieldLabel>
          <input className={inp} value={form.currentDesignation ?? ""} onChange={set("currentDesignation")} />
        </div>
        <div>
          <FieldLabel>Location</FieldLabel>
          <input className={inp} value={form.location ?? ""} onChange={set("location")} placeholder="Chennai, India" />
        </div>
        <div>
          <FieldLabel>Career Start Date</FieldLabel>
          <input className={inp} type="date" value={form.careerStartDate ?? ""} onChange={set("careerStartDate")} />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>Bio</FieldLabel>
          <textarea className={ta} value={form.bio ?? ""} onChange={set("bio")} placeholder="Brief professional summary..." />
        </div>
      </div>

      {/* Contact */}
      <div className="rounded-xl p-5 grid sm:grid-cols-2 gap-4" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
        <p className="text-white font-bold text-xs sm:col-span-2 mb-1">Contact &amp; Links</p>
        <div>
          <FieldLabel>Email</FieldLabel>
          <input className={inp} type="email" value={form.email ?? ""} onChange={set("email")} />
        </div>
        <div>
          <FieldLabel>Phone</FieldLabel>
          <input className={inp} value={form.phone ?? ""} onChange={set("phone")} />
        </div>
        <div>
          <FieldLabel>GitHub URL</FieldLabel>
          <input className={inp} value={form.githubUrl ?? ""} onChange={set("githubUrl")} placeholder="https://github.com/..." />
        </div>
        <div>
          <FieldLabel>LinkedIn URL</FieldLabel>
          <input className={inp} value={form.linkedinUrl ?? ""} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/in/..." />
        </div>
      </div>

      {/* Resume */}
      <div className="rounded-xl p-5" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
        <p className="text-white font-bold text-xs mb-4">Resume</p>
        <ImageUploader
          value={form.resumeUrl ?? ""}
          onChange={url => setForm(f => ({ ...f, resumeUrl: url }))}
          folder="resume"
          label="Resume PDF / File URL"
        />
        <p className="text-[#374151] text-[10px] font-mono mt-2">Upload a PDF or paste a direct link (Google Drive, Dropbox etc)</p>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-mono font-bold transition-all disabled:opacity-50 self-start"
        style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saved ? "Saved ✓" : saving ? "Saving…" : "Save Profile"}
      </button>
    </div>
  );
}
