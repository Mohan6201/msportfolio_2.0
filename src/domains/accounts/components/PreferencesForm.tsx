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
  try { return v ? JSON.parse(v) : []; } catch { return []; }
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
        setForm((f) => ({ ...f, preferredLocations: f.preferredLocations || data.location }));
      }
    } finally { setImporting(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setSaved(false);
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
    } finally { setSaving(false); }
  }

  const inputCls = "w-full rounded-lg px-3 py-2.5 text-sm font-mono text-white placeholder-[#333] focus:outline-none transition-colors";
  const inputStyle = { backgroundColor: "#0A0A0B", border: "1px solid #26262B" };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-7">
        <nav className="flex items-center gap-1.5 text-[11px] font-mono mb-3" style={{ color: "#6B7280" }}>
          <span>Career Centre</span>
          <span className="opacity-40">/</span>
          <span className="text-white">Preferences</span>
        </nav>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white text-[28px] font-bold mb-1">Job Preferences</h1>
            <p className="text-sm font-mono" style={{ color: "#6B7280" }}>
              Used by the AI to surface relevant opportunities
            </p>
          </div>
          <button
            type="button"
            onClick={importFromProfile}
            disabled={importing}
            className="flex-shrink-0 text-xs font-mono rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
            style={{ color: "#00D964", border: "1px solid rgba(0,217,100,0.3)" }}
          >
            {importing ? "Importing…" : "Import from Profile"}
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-xl p-6 flex flex-col gap-5"
        style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
      >
        <Field label="Target Roles" hint="One per line">
          <textarea
            value={form.targetRoles}
            onChange={(e) => setForm((f) => ({ ...f, targetRoles: e.target.value }))}
            rows={4}
            className={`${inputCls} resize-none`}
            style={inputStyle}
            placeholder={"DevOps Engineer\nSRE\nPlatform Engineer"}
          />
        </Field>

        <Field label="Preferred Locations" hint="One per line">
          <textarea
            value={form.preferredLocations}
            onChange={(e) => setForm((f) => ({ ...f, preferredLocations: e.target.value }))}
            rows={3}
            className={`${inputCls} resize-none`}
            style={inputStyle}
            placeholder={"Remote\nLondon, UK\nBengaluru, India"}
          />
        </Field>

        <div>
          <label className="block text-[12px] text-white font-medium mb-2">Remote Preference</label>
          <div className="flex gap-2 flex-wrap">
            {REMOTE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm((f) => ({ ...f, remotePreference: opt }))}
                className="px-3 py-1 rounded-full text-xs font-mono transition-colors capitalize"
                style={
                  form.remotePreference === opt
                    ? { backgroundColor: "#00D964", color: "#0a0a0b", border: "1px solid #00D964" }
                    : { backgroundColor: "transparent", color: "#6B7280", border: "1px solid #26262B" }
                }
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] text-white font-medium mb-2">Employment Type</label>
          <div className="flex gap-2 flex-wrap">
            {EMP_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleEmp(opt)}
                className="px-3 py-1 rounded-full text-xs font-mono transition-colors"
                style={
                  form.employmentType.includes(opt)
                    ? { backgroundColor: "#00D964", color: "#0a0a0b", border: "1px solid #00D964" }
                    : { backgroundColor: "transparent", color: "#6B7280", border: "1px solid #26262B" }
                }
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
            className={inputCls}
            style={inputStyle}
            placeholder="e.g. 90000"
          />
        </Field>

        <Field label="Keywords" hint="One per line — tech stack, industries, company types">
          <textarea
            value={form.keywords}
            onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
            rows={4}
            className={`${inputCls} resize-none`}
            style={inputStyle}
            placeholder={"Kubernetes\nTerraform\nAWS\nStartup"}
          />
        </Field>

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="font-mono font-bold text-sm px-6 py-2.5 rounded-lg transition-all disabled:opacity-50"
            style={{ backgroundColor: "#00D964", color: "#0a0a0b" }}
          >
            {saving ? "Saving…" : "Save Preferences"}
          </button>
          {saved && (
            <span className="text-xs font-mono" style={{ color: "#00D964" }}>Saved ✓</span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <label className="block text-[12px] text-white font-medium">{label}</label>
        {hint && <span className="text-[10px] font-mono" style={{ color: "#444" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}
