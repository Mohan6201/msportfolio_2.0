// src/app/admin/tabs/CertificationsTab.tsx
"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2, ExternalLink, Award, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Cert = {
  id: number; title: string; issuer: string; date: string;
  description: string; imageUrl: string; link: string | null; sortOrder: number;
};
type CertDraft = Omit<Cert, "id">;
type MonthYear = { year: number; month: number };

const BLANK: CertDraft = { title: "", issuer: "", date: "", description: "", imageUrl: "", link: "", sortOrder: 0 };
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL  = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const inp = "w-full bg-[#0A0A0B] border border-[#26262B] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00D964] transition-colors placeholder-[#374151]";
const ta  = `${inp} resize-y min-h-[72px]`;

function fmtDisplay(my: MonthYear): string { return `${MONTHS_SHORT[my.month]} ${my.year}`; }
function fmtStored(my: MonthYear): string  { return `${MONTHS_FULL[my.month]} ${my.year}`; }

function parseStored(str: string): MonthYear | null {
  if (!str || str === "Present") return null;
  const d = new Date(`${str} 1`);
  if (isNaN(d.getTime())) return null;
  return { year: d.getFullYear(), month: d.getMonth() };
}

function buildStoredDate(from: MonthYear | null, to: MonthYear | null, present: boolean): string {
  if (!from) return "";
  const start = fmtStored(from);
  if (present) return `${start} – Present`;
  if (to) return `${start} – ${fmtStored(to)}`;
  return start;
}

function isInRange(my: MonthYear, from: MonthYear | null, to: MonthYear | null): boolean {
  if (!from || !to) return false;
  const v = my.year * 12 + my.month;
  const f = from.year * 12 + from.month;
  const t = to.year * 12 + to.month;
  return v > f && v < t;
}

