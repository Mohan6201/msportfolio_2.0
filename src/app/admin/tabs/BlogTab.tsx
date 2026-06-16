"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Plus, Trash2, Save, X, Loader2, FileText, Calendar, Clock, AlertCircle, CheckCircle2,
} from "lucide-react";

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readTime: string;
}
interface Post extends PostMeta {
  content: string;
}
interface PostDraft {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string;
  content: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const BLANK: PostDraft = {
  slug: "", title: "", description: "", date: today(), readTime: "", tags: "", content: "",
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

const label = "block text-[10px] font-mono uppercase tracking-wider text-[#6B7280] mb-1.5";
const inp =
  "w-full bg-[#0d0d0d] border border-[#26262B] rounded-lg px-3 py-2 text-[#e0e0e0] text-sm font-mono placeholder-[#3a3a3a] focus:outline-none focus:border-[#00D964]/50 transition-colors";

export function BlogTab() {
  const [items, setItems] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<PostDraft>(BLANK);
  const [selected, setSelected] = useState<string | null>(null); // slug being edited
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false); // loading a single post into editor
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const editorOpen = creating || selected !== null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/blog");
      const j = await r.json();
      setItems(j.data ?? []);
    } catch {
      setError("Failed to load posts.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const closeEditor = () => {
    setCreating(false);
    setSelected(null);
    setForm(BLANK);
    setError(null);
  };

  const startNew = () => {
    setError(null);
    setSelected(null);
    setCreating(true);
    setForm({ ...BLANK, date: today() });
  };

  const startEdit = async (slug: string) => {
    setError(null);
    setCreating(false);
    setSelected(slug);
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/blog/${slug}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Failed to load post.");
      const p = j.data as Post;
      setForm({
        slug: p.slug,
        title: p.title ?? "",
        description: p.description ?? "",
        date: p.date ?? today(),
        readTime: p.readTime ?? "",
        tags: (p.tags ?? []).join(", "),
        content: p.content ?? "",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load post.");
      setSelected(null);
    }
    setBusy(false);
  };

  const save = async () => {
    setError(null);
    const title = form.title.trim();
    if (!title) { setError("Title is required."); return; }

    const slug = (form.slug.trim() || slugify(title));
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug must contain only lowercase letters, numbers and hyphens.");
      return;
    }

    const payload = {
      slug,
      title,
      description: form.description.trim(),
      date: form.date || today(),
      readTime: form.readTime.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      content: form.content,
    };

    setSaving(true);
    try {
      const isEdit = creating === false && selected !== null;
      const url = isEdit ? `/api/admin/blog/${selected}` : "/api/admin/blog";
      const method = isEdit ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Save failed.");
      flash(isEdit ? "Post updated." : "Post created.");
      closeEditor();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    }
    setSaving(false);
  };

  const remove = async (slug: string) => {
    if (!confirm(`Delete post "${slug}"? This cannot be undone.`)) return;
    try {
      const r = await fetch(`/api/admin/blog/${slug}`, { method: "DELETE" });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error ?? "Delete failed.");
      }
      flash("Post deleted.");
      if (selected === slug) closeEditor();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  const setField = <K extends keyof PostDraft>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[#e0e0e0] text-lg font-bold font-mono">Blog Posts</h2>
          <p className="text-[#6B7280] text-xs font-mono mt-0.5">{items.length} post{items.length === 1 ? "" : "s"} in content/blog</p>
        </div>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00D964] hover:bg-[#00ff75] text-black text-xs font-bold font-mono transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> New Post
        </button>
      </div>

      {/* Banners */}
      {success && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00D964]/10 border border-[#00D964]/30 text-[#00D964] text-xs font-mono">
          <CheckCircle2 className="w-3.5 h-3.5" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[340px_1fr] gap-4">
        {/* ── Left: list ─────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-[#00D964] animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
              <FileText className="w-8 h-8 text-[#26262B]" />
              <p className="text-[#6B7280] text-xs font-mono">No posts yet</p>
            </div>
          ) : (
            items.map((p) => {
              const active = selected === p.slug;
              return (
                <button
                  key={p.slug}
                  onClick={() => startEdit(p.slug)}
                  className={`text-left rounded-xl p-3 border transition-colors ${
                    active
                      ? "bg-[#00D964]/8 border-[#00D964]/40"
                      : "bg-[#16161A] border-[#26262B] hover:border-[#00D964]/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-semibold leading-tight line-clamp-2">{p.title}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(p.slug); }}
                      className="flex-shrink-0 p-1 rounded-md text-[#6B7280] hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-[#6B7280]">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.date}</span>
                    {p.readTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{p.readTime}</span>}
                  </div>
                  {p.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.tags.slice(0, 4).map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-[#0d0d0d] border border-[#26262B] text-[#6B7280] text-[9px] font-mono">{t}</span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* ── Right: editor ──────────────────────────────── */}
        <div className="bg-[#16161A] border border-[#26262B] rounded-xl p-5 min-h-[400px]">
          {!editorOpen ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[360px] gap-3 text-center">
              <FileText className="w-10 h-10 text-[#26262B]" />
              <p className="text-[#6B7280] text-sm font-mono">Select a post to edit</p>
              <p className="text-[#3a3a3a] text-xs font-mono">or create a new one</p>
            </div>
          ) : busy ? (
            <div className="flex justify-center items-center h-full min-h-[360px]"><Loader2 className="w-6 h-6 text-[#00D964] animate-spin" /></div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[#e0e0e0] text-sm font-bold font-mono">
                  {creating ? "New Post" : `Editing: ${selected}`}
                </h3>
                <button onClick={closeEditor} className="text-[#6B7280] hover:text-[#e0e0e0] transition-colors p-1" title="Close">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className={label}>Title</label>
                <input className={inp} value={form.title} onChange={setField("title")} placeholder="My Awesome Post" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Slug {creating && <span className="text-[#3a3a3a] normal-case">(auto from title)</span>}</label>
                  <input
                    className={inp}
                    value={form.slug}
                    onChange={setField("slug")}
                    placeholder={creating && form.title ? slugify(form.title) : "my-awesome-post"}
                    disabled={!creating}
                  />
                </div>
                <div>
                  <label className={label}>Read Time</label>
                  <input className={inp} value={form.readTime} onChange={setField("readTime")} placeholder="5 min read" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Date</label>
                  <input type="date" className={inp} value={form.date} onChange={setField("date")} />
                </div>
                <div>
                  <label className={label}>Tags (comma-separated)</label>
                  <input className={inp} value={form.tags} onChange={setField("tags")} placeholder="nextjs, devops, ci/cd" />
                </div>
              </div>

              <div>
                <label className={label}>Description</label>
                <textarea className={`${inp} resize-y min-h-[70px]`} value={form.description} onChange={setField("description")} placeholder="Short summary shown in listings and meta tags." />
              </div>

              <div>
                <label className={label}>Content (Markdown / MDX)</label>
                <textarea
                  className={`${inp} resize-y min-h-[320px] leading-relaxed`}
                  value={form.content}
                  onChange={setField("content")}
                  placeholder={"## Heading\n\nWrite your post in markdown..."}
                  spellCheck={false}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00D964] hover:bg-[#00ff75] text-black text-xs font-bold font-mono disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {creating ? "Create Post" : "Save Changes"}
                </button>
                {!creating && selected && (
                  <button
                    onClick={() => remove(selected)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-mono transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
                <button
                  onClick={closeEditor}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#26262B] text-[#6B7280] hover:text-[#e0e0e0] hover:border-[#3a3a3a] text-xs font-mono transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
