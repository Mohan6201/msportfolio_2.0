"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

type Cert = { id: number; title: string; issuer: string; date: string; description: string; imageUrl: string; link: string | null; sortOrder: number };
type CertDraft = Omit<Cert, "id">;

const BLANK: CertDraft = { title: "", issuer: "", date: "", description: "", imageUrl: "", link: "", sortOrder: 0 };
const inp = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-cyan/50";

function CertForm({ form, onChange, onSave, onCancel, saving }: {
  form: CertDraft; onChange: (f: CertDraft) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const s = <K extends keyof CertDraft>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [k]: e.target.value as CertDraft[K] });

  return (
    <div className="bg-black/40 border border-cyan/20 rounded-xl p-4 grid sm:grid-cols-2 gap-3">
      <div><label className="field-label">Title</label><input className={inp} value={form.title} onChange={s("title")} /></div>
      <div><label className="field-label">Issuer</label><input className={inp} value={form.issuer} onChange={s("issuer")} /></div>
      <div><label className="field-label">Date (YYYY-MM-DD)</label><input className={inp} type="date" value={form.date} onChange={s("date")} /></div>
      <div><label className="field-label">Sort Order</label><input className={inp} type="number" value={form.sortOrder} onChange={e => onChange({ ...form, sortOrder: Number(e.target.value) })} /></div>
      <div className="sm:col-span-2"><label className="field-label">Image URL</label><input className={inp} value={form.imageUrl} onChange={s("imageUrl")} /></div>
      <div className="sm:col-span-2"><label className="field-label">Credential Link (optional)</label><input className={inp} value={form.link ?? ""} onChange={s("link")} /></div>
      <div className="sm:col-span-2"><label className="field-label">Description</label>
        <textarea className={`${inp} resize-y min-h-[80px]`} value={form.description} onChange={s("description")} />
      </div>
      <div className="flex gap-2 sm:col-span-2">
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

export function CertificationsTab() {
  const [items, setItems] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<CertDraft>(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/certifications");
    const j = await r.json();
    setItems(j.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (c: Cert) => {
    setAdding(false); setEditingId(c.id);
    setForm({ title: c.title, issuer: c.issuer, date: c.date, description: c.description, imageUrl: c.imageUrl, link: c.link, sortOrder: c.sortOrder });
  };
  const cancel = () => { setEditingId(null); setAdding(false); };

  const save = async () => {
    setSaving(true);
    if (adding) {
      await fetch("/api/admin/certifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else if (editingId !== null) {
      await fetch(`/api/admin/certifications/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    cancel(); await load(); setSaving(false);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this certification?")) return;
    await fetch(`/api/admin/certifications/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-lightGrey text-sm font-mono">{items.length} certifications</p>
        {!adding && (
          <button onClick={() => { setEditingId(null); setAdding(true); setForm(BLANK); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan text-black text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Cert
          </button>
        )}
      </div>
      {adding && <CertForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />}
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(c =>
          editingId === c.id ? (
            <CertForm key={c.id} form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />
          ) : (
            <div key={c.id} className="bg-black/30 border border-lightBrown rounded-xl p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-white text-sm font-semibold">{c.title}</p>
                <p className="text-cyan text-xs font-mono mt-0.5">{c.issuer} · {c.date}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg border border-lightBrown text-lightGrey hover:text-cyan hover:border-cyan/40 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg border border-lightBrown text-lightGrey hover:text-red-400 hover:border-red-500/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
