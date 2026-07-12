"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2, Zap } from "lucide-react";

type Skill = { id: number; name: string; category: string; level: number; iconKey: string; sortOrder: number };
type SkillDraft = Omit<Skill, "id">;

const ICON_KEYS = [
  "FaAws","FaDocker","FaJenkins","FaReact","FaPython","FaWindows",
  "SiGithubactions","SiLinux","SiTerraform",
  "SiGrafana","SiPrometheus","SiAnsible","SiDjango",
  "SiGnubash","SiNginx",
];
const CATEGORIES = ["cloud","devops","backend","monitoring"];
const BLANK: SkillDraft = { name: "", category: "devops", level: 80, iconKey: "FaAws", sortOrder: 0 };

const inp = "w-full bg-[#0A0A0B] border border-[#26262B] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00D964] transition-colors placeholder-[#374151]";
const sel = `${inp}`;

const CAT_COLOR: Record<string, string> = {
  cloud: "#38bdf8", devops: "#00D964", backend: "#a78bfa", monitoring: "#fbbf24",
};

function LevelBar({ level }: { level: number }) {
  const color = level >= 80 ? "#00D964" : level >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#26262B" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${level}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono w-8 text-right" style={{ color }}>{level}%</span>
    </div>
  );
}

function SkillForm({ form, onChange, onSave, onCancel, saving }: {
  form: SkillDraft; onChange: (f: SkillDraft) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const s = <K extends keyof SkillDraft>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...form, [k]: k === "level" || k === "sortOrder" ? Number(e.target.value) : e.target.value });

  return (
    <div className="rounded-xl p-5 flex flex-col gap-4" style={{ backgroundColor: "#16161A", border: "1px solid #00D964", boxShadow: "0 0 0 1px rgba(0,217,100,0.1)" }}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Name *</label>
          <input className={inp} value={form.name} onChange={s("name")} placeholder="e.g. Kubernetes" />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Category</label>
          <select className={sel} value={form.category} onChange={s("category")}>
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#16161A]">{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Level (0–100)</label>
          <input className={inp} type="number" min={0} max={100} value={form.level} onChange={s("level")} />
          <LevelBar level={form.level} />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Icon Key</label>
          <select className={sel} value={form.iconKey} onChange={s("iconKey")}>
            {ICON_KEYS.map(k => <option key={k} value={k} className="bg-[#16161A]">{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Sort Order</label>
          <input className={inp} type="number" value={form.sortOrder} onChange={s("sortOrder")} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={saving || !form.name}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold font-mono disabled:opacity-50"
          style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {saving ? "Saving…" : "Save Skill"}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono transition-colors"
          style={{ borderColor: "#26262B", color: "#6B7280" }}>
          <X className="w-3 h-3" /> Cancel
        </button>
      </div>
    </div>
  );
}

export function SkillsTab() {
  const [skills,    setSkills]    = useState<Skill[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding,    setAdding]    = useState(false);
  const [form,      setForm]      = useState<SkillDraft>(BLANK);
  const [saving,    setSaving]    = useState(false);
  const [deletingId,setDeletingId]= useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/skills");
    const j = await r.json();
    setSkills(j.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (s: Skill) => {
    setAdding(false); setEditingId(s.id);
    setForm({ name: s.name, category: s.category, level: s.level, iconKey: s.iconKey, sortOrder: s.sortOrder });
  };
  const cancel = () => { setEditingId(null); setAdding(false); setForm(BLANK); };

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
    setDeletingId(id);
    await fetch(`/api/admin/skills/${id}`, { method: "DELETE" });
    await load(); setDeletingId(null);
  };

  // Group by category
  const grouped = CATEGORIES.reduce<Record<string, Skill[]>>((acc, cat) => {
    acc[cat] = skills.filter(s => s.category === cat);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 animate-pulse" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#26262B]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-[#26262B]" />
                <div className="h-1.5 w-full rounded-full bg-[#26262B]" />
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
            <Zap className="w-4 h-4 text-[#00D964]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{skills.length} Skills</p>
            <p className="text-[#6B7280] text-[11px] font-mono">Grouped by category</p>
          </div>
        </div>
        {!adding && (
          <button onClick={() => { setEditingId(null); setAdding(true); setForm(BLANK); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold font-mono"
            style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}>
            <Plus className="w-3.5 h-3.5" /> Add Skill
          </button>
        )}
      </div>

      {adding && <SkillForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />}

      {/* Grouped skill cards */}
      {CATEGORIES.map(cat => {
        const catSkills = grouped[cat];
        if (catSkills.length === 0 && !editingId) return null;
        return (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: (CAT_COLOR[cat] ?? "#6B7280") + "20", color: CAT_COLOR[cat] ?? "#6B7280", border: `1px solid ${(CAT_COLOR[cat] ?? "#6B7280")}40` }}>
                {cat}
              </span>
              <span className="text-[10px] font-mono text-[#374151]">{catSkills.length} skills</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {catSkills.map(skill =>
                editingId === skill.id ? (
                  <div key={skill.id} className="sm:col-span-2">
                    <SkillForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />
                  </div>
                ) : (
                  <div key={skill.id}
                    className="rounded-xl p-4 flex items-center gap-3 transition-opacity"
                    style={{ backgroundColor: "#16161A", border: "1px solid #26262B", opacity: deletingId === skill.id ? 0.5 : 1 }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}>
                      <span className="text-[11px] font-mono" style={{ color: CAT_COLOR[cat] }}>
                        {skill.iconKey.replace(/^(Fa|Si|Gi)/, "").slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold font-mono">{skill.name}</p>
                      <LevelBar level={skill.level} />
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(skill)}
                        className="p-1.5 rounded-lg border transition-colors"
                        style={{ borderColor: "#26262B", color: "#6B7280" }}>
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => remove(skill.id)} disabled={deletingId === skill.id}
                        className="p-1.5 rounded-lg border border-red/30 text-red hover:bg-red/10 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        );
      })}

      {skills.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ backgroundColor: "#16161A", border: "1px dashed #26262B" }}>
          <Zap className="w-8 h-8 text-[#374151] mb-3" />
          <p className="text-white text-sm font-mono font-bold mb-1">No skills yet</p>
          <p className="text-[#6B7280] text-xs font-mono">Click "Add Skill" to get started</p>
        </div>
      )}
    </div>
  );
}
