"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

type Project = {
  id: number; name: string; year: string; description: string;
  imageUrl: string; link: string; githubUrl: string | null;
  tech: string; responsibilities: string; align: "left" | "right"; sortOrder: number;
};
type ProjectDraft = Omit<Project, "id">;

const BLANK: ProjectDraft = { name: "", year: "", description: "", imageUrl: "", link: "", githubUrl: "", tech: "[]", responsibilities: "[]", align: "left", sortOrder: 0 };
const inp = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-cyan/50";
const ta = `${inp} resize-y min-h-[80px]`;
const sel = `${inp} bg-darkBrown`;

const parseArr = (v: string) => { try { return (JSON.parse(v) as string[]).join("\n"); } catch { return ""; } };
const toArr = (v: string): string[] => v.split("\n").map(s => s.trim()).filter(Boolean);

function ProjForm({ form, onChange, onSave, onCancel, saving }: {
  form: ProjectDraft; onChange: (f: ProjectDraft) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const s = <K extends keyof ProjectDraft>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ ...form, [k]: e.target.value as ProjectDraft[K] });

  return (
    <div className="bg-black/40 border border-cyan/20 rounded-xl p-4 flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className="field-label">Project Name</label><input className={inp} value={form.name} onChange={s("name")} /></div>
        <div><label className="field-label">Year</label><input className={inp} placeholder="e.g. 2025 or Nov 2023" value={form.year} onChange={s("year")} /></div>
        <div><label className="field-label">Live URL</label><input className={inp} value={form.link} onChange={s("link")} /></div>
        <div><label className="field-label">GitHub URL</label><input className={inp} value={form.githubUrl ?? ""} onChange={s("githubUrl")} /></div>
        <div><label className="field-label">Image URL</label><input className={inp} value={form.imageUrl} onChange={s("imageUrl")} /></div>
        <div><label className="field-label">Align</label>
          <select className={sel} value={form.align} onChange={s("align")}>
            <option value="left">left</option>
            <option value="right">right</option>
          </select>
        </div>
        <div><label className="field-label">Sort Order</label><input className={inp} type="number" value={form.sortOrder} onChange={e => onChange({ ...form, sortOrder: Number(e.target.value) })} /></div>
      </div>
      <div><label className="field-label">Description</label><textarea className={ta} value={form.description} onChange={s("description")} /></div>
      <div><label className="field-label">Tech Stack (one per line)</label>
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

export function ProjectsTab() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ProjectDraft>(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/projects");
    const j = await r.json();
    setItems(j.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (p: Project) => {
    setAdding(false); setEditingId(p.id);
    setForm({ name: p.name, year: p.year, description: p.description, imageUrl: p.imageUrl, link: p.link, githubUrl: p.githubUrl, tech: p.tech, responsibilities: p.responsibilities, align: p.align, sortOrder: p.sortOrder });
  };
  const cancel = () => { setEditingId(null); setAdding(false); };

  const save = async () => {
    setSaving(true);
    const body = { ...form, tech: toArr(parseArr(form.tech)), responsibilities: toArr(parseArr(form.responsibilities)) };
    if (adding) {
      await fetch("/api/admin/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else if (editingId !== null) {
      await fetch(`/api/admin/projects/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    cancel(); await load(); setSaving(false);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-lightGrey text-sm font-mono">{items.length} projects</p>
        {!adding && (
          <button onClick={() => { setEditingId(null); setAdding(true); setForm(BLANK); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan text-black text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Project
          </button>
        )}
      </div>
      {adding && <ProjForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />}
      <div className="flex flex-col gap-3">
        {items.map(p =>
          editingId === p.id ? (
            <ProjForm key={p.id} form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />
          ) : (
            <div key={p.id} className="bg-black/30 border border-lightBrown rounded-xl p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{p.name}</p>
                <p className="text-cyan text-xs font-mono mt-0.5">{p.year} · align:{p.align}</p>
                <p className="text-lightGrey text-xs mt-1 line-clamp-2">{p.description}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg border border-lightBrown text-lightGrey hover:text-cyan hover:border-cyan/40 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg border border-lightBrown text-lightGrey hover:text-red-400 hover:border-red-500/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
