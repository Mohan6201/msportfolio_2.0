"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

type SocialLink = { id: number; platform: string; url: string; label: string; iconKey: string; sortOrder: number };
type LinkDraft = Omit<SocialLink, "id">;

const ICON_KEYS = ["FaLinkedinIn", "FiGithub", "FaInstagram", "FiMail", "FiTwitter"];
const BLANK: LinkDraft = { platform: "", url: "", label: "", iconKey: "FiGithub", sortOrder: 0 };
const inp = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-cyan/50";
const sel = `${inp} bg-darkBrown`;

function LinkForm({ form, onChange, onSave, onCancel, saving }: {
  form: LinkDraft; onChange: (f: LinkDraft) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const s = <K extends keyof LinkDraft>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...form, [k]: k === "sortOrder" ? Number(e.target.value) : e.target.value as LinkDraft[K] });

  return (
    <div className="bg-black/40 border border-cyan/20 rounded-xl p-4 grid sm:grid-cols-2 gap-3">
      <div><label className="field-label">Platform</label><input className={inp} placeholder="e.g. github" value={form.platform} onChange={s("platform")} /></div>
      <div><label className="field-label">Label</label><input className={inp} placeholder="e.g. GitHub" value={form.label} onChange={s("label")} /></div>
      <div className="sm:col-span-2"><label className="field-label">URL</label><input className={inp} value={form.url} onChange={s("url")} /></div>
      <div><label className="field-label">Icon Key</label>
        <select className={sel} value={form.iconKey} onChange={s("iconKey")}>
          {ICON_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div><label className="field-label">Sort Order</label><input className={inp} type="number" value={form.sortOrder} onChange={s("sortOrder")} /></div>
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

export function SocialLinksTab() {
  const [items, setItems] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<LinkDraft>(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/social-links");
    const j = await r.json();
    setItems(j.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (l: SocialLink) => {
    setAdding(false); setEditingId(l.id);
    setForm({ platform: l.platform, url: l.url, label: l.label, iconKey: l.iconKey, sortOrder: l.sortOrder });
  };
  const cancel = () => { setEditingId(null); setAdding(false); };

  const save = async () => {
    setSaving(true);
    if (adding) {
      await fetch("/api/admin/social-links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else if (editingId !== null) {
      await fetch(`/api/admin/social-links/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    cancel(); await load(); setSaving(false);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this social link?")) return;
    await fetch(`/api/admin/social-links/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-lightGrey text-sm font-mono">{items.length} social links</p>
        {!adding && (
          <button onClick={() => { setEditingId(null); setAdding(true); setForm(BLANK); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan text-black text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Link
          </button>
        )}
      </div>
      {adding && <LinkForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />}
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(l =>
          editingId === l.id ? (
            <LinkForm key={l.id} form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />
          ) : (
            <div key={l.id} className="bg-black/30 border border-lightBrown rounded-xl p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-white text-sm font-semibold">{l.label}</p>
                <p className="text-cyan text-xs font-mono mt-0.5">{l.platform} · {l.iconKey}</p>
                <p className="text-lightGrey text-xs mt-0.5 truncate max-w-[200px]">{l.url}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(l)} className="p-1.5 rounded-lg border border-lightBrown text-lightGrey hover:text-cyan hover:border-cyan/40 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(l.id)} className="p-1.5 rounded-lg border border-lightBrown text-lightGrey hover:text-red-400 hover:border-red-500/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
