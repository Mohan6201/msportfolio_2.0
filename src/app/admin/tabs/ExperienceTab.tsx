"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2, Briefcase, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

type Exp = {
  id: number; jobTitle: string; company: string; companyUrl: string | null;
  startDate: string; endDate: string | null; isCurrent: boolean;
  tech: string; responsibilities: string; sortOrder: number;
};
type ExpDraft = Omit<Exp, "id">;
type MonthYear = { year: number; month: number };

const BLANK: ExpDraft = { jobTitle: "", company: "", companyUrl: "", startDate: "", endDate: null, isCurrent: false, tech: "[]", responsibilities: "[]", sortOrder: 0 };
const inp = "w-full bg-[#0A0A0B] border border-[#26262B] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00D964] transition-colors placeholder-[#374151]";
const ta  = `${inp} resize-y min-h-[80px]`;

const parseArr = (v: string) => { try { return (JSON.parse(v) as string[]).join("\n"); } catch { return ""; } };
const toArr = (v: string): string[] => v.split("\n").map(s => s.trim()).filter(Boolean);

// Stored format must match parseExperienceDate() in profile.service.ts: "MMM YYYY", e.g. "SEP 2025".
const MONTHS_SHORT = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function fmtExpDate(my: MonthYear): string { return `${MONTHS_SHORT[my.month]} ${my.year}`; }
function parseExpDate(str: string | null | undefined): MonthYear | null {
  if (!str) return null;
  const m = str.trim().toUpperCase().match(/^([A-Z]{3})\s+(\d{4})$/);
  if (!m) return null;
  const idx = MONTHS_SHORT.indexOf(m[1]);
  return idx === -1 ? null : { year: Number(m[2]), month: idx };
}

