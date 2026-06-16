"use client";
import { useEffect, useState } from "react";

type FormState = {
  targetRoles: string;
  preferredLocations: string;
  remotePreference: string;
  employmentType: string[];
  minSalary: string;
  keywords: string;
};

const REMOTE_OPTIONS = ["any", "remote", "hybrid", "onsite"] as const;
const EMP_OPTIONS = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

function parseArr(v: string | undefined): string[] {
  try {
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
  }
}

export default function PreferencesForm() {
  const [form, setForm] = useState<FormState>({
    targetRoles: "",
    preferredLocations: "",
    remotePreference: "any",
    employmentType: [],
    minSalary: "",
    keywords: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetch("/api/account/preferences")
      .then((r) => r.json())
      .then((data) => {
        if (!data || !data.userId) return;
        setForm({
          targetRoles: parseArr(data.targetRoles).join("\n"),
          preferredLocations: parseArr(data.preferredLocations).join("\n"),
          remotePreference: data.remotePreference ?? "any",
          employmentType: parseArr(data.employmentType),
          minSalary: data.minSalary ? String(data.minSalary) : "",
          keywords: parseArr(data.keywords).join("\n"),
        });
      })
      .catch(() => {});
  }, []);

  function toArr(v: string): string[] {
    return v.split("\n").map((s) => s.trim()).filter(Boolean);
  }

  function toggleEmp(opt: string) {
    setForm((f) => ({
      ...f,
      employmentType: f.employmentType.includes(opt)
        ? f.employmentType.filter((x) => x !== opt)
        : [...f.employmentType, opt],
    }));
  }

  async function importFromProfile() {
    setImporting(true);
    try {
      const r = await fetch("/api/account/profile-import");
      if (!r.ok) return;
      const data = await r.json();
      if (data.location) {
        setForm((f) => ({
          ...f,
          preferredLocations: f.preferredLocations || data.location,
        }));
      }
    } finally {
      setImporting(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/account/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRoles: JSON.stringify(toArr(form.targetRoles)),
          preferredLocations: JSON.stringify(toArr(form.preferredLocations)),
          remotePreference: form.remotePreference,
          employmentType: JSON.stringify(form.employmentType),
          minSalary: form.minSalary ? parseInt(form.minSalary, 10) : null,
          keywords: JSON.stringify(toArr(form.keywords)),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-special text-2xl font-bold text-white mb-1">Job Preferences</h1>
          <p className="text-lightGrey text-sm font-mono">Used by the AI to surface relevant opportunities</p>
        </div>
        <button
          type="button"
          onClick={importFromProfile}
          disabled={importing}
          className="text-xs font-mono text-cyan border border-cyan/30 rounded-lg px-3 py-1.5 hover:bg-cyan/10 transition-colors disabled:opacity-50"
        >
          {importing ? "Importing…" : "Import from Profile"}
        </button>
      </div>

      <form onSubmit={handleSave} className="glass rounded-xl border border-white/10 p-6 flex flex-col gap-5">
        <Field label="Target Roles" hint="One per line">
          <textarea
            value={form.targetRoles}
            onChange={(e) => setForm((f) => ({ ...f, targetRoles: e.target.value }))}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan/50 resize-none"
            placeholder={"DevOps Engineer\nSRE\nPlatform Engineer"}
          />
        </Field>

        <Field label="Preferred Locations" hint="One per line">
          <textarea
            value={form.preferredLocations}
            onChange={(e) => setForm((f) => ({ ...f, preferredLocations: e.target.value }))}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan/50 resize-none"
            placeholder={"Remote\nLondon, UK\nBengaluru, India"}
          />
        </Field>

        <div>
          <label className="field-label">Remote Preference</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {REMOTE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm((f) => ({ ...f, remotePreference: opt }))}
                className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${
                  form.remotePreference === opt
                    ? "bg-cyan text-black border-cyan"
                    : "border-white/20 text-lightGrey hover:border-white/40"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Employment Type</label>
          <div className="flex gap-2 flex-wrap mt-1">
            {EMP_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleEmp(opt)}
                className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${
                  form.employmentType.includes(opt)
                    ? "bg-cyan text-black border-cyan"
                    : "border-white/20 text-lightGrey hover:border-white/40"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <Field label="Minimum Salary (USD / year)">
          <input
            type="number"
            value={form.minSalary}
            onChange={(e) => setForm((f) => ({ ...f, minSalary: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan/50"
            placeholder="e.g. 90000"
          />
        </Field>

        <Field label="Keywords" hint="One per line — tech stack, industries, company types">
          <textarea
            value={form.keywords}
            onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-cyan/50 resize-none"
            placeholder={"Kubernetes\nTerraform\nAWS\nStartup"}
          />
        </Field>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-cyan text-black font-mono font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-lightCyan transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Preferences"}
          </button>
          {saved && <span className="text-green-400 text-xs font-mono">Saved!</span>}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <label className="field-label">{label}</label>
        {hint && <span className="text-xs font-mono text-lightGrey/60">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
