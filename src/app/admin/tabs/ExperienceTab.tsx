"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

type Exp = {
  id: number; jobTitle: string; company: string; companyUrl: string | null;
  startDate: string; endDate: string | null; isCurrent: boolean;
  tech: string; responsibilities: string; sortOrder: number;
};
type ExpDraft = Omit<Exp, "id">;

const BLANK: ExpDraft = { jobTitle: "", company: "", companyUrl: "", startDate: "", endDate: null, isCurrent: false, tech: "[]", responsibilities: "[]", sortOrder: 0 };
const inp = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-cyan/50";
const ta = `${inp} resize-y min-h-[80px]`;

const parseArr = (v: string) => { try { return (JSON.parse(v) as string[]).join("\n"); } catch { return ""; } };
const toArr = (v: string): string[] => v.split("\n").map(s => s.trim()).filter(Boolean);

function ExpForm({ form, onChange, onSave, onCancel, saving }: {
  form: ExpDraft; onChange: (f: ExpDraft) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const s = <K extends keyof ExpDraft>(k: K, val?: unknown) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [k]: val !== undefined ? val : e.target.value });

  return (
    <div className="bg-black/40 border border-cyan/20 rounded-xl p-4 flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="field-label">Job Title</label><input className={inp} value={form.jobTitle} onChange={s("jobTitle")} /></div>
        <div><label className="field-label">Company</label><input className={inp} value={form.company} onChange={s("company")} /></div>
        <div><label className="field-label">Company URL</label><input className={inp} value={form.companyUrl ?? ""} onChange={s("companyUrl")} /></div>
        <div><label className="field-label">Start Date</label><input className={inp} placeholder="e.g. SEP 2025" value={form.startDate} onChange={s("startDate")} /></div>
        <div><label className="field-label">End Date</label><input className={inp} placeholder="Leave blank if current" value={form.endDate ?? ""} onChange={s("endDate")} disabled={form.isCurrent} /></div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id="isCurrent" checked={form.isCurrent} onChange={e => onChange({ ...form, isCurrent: e.target.checked, endDate: e.target.checked ? null : form.endDate })} className="accent-cyan" />
          <label htmlFor="isCurrent" className="text-sm text-lightGrey font-mono">Currently working here</label>
        </div>
        <div><label className="field-label">Sort Order</label><input className={inp} type="number" value={form.sortOrder} onChange={e => onChange({ ...form, sortOrder: Number(e.target.value) })} /></div>
      </div>
      <div><label className="field-label">Tech (one per line)</label>
        <textarea className={ta} value={parseArr(form.tech)} onChange={e => onChange({ ...form, tech: JSON.stringify(toArr(e.target.value)) })} />
      </div>
      <div><label className="field-label">Responsibilities (one per line)</label>
        <textarea className={`${ta} min-h-[120px]`} value={parseArr(form.responsibilities)} onChange={e => onChange({ ...form, responsibilities: JSON.stringify(toArr(e.target.value)) })} />
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan text-black text-xs font-bold disabled:opacity-50">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
        </button>
        <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-lightBrown text-lightGrey text-xs hover:border-white/30">
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
}

export function ExperienceTab() {
  const [items, setItems] = useState<Exp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ExpDraft>(BLANK);
  const [saving, setSaving] = useState(false);

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
  const cancel = () => { setEditingId(null); setAdding(false); };

  const save = async () => {
    setSaving(true);
    const body = { ...form, tech: toArr(parseArr(form.tech)), responsibilities: toArr(parseArr(form.responsibilities)) };
    if (adding) {
      await fetch("/api/admin/experiences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else if (editingId !== null) {
      await fetch(`/api/admin/experiences/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    cancel(); await load(); setSaving(false);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this experience?")) return;
    await fetch(`/api/admin/experiences/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-lightGrey text-sm font-mono">{items.length} experiences</p>
        {!adding && (
          <button onClick={() => { setEditingId(null); setAdding(true); setForm(BLANK); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan text-black text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Experience
          </button>
        )}
      </div>
      {adding && <ExpForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />}
      <div className="flex flex-col gap-3">
        {items.map(e =>
          editingId === e.id ? (
            <ExpForm key={e.id} form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />
          ) : (
            <div key={e.id} className="bg-black/30 border border-lightBrown rounded-xl p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{e.jobTitle}</p>
                <p className="text-cyan text-xs font-mono mt-0.5">{e.company} · {e.startDate} – {e.isCurrent ? "Present" : (e.endDate ?? "")}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(e)} className="p-1.5 rounded-lg border border-lightBrown text-lightGrey hover:text-cyan hover:border-cyan/40 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(e.id)} className="p-1.5 rounded-lg border border-lightBrown text-lightGrey hover:text-red-400 hover:border-red-500/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
