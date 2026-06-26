// src/app/admin/tabs/ProjectsTab.tsx
// FULL REPLACEMENT — redesigned with ImageUploader, consistent dark design system

"use client";
import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Loader2, ExternalLink, GitFork, FolderOpen } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Project = {
  id: number; name: string; year: string; description: string;
  imageUrl: string; link: string; githubUrl: string | null;
  tech: string; responsibilities: string; align: "left" | "right"; sortOrder: number;
};
type ProjectDraft = Omit<Project, "id">;

const BLANK: ProjectDraft = { name: "", year: "", description: "", imageUrl: "", link: "", githubUrl: "", tech: "[]", responsibilities: "[]", align: "left", sortOrder: 0 };
const inp = "w-full bg-[#0A0A0B] border border-[#26262B] rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#00D964] transition-colors placeholder-[#374151]";
const ta  = `${inp} resize-y min-h-[72px]`;
const sel = `${inp}`;

const parseArr = (v: string) => { try { return (JSON.parse(v) as string[]).join("\n"); } catch { return ""; } };
const toArr = (v: string): string[] => v.split("\n").map(s => s.trim()).filter(Boolean);

function ProjForm({ form, onChange, onSave, onCancel, saving }: {
  form: ProjectDraft; onChange: (f: ProjectDraft) => void;
  onSave: () => void; onCancel: () => void; saving: boolean;
}) {
  const f = <K extends keyof ProjectDraft>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange({ ...form, [k]: e.target.value as ProjectDraft[K] });

  return (
    <div className="rounded-xl p-5 flex flex-col gap-4" style={{ backgroundColor: "#16161A", border: "1px solid #00D964", boxShadow: "0 0 0 1px rgba(0,217,100,0.1)" }}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Project Name *</label>
          <input className={inp} value={form.name} onChange={f("name")} placeholder="e.g. K8s Autoscaler" />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Year</label>
          <input className={inp} value={form.year} onChange={f("year")} placeholder="e.g. 2024 or Nov 2023" />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Live URL</label>
          <input className={inp} value={form.link} onChange={f("link")} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">GitHub URL</label>
          <input className={inp} value={form.githubUrl ?? ""} onChange={f("githubUrl")} placeholder="https://github.com/..." />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Layout Align</label>
          <select className={sel} value={form.align} onChange={f("align")}>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Sort Order</label>
          <input className={inp} type="number" value={form.sortOrder} onChange={e => onChange({ ...form, sortOrder: Number(e.target.value) })} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Description</label>
          <textarea className={ta} value={form.description} onChange={f("description")} placeholder="What this project does and the problem it solves" />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Tech Stack <span className="normal-case text-[#374151]">(one per line)</span></label>
          <textarea className={ta} value={parseArr(form.tech)} onChange={e => onChange({ ...form, tech: JSON.stringify(toArr(e.target.value)) })} placeholder={"Kubernetes\nTerraform\nAWS"} />
        </div>
        <div>
          <label className="block text-[11px] text-[#6B7280] font-mono uppercase tracking-widest mb-1.5">Responsibilities <span className="normal-case text-[#374151]">(one per line)</span></label>
          <textarea className={`${ta} min-h-[100px]`} value={parseArr(form.responsibilities)} onChange={e => onChange({ ...form, responsibilities: JSON.stringify(toArr(e.target.value)) })} placeholder={"Designed the CI/CD pipeline\nReduced deployment time by 40%"} />
        </div>
        <div className="sm:col-span-2">
          <ImageUploader
            value={form.imageUrl}
            onChange={url => onChange({ ...form, imageUrl: url })}
            folder="projects"
            label="Project Screenshot / Cover Image"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onSave}
          disabled={saving || !form.name}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold font-mono transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          {saving ? "Saving…" : "Save Project"}
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

export function ProjectsTab() {
  const [items, setItems]         = useState<Project[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding]       = useState(false);
  const [form, setForm]           = useState<ProjectDraft>(BLANK);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/admin/projects");
    const j = await r.json();
    setItems(j.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (p: Project) => {
    setAdding(false);
    setEditingId(p.id);
    setForm({ name: p.name, year: p.year, description: p.description, imageUrl: p.imageUrl, link: p.link, githubUrl: p.githubUrl, tech: p.tech, responsibilities: p.responsibilities, align: p.align, sortOrder: p.sortOrder });
  };
  const cancel = () => { setEditingId(null); setAdding(false); setForm(BLANK); };

  const save = async () => {
    setSaving(true);
    const body = { ...form, tech: typeof form.tech === "string" ? form.tech : JSON.stringify(form.tech), responsibilities: typeof form.responsibilities === "string" ? form.responsibilities : JSON.stringify(form.responsibilities) };
    if (adding) {
      await fetch("/api/admin/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    } else if (editingId !== null) {
      await fetch(`/api/admin/projects/${editingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    cancel();
    await load();
    setSaving(false);
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    await load();
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl p-4 animate-pulse" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
            <div className="flex gap-4">
              <div className="w-20 h-16 rounded-lg bg-[#26262B]" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 w-1/3 rounded bg-[#26262B]" />
                <div className="h-2.5 w-1/2 rounded bg-[#1f1f24]" />
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
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(59,130,246,0.1)" }}>
            <FolderOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{items.length} Projects</p>
            <p className="text-[#6B7280] text-[11px] font-mono">Manage your portfolio projects</p>
          </div>
        </div>
        {!adding && (
          <button
            onClick={() => { setEditingId(null); setAdding(true); setForm(BLANK); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold font-mono transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#00D964", color: "#0A0A0B" }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Project
          </button>
        )}
      </div>

      {adding && <ProjForm form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />}

      {items.length === 0 && !adding && (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ backgroundColor: "#16161A", border: "1px dashed #26262B" }}>
          <FolderOpen className="w-8 h-8 text-[#374151] mb-3" />
          <p className="text-white text-sm font-mono font-bold mb-1">No projects yet</p>
          <p className="text-[#6B7280] text-xs font-mono">Click "Add Project" to get started</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items.map(p =>
          editingId === p.id ? (
            <ProjForm key={p.id} form={form} onChange={setForm} onSave={save} onCancel={cancel} saving={saving} />
          ) : (
            <div
              key={p.id}
              className="rounded-xl p-4 flex items-start gap-4 transition-opacity"
              style={{ backgroundColor: "#16161A", border: "1px solid #26262B", opacity: deletingId === p.id ? 0.5 : 1 }}
            >
              {/* Thumbnail */}
              <div className="w-20 h-14 rounded-lg border border-[#26262B] flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#0A0A0B" }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <FolderOpen className="w-5 h-5 text-[#374151]" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-bold font-mono truncate">{p.name}</p>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full text-[#6B7280]" style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}>{p.year}</span>
                </div>
                <p className="text-[#6B7280] text-[11px] font-mono mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-mono text-[#6B7280] hover:text-[#00D964] transition-colors">
                      <ExternalLink className="w-3 h-3" /> Live
                    </a>
                  )}
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-mono text-[#6B7280] hover:text-white transition-colors">
                      <GitFork className="w-3 h-3" /> GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg border transition-colors" style={{ borderColor: "#26262B", color: "#6B7280" }} title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(p.id)} disabled={deletingId === p.id} className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50" title="Delete">
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
