"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";

type Skill = { id: number; name: string; category: string; level: number; iconKey: string; sortOrder: number };
type SkillDraft = Omit<Skill, "id">;

const ICON_KEYS = [
  "FaAws","FaDocker","FaJenkins","FaReact","FaPython","FaFire",
  "SiGithubactions","SiKubernetes","SiLinux","SiTerraform",
  "SiGrafana","SiPrometheus","SiHelm","SiVault","SiAnsible","SiDjango",
  "GiArtificialIntelligence",
];
const CATEGORIES = ["cloud","devops","backend","monitoring"];
const BLANK: SkillDraft = { name: "", category: "devops", level: 80, iconKey: "FaAws", sortOrder: 0 };
const inp = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm font-mono focus:outline-none focus:border-cyan/50";
const sel = `${inp} bg-darkBrown`;

function SkillForm({ form, onChange, onSave, onCancel, saving }: {
  form: SkillDraft; onChange: (f: SkillDraft) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const s = <K extends keyof SkillDraft>(k: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...form, [k]: k === "level" || k === "sortOrder" ? Number(e.target.value) : e.target.value });

  return (
    <div className="bg-black/40 border border-cyan/20 rounded-xl p-4 grid sm:grid-cols-2 gap-3">
      <div><label className="field-label">Name</label><input className={inp} value={form.name} onChange={s("name")} /></div>
      <div><label className="field-label">Category</label>
        <select className={sel} value={form.category} onChange={s("category")}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div><label className="field-label">Level (0–100)</label><input className={inp} type="number" min={0} max={100} value={form.level} onChange={s("level")} /></div>
      <div><label className="field-label">Icon Key</label>
        <select className={sel} value={form.iconKey} onChange={s("iconKey")}>
          {ICON_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
      <div><label className="field-label">Sort Order</label><input className={inp} type="number" value={form.sortOrder} onChange={s("sortOrder")} /></div>
      <div className="flex items-end gap-2">
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

export function SkillsTab() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<SkillDraft>(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/skills");
    const j = await r.json();
    setSkills(j.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startAdd = () => { setEditingId(null); setAdding(true); setForm(BLANK); };
  const startEdit = (s: Skill) => { setAdding(false); setEditingId(s.id); setForm({ name: s.name, category: s.category, level: s.level, iconKey: s.iconKey, sortOrder: s.sortOrder }); };
  const cancel = () => { setEditingId(null); setAdding(false); };

  const save = async () => {
    setSaving(true);
    if (adding) {
      await fetch("/api/admin/skills", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else if (editingId !== null) {
      await fetch(`/api/admin/skills/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    cancel(); await load(); setSaving(false);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this skill?")) return;
    await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-cyan animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-lightGrey text-sm font-mono">{skills.length} skills</p>
        {!adding && (
          <button onClick={startAdd} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan text-black text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Skill
          </button>
        )}
      </div>

      {adding && <SkillForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />}

      <div className="grid sm:grid-cols-2 gap-3">
        {skills.map(skill =>
          editingId === skill.id ? (
            <SkillForm key={skill.id} form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />
          ) : (
            <div key={skill.id} className="bg-black/30 border border-lightBrown rounded-xl p-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-white text-sm font-semibold">{skill.name}</p>
                <p className="text-xs font-mono mt-0.5">
                  <span className="text-cyan">{skill.category}</span>
                  <span className="text-grey mx-1">·</span>
                  <span className="text-green">{skill.level}%</span>
                  <span className="text-grey mx-1">·</span>
                  <span className="text-lightGrey">{skill.iconKey}</span>
                </p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => startEdit(skill)} className="p-1.5 rounded-lg border border-lightBrown text-lightGrey hover:text-cyan hover:border-cyan/40 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => remove(skill.id)} className="p-1.5 rounded-lg border border-lightBrown text-lightGrey hover:text-red-400 hover:border-red-500/30 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
