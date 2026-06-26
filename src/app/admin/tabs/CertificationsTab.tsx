// src/app/admin/tabs/CertificationsTab.tsx
// FULL REPLACEMENT — redesigned with ImageUploader, preview cards, consistent design system

"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2, ExternalLink, Award } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Cert = {
  id: number; title: string; issuer: string; date: string;
  description: string; imageUrl: string; link: string | null; sortOrder: number;
};
type CertDraft = Omit<Cert, "id">;

const BLANK: CertDraft = { title: "", issuer: "", date: "", description: "", imageUrl: "", link: "", sortOrder: 0 };

const inp = "w-full bg-[#0A0A0B] border border-[#26262B] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00D964] transition-colors placeholder-[#374151]";
const ta  = `${inp} resize-y min-h-[72px]`;

// ─── Date helpers ────────────────────────────────────────────────────────────
// Stored format: "May 2025 – Present"  |  "May 2025 – Dec 2026"  |  "May 2025"
// Input[type=month] format: "YYYY-MM"

function toMonthInput(part: string): string {
  // part = "May 2025" → "2025-05"
  if (!part || part === "Present") return "";
  const d = new Date(`${part} 1`);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function fromMonthInput(val: string): string {
  // val = "2025-05" → "May 2025"
  if (!val) return "";
  const [y, m] = val.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString("default", { month: "long", year: "numeric" });
}

function parseDateField(date: string): { start: string; end: string; present: boolean } {
  if (!date) return { start: "", end: "", present: true };
  const parts = date.split(" – ");
  const start = parts[0]?.trim() ?? "";
  const endRaw = parts[1]?.trim() ?? "Present";
  const present = endRaw === "Present";
  return { start, end: present ? "" : endRaw, present };
}

function buildDateField(start: string, end: string, present: boolean): string {
  if (!start) return "";
  return present ? `${start} – Present` : end ? `${start} – ${end}` : start;
}

// ─── Date Range Picker ───────────────────────────────────────────────────────
function DateRangePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { start, end, present } = parseDateField(value);

  const handleStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = fromMonthInput(e.target.value);
    onChange(buildDateField(newStart, end, present));
  };

  const handleEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = fromMonthInput(e.target.value);
    onChange(buildDateField(start, newEnd, false));
  };

  const handlePresent = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(buildDateField(start, end, e.target.checked));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Start date */}
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <label className="text-[10px] text-[#6B7280] font-mono uppercase tracking-widest">From</label>
          <input
            type="month"
            value={toMonthInput(start)}
            onChange={handleStart}
            className={inp}
            style={{ colorScheme: "dark" }}
          />
        </div>

        <span className="text-[#374151] font-mono text-xs mt-4">→</span>

        {/* End date */}
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <label className="text-[10px] text-[#6B7280] font-mono uppercase tracking-widest">To</label>
          <input
            type="month"
            value={present ? "" : toMonthInput(end)}
            onChange={handleEnd}
            disabled={present}
            className={inp}
            style={{
              colorScheme: "dark",
              opacity: present ? 0.4 : 1,
              cursor: present ? "not-allowed" : "auto",
            }}
          />
        </div>
      </div>

      {/* Present checkbox */}
      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={present}
          onChange={handlePresent}
          className="w-3.5 h-3.5 rounded accent-[#00D964]"
        />
        <span className="text-xs font-mono text-[#6B7280]">Currently active / Present</span>
      </label>

      {/* Preview of stored value */}
      {value && (
        <p className="text-[10px] font-mono text-[#374151]">
          Stored as: <span className="text-[#6B7280]">{value}</span>
        </p>
      )}
    </div>
  );
}