// ─── MonthYearPicker popup (calendar-style month/year select) ─────────────────
function MonthYearPicker({ value, disabled, onSelect, onClear }: {
  value: MonthYear | null; disabled?: boolean;
  onSelect: (my: MonthYear) => void; onClear: () => void;
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        disabled={disabled}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono transition-colors focus:outline-none"
        style={{
          backgroundColor: "#0A0A0B",
          borderColor: open ? "#00D964" : "#26262B",
          color: disabled ? "#374151" : value ? "#fff" : "#6B7280",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <span>{disabled ? "Present" : value ? fmtExpDate(value) : "Select month"}</span>
        <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#6B7280" }} />
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-1.5 left-0 rounded-xl overflow-hidden"
          style={{ width: "240px", backgroundColor: "#16161A", border: "1px solid #2a2a30", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #26262B" }}>
            <button type="button" onClick={() => setViewYear(y => y - 1)} className="p-1 rounded-lg transition-colors hover:bg-[#26262B]" style={{ color: "#6B7280" }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white text-sm font-bold font-mono">{viewYear}</span>
            <button type="button" onClick={() => setViewYear(y => y + 1)} className="p-1 rounded-lg transition-colors hover:bg-[#26262B]" style={{ color: "#6B7280" }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1 p-3">
            {MONTHS_SHORT.map((m, i) => {
              const isSelected = value?.year === viewYear && value?.month === i;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => { onSelect({ year: viewYear, month: i }); setTimeout(() => setOpen(false), 180); }}
                  className="py-2 rounded-lg text-[11px] font-mono transition-all"
                  style={{ backgroundColor: isSelected ? "#00D964" : "transparent", color: isSelected ? "#0A0A0B" : "#9CA3AF", fontWeight: isSelected ? 700 : 400 }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#26262B"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isSelected ? "#00D964" : "transparent"; }}
                >
                  {m}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 px-3 pb-3">
            <button type="button" onClick={() => { onClear(); setOpen(false); }} className="flex-1 py-1.5 rounded-lg text-[11px] font-mono transition-colors hover:border-[#374151]" style={{ border: "1px solid #26262B", color: "#6B7280", backgroundColor: "transparent" }}>
              Clear
            </button>
            <button type="button" onClick={() => setOpen(false)} className="flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold" style={{ backgroundColor: "#00D964", color: "#0A0A0B", border: "none" }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExpForm({ form, onChange, onSave, onCancel, saving }: {
  form: ExpDraft; onChange: (f: ExpDraft) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const s = <K extends keyof ExpDraft>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [k]: e.target.value as ExpDraft[K] });

  return (
    <div className="rounded-xl p-5 flex flex-col gap-4" style={{ backgroundColor: "#16161A", border: "1px solid #00D964", boxShadow: "0 0 0 1px rgba(0,217,100,0.1)" }}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Job Title *</label>
          <input className={inp} value={form.jobTitle} onChange={s("jobTitle")} placeholder="e.g. DevOps Engineer" />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Company *</label>
          <input className={inp} value={form.company} onChange={s("company")} placeholder="e.g. Acme Corp" />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Company URL</label>
          <input className={inp} value={form.companyUrl ?? ""} onChange={s("companyUrl")} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Start Date</label>
          <MonthYearPicker
            value={parseExpDate(form.startDate)}
            onSelect={my => onChange({ ...form, startDate: fmtExpDate(my) })}
            onClear={() => onChange({ ...form, startDate: "" })}
          />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">End Date</label>
          <MonthYearPicker
            value={parseExpDate(form.endDate)}
            disabled={form.isCurrent}
            onSelect={my => onChange({ ...form, endDate: fmtExpDate(my) })}
            onClear={() => onChange({ ...form, endDate: null })}
          />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id="isCurrent" checked={form.isCurrent}
            onChange={e => onChange({ ...form, isCurrent: e.target.checked, endDate: e.target.checked ? null : form.endDate })}
            className="w-4 h-4 rounded accent-[#00D964]" />
          <label htmlFor="isCurrent" className="text-sm text-white font-mono">Currently working here</label>
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Sort Order</label>
          <input className={inp} type="number" value={form.sortOrder} onChange={e => onChange({ ...form, sortOrder: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Tech Stack <span className="normal-case text-[#374151]">(one per line)</span></label>
        <textarea className={ta} value={parseArr(form.tech)} onChange={e => onChange({ ...form, tech: JSON.stringify(toArr(e.target.value)) })} placeholder={"Kubernetes\nTerraform\nAWS"} />
      </div>
      <div>
        <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Responsibilities <span className="normal-case text-[#374151]">(one per line)</span></label>
        <textarea className={`${ta} min-h-[120px]`} value={parseArr(form.responsibilities)} onChange={e => onChange({ ...form, responsibilities: JSON.stringify(toArr(e.target.value)) })} placeholder={"Designed CI/CD pipeline\nReduced deployment time by 40%"} />
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving || !form.jobTitle || !form.company}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold font-mono disabled:opacity-50"
          style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {saving ? "Saving…" : "Save Experience"}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono"
          style={{ borderColor: "#26262B", color: "#6B7280" }}>
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
}

export function ExperienceTab() {
  const [items,     setItems]     = useState<Exp[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding,    setAdding]    = useState(false);
  const [form,      setForm]      = useState<ExpDraft>(BLANK);
  const [saving,    setSaving]    = useState(false);
  const [deletingId,setDeletingId]= useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/experiences");
    const j = await r.json();
    setItems(j.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (e: Exp) => {
    setAdding(false); setEditingId(e.id);
    setForm({ jobTitle: e.jobTitle, company: e.company, companyUrl: e.companyUrl, startDate: e.startDate, endDate: e.endDate, isCurrent: e.isCurrent, tech: e.tech, responsibilities: e.responsibilities, sortOrder: e.sortOrder });
  };
  const cancel = () => { setEditingId(null); setAdding(false); setForm(BLANK); };

  const save = async () => {
    setSaving(true);
    const body = { ...form };
    if (adding) {
      await fetch("/api/admin/experiences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else if (editingId !== null) {
      await fetch(`/api/admin/experiences/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    cancel(); await load(); setSaving(false);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this experience?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/experiences/${id}`, { method: "DELETE" });
    await load(); setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 animate-pulse" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#26262B]" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 w-1/3 rounded bg-[#26262B]" />
                <div className="h-2.5 w-1/2 rounded bg-[#1f1f24]" />
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
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(168,139,250,0.1)" }}>
            <Briefcase className="w-4 h-4 text-[#a78bfa]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{items.length} Experiences</p>
            <p className="text-[#6B7280] text-[11px] font-mono">Work history and roles</p>
          </div>
        </div>
        {!adding && (
          <button onClick={() => { setEditingId(null); setAdding(true); setForm(BLANK); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold font-mono"
            style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}>
            <Plus className="w-3.5 h-3.5" /> Add Experience
          </button>
        )}
      </div>

      {adding && <ExpForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />}

      {items.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ backgroundColor: "#16161A", border: "1px dashed #26262B" }}>
          <Briefcase className="w-8 h-8 text-[#374151] mb-3" />
          <p className="text-white text-sm font-mono font-bold mb-1">No experiences yet</p>
          <p className="text-[#6B7280] text-xs font-mono">Click "Add Experience" to get started</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items.map(exp =>
          editingId === exp.id ? (
            <ExpForm key={exp.id} form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />
          ) : (
            <div key={exp.id}
              className="rounded-xl p-4 flex items-start gap-4 transition-opacity"
              style={{ backgroundColor: "#16161A", border: "1px solid #26262B", opacity: deletingId === exp.id ? 0.5 : 1 }}>
              {/* Timeline dot */}
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}>
                <Briefcase className="w-4 h-4 text-[#a78bfa]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-white text-sm font-bold font-mono">{exp.jobTitle}</p>
                    <p className="text-[#a78bfa] text-xs font-mono">{exp.company}</p>
                    <p className="text-[#6B7280] text-[11px] font-mono mt-0.5">
                      {exp.startDate} → {exp.isCurrent ? <span className="text-[#00D964]">Present</span> : exp.endDate}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(exp)} className="p-1.5 rounded-lg border transition-colors"
                      style={{ borderColor: "#26262B", color: "#6B7280" }} title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(exp.id)} disabled={deletingId === exp.id}
                      className="p-1.5 rounded-lg border border-red/30 text-red hover:bg-red/10 transition-colors disabled:opacity-50" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Tech pills */}
                {exp.tech && exp.tech !== "[]" && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(() => { try { return JSON.parse(exp.tech) as string[]; } catch { return []; } })()
                      .slice(0, 6).map((t: string, i: number) => (
                        <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B", color: "#6B7280" }}>
                          {t}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