// ─── MonthYearPicker popup ────────────────────────────────────────────────────
function MonthYearPicker({
  which, value, otherValue, present, onSelect, onClear,
}: {
  which: "from" | "to";
  value: MonthYear | null;
  otherValue: MonthYear | null;
  present: boolean;
  onSelect: (my: MonthYear) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value?.year ?? new Date().getFullYear());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => { if (value) setViewYear(value.year); }, [value]);

  const isDisabled = which === "to" && present;

  const fromMy = which === "to"   ? otherValue : value;
  const toMy   = which === "from" ? otherValue : value;

  return (
    <div ref={ref} className="relative flex-1 min-w-[140px]">
      <button
        type="button"
        onClick={() => { if (!isDisabled) setOpen(o => !o); }}
        disabled={isDisabled}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-colors focus:outline-none"
        style={{
          backgroundColor: "#0A0A0B",
          borderColor: open ? "#00D964" : "#26262B",
          color: isDisabled ? "#374151" : value ? "#fff" : "#6B7280",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.4 : 1,
        }}
      >
        <span>{isDisabled ? "Present" : value ? fmtDisplay(value) : "Select month"}</span>
        <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#6B7280" }} />
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-1.5 left-0 rounded-xl overflow-hidden"
          style={{
            width: "240px",
            backgroundColor: "#16161A",
            border: "1px solid #2a2a30",
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}
        >
          {/* Year navigation */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #26262B" }}>
            <button
              type="button"
              onClick={() => setViewYear(y => y - 1)}
              className="p-1 rounded-lg transition-colors hover:bg-[#26262B]"
              style={{ color: "#6B7280" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white text-sm font-bold font-mono">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear(y => y + 1)}
              className="p-1 rounded-lg transition-colors hover:bg-[#26262B]"
              style={{ color: "#6B7280" }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1 p-3">
            {MONTHS_SHORT.map((m, i) => {
              const thisMy: MonthYear = { year: viewYear, month: i };
              const isSelected = value?.year === viewYear && value?.month === i;
              const inRange = isInRange(thisMy, fromMy, toMy);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => { onSelect({ year: viewYear, month: i }); setTimeout(() => setOpen(false), 180); }}
                  className="py-2 rounded-lg text-[11px] font-mono transition-all"
                  style={{
                    backgroundColor: isSelected ? "#00D964" : inRange ? "rgba(0,217,100,0.12)" : "transparent",
                    color: isSelected ? "#0A0A0B" : inRange ? "#00D964" : "#9CA3AF",
                    fontWeight: isSelected ? 700 : 400,
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#26262B"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isSelected ? "#00D964" : inRange ? "rgba(0,217,100,0.12)" : "transparent"; }}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex gap-2 px-3 pb-3">
            <button
              type="button"
              onClick={() => { onClear(); setOpen(false); }}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-mono transition-colors hover:border-[#374151]"
              style={{ border: "1px solid #26262B", color: "#6B7280", backgroundColor: "transparent" }}
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold"
              style={{ backgroundColor: "#00D964", color: "#0A0A0B", border: "none" }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────
function DateRangePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parts   = value.split(" – ");
  const from    = parseStored(parts[0]?.trim() ?? "");
  const toRaw   = parts[1]?.trim() ?? "";
  const present = toRaw === "Present";
  const to      = present ? null : parseStored(toRaw);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <label className="text-[10px] text-[#6B7280] font-mono uppercase tracking-widest">From</label>
          <MonthYearPicker
            which="from" value={from} otherValue={to} present={false}
            onSelect={my => onChange(buildStoredDate(my, to, present))}
            onClear={() => onChange(buildStoredDate(null, to, present))}
          />
        </div>
        <span className="text-[#374151] font-mono text-sm" style={{ marginTop: "18px" }}>→</span>
        <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
          <label className="text-[10px] text-[#6B7280] font-mono uppercase tracking-widest">To</label>
          <MonthYearPicker
            which="to" value={to} otherValue={from} present={present}
            onSelect={my => onChange(buildStoredDate(from, my, false))}
            onClear={() => onChange(buildStoredDate(from, null, false))}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={present}
          onChange={e => onChange(buildStoredDate(from, to, e.target.checked))}
          className="w-3.5 h-3.5 rounded"
          style={{ accentColor: "#00D964" }}
        />
        <span className="text-xs font-mono text-[#6B7280]">Currently active / Present</span>
      </label>

      {value && (
        <p className="text-[10px] font-mono" style={{ color: "#374151" }}>
          Stored as: <span style={{ color: "#6B7280" }}>{value}</span>
        </p>
      )}
    </div>
  );
}

// ─── CertForm ─────────────────────────────────────────────────────────────────
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
        <div className="sm:col-span-2">
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Issue Date / Date Range</label>
          <DateRangePicker value={form.date} onChange={date => onChange({ ...form, date })} />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Sort Order</label>
          <input className={inp} type="number" value={form.sortOrder} onChange={e => onChange({ ...form, sortOrder: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-2">Public Verification Link</label>
          <p className="text-[10px] text-[#6B7280] font-mono mb-2 leading-relaxed">
            Public site shows "In Progress" only when the date above is in the future — not just
            because this link is empty. Leave blank for completed certs with no shareable URL.
          </p>
          {/* Has-link toggle */}
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <div
              onClick={() => onChange({ ...form, link: form.link === null ? "" : null })}
              className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0 cursor-pointer"
              style={{ backgroundColor: form.link !== null ? "#00D964" : "#26262B" }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                style={{
                  backgroundColor: form.link !== null ? "#0A0A0B" : "#6B7280",
                  transform: form.link !== null ? "translateX(22px)" : "translateX(2px)",
                }}
              />
            </div>
            <span className="text-xs font-mono" style={{ color: form.link !== null ? "#00D964" : "#6B7280" }}>
              {form.link !== null ? "Has a link" : "No public link"}
            </span>
          </label>
          {/* Credential link — only shown when the toggle above is on */}
          {form.link !== null && (
            <input
              className={inp}
              value={form.link ?? ""}
              onChange={f("link")}
              placeholder="https://credential-verify-url..."
            />
          )}
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

// ─── Main Tab ─────────────────────────────────────────────────────────────────
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

      {adding && <CertForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />}

      {items.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ backgroundColor: "#16161A", border: "1px dashed #26262B" }}>
          <Award className="w-8 h-8 text-[#374151] mb-3" />
          <p className="text-white text-sm font-mono font-bold mb-1">No certifications yet</p>
          <p className="text-[#6B7280] text-xs font-mono">Click "Add Certification" to get started</p>
        </div>
      )}

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
              style={{ backgroundColor: "#16161A", border: "1px solid #26262B", opacity: deletingId === c.id ? 0.5 : 1 }}
            >
              <div className="w-12 h-12 rounded-lg border border-[#26262B] flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#0A0A0B" }}>
                {c.imageUrl ? <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" /> : <Award className="w-5 h-5 text-[#374151]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white text-sm font-bold font-mono truncate">{c.title}</p>
                  {c.link && (
                    <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-[#6B7280] hover:text-[#00D964] transition-colors flex-shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-[#00D964] text-xs font-mono mt-0.5">{c.issuer}</p>
                <p className="text-[#6B7280] text-[11px] font-mono mt-0.5">{c.date}</p>
                {c.description && <p className="text-[#6B7280] text-[11px] font-mono mt-1.5 leading-relaxed line-clamp-2">{c.description}</p>}
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg border transition-colors" style={{ borderColor: "#26262B", color: "#6B7280" }} title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(c.id)} disabled={deletingId === c.id} className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50" title="Delete">
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