// ─── Cert Form ───────────────────────────────────────────────────────────────
function CertForm({ form, onChange, onSave, onCancel, saving }: {
  form: CertDraft; onChange: (f: CertDraft) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const f = <K extends keyof CertDraft>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [k]: e.target.value as CertDraft[K] });

  return (
    <div className="rounded-xl p-5 flex flex-col gap-4" style={{ backgroundColor: "#16161A", border: "1px solid #00D964", boxShadow: "0 0 0 1px rgba(0,217,100,0.1)" }}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Title *</label>
          <input className={inp} value={form.title} onChange={f("title")} placeholder="e.g. AWS Certified Solutions Architect" />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Issuer *</label>
          <input className={inp} value={form.issuer} onChange={f("issuer")} placeholder="e.g. Amazon Web Services" />
        </div>

        {/* ── Date Range Picker replaces plain text input ── */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Issue Date / Date Range</label>
          <DateRangePicker
            value={form.date}
            onChange={date => onChange({ ...form, date })}
          />
        </div>

        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Sort Order</label>
          <input className={inp} type="number" value={form.sortOrder} onChange={e => onChange({ ...form, sortOrder: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Credential Link</label>
          <input className={inp} value={form.link ?? ""} onChange={f("link")} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Description</label>
          <textarea className={ta} value={form.description} onChange={f("description")} placeholder="Brief description of what this certification covers" />
        </div>
        <div className="sm:col-span-2">
          <ImageUploader
            value={form.imageUrl}
            onChange={url => onChange({ ...form, imageUrl: url })}
            folder="certifications"
            label="Certificate / Badge Image"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={saving || !form.title || !form.issuer}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {saving ? "Saving…" : "Save Certification"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono transition-colors"
          style={{ borderColor: "#26262B", color: "#6B7280" }}
        >
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main Tab ────────────────────────────────────────────────────────────────
export function CertificationsTab() {
  const [items, setItems]           = useState<Cert[]>([]);
  const [loading, setLoading]       = useState(true);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [adding, setAdding]         = useState(false);
  const [form, setForm]             = useState<CertDraft>(BLANK);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/certifications");
    const j = await r.json();
    setItems(j.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (c: Cert) => {
    setAdding(false);
    setEditingId(c.id);
    setForm({ title: c.title, issuer: c.issuer, date: c.date, description: c.description, imageUrl: c.imageUrl, link: c.link, sortOrder: c.sortOrder });
  };
  const cancel = () => { setEditingId(null); setAdding(false); setForm(BLANK); };

  const save = async () => {
    setSaving(true);
    if (adding) {
      await fetch("/api/admin/certifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else if (editingId !== null) {
      await fetch(`/api/admin/certifications/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    cancel();
    await load();
    setSaving(false);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this certification?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/certifications/${id}`, { method: "DELETE" });
    await load();
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 animate-pulse" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#26262B]" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/3 rounded bg-[#26262B]" />
                <div className="h-2.5 w-1/4 rounded bg-[#1f1f24]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(0,217,100,0.1)" }}>
            <Award className="w-4 h-4 text-[#00D964]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{items.length} Certifications</p>
            <p className="text-[#6B7280] text-[11px] font-mono">Manage your professional certifications</p>
          </div>
        </div>
        {!adding && (
          <button
            onClick={() => { setEditingId(null); setAdding(true); setForm(BLANK); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold font-mono transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Certification
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && <CertForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />}

      {/* Empty state */}
      {items.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ backgroundColor: "#16161A", border: "1px dashed #26262B" }}>
          <Award className="w-8 h-8 text-[#374151] mb-3" />
          <p className="text-white text-sm font-mono font-bold mb-1">No certifications yet</p>
          <p className="text-[#6B7280] text-xs font-mono">Click "Add Certification" to get started</p>
        </div>
      )}

      {/* Certification cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(c =>
          editingId === c.id ? (
            <div key={c.id} className="sm:col-span-2">
              <CertForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />
            </div>
          ) : (
            <div
              key={c.id}
              className="rounded-xl p-4 flex items-start gap-3 transition-opacity"
              style={{
                backgroundColor: "#16161A",
                border: "1px solid #26262B",
                opacity: deletingId === c.id ? 0.5 : 1,
              }}
            >
              {/* Image / badge */}
              <div className="w-12 h-12 rounded-lg border border-[#26262B] flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#0A0A0B" }}>
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <Award className="w-5 h-5 text-[#374151]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white text-sm font-bold font-mono truncate">{c.title}</p>
                  {c.link && (
                    <a href={c.link} target="_blank" rel="noopener noreferrer"
                      className="text-[#6B7280] hover:text-[#00D964] transition-colors flex-shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-[#00D964] text-xs font-mono mt-0.5">{c.issuer}</p>
                <p className="text-[#6B7280] text-[11px] font-mono mt-0.5">{c.date}</p>
                {c.description && (
                  <p className="text-[#6B7280] text-[11px] font-mono mt-1.5 leading-relaxed line-clamp-2">{c.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => startEdit(c)}
                  className="p-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: "#26262B", color: "#6B7280" }}
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => remove(c.id)}
                  disabled={deletingId === c.id}
                  className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
