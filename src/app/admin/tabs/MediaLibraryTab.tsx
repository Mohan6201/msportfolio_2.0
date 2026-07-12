"use client";
import { useCallback, useEffect, useState } from "react";
import { Images, Copy, Trash2, Loader2, Check, ExternalLink, RefreshCw } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

type BlobItem = { url: string; pathname: string; size: number; uploadedAt: string };

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function getFolder(pathname: string) {
  const parts = pathname.split("/");
  return parts.length > 1 ? parts[0] : "uploads";
}

export function MediaLibraryTab() {
  const [blobs,      setBlobs]      = useState<BlobItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [copiedUrl,  setCopiedUrl]  = useState<string | null>(null);
  const [deletingUrl,setDeletingUrl]= useState<string | null>(null);
  const [filter,     setFilter]     = useState("all");
  const [uploadUrl,  setUploadUrl]  = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/media");
      const j = await r.json();
      setBlobs(Array.isArray(j.blobs) ? j.blobs : []);
    } catch { setBlobs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  async function deleteBlob(url: string) {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    setDeletingUrl(url);
    try {
      await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      setBlobs(prev => prev.filter(b => b.url !== url));
    } finally { setDeletingUrl(null); }
  }

  const folders = ["all", ...Array.from(new Set(blobs.map(b => getFolder(b.pathname))))];
  const filtered = filter === "all" ? blobs : blobs.filter(b => getFolder(b.pathname) === filter);
  const images   = filtered.filter(b => /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(b.pathname));

  const totalSize = blobs.reduce((s, b) => s + b.size, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(251,191,36,0.1)" }}>
            <Images className="w-4 h-4 text-[#fbbf24]" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Media Library</p>
            <p className="text-[#6B7280] text-[11px] font-mono">{blobs.length} files · {formatSize(totalSize)} total</p>
          </div>
        </div>
        <button onClick={load} className="p-2 rounded-lg border text-[#6B7280] hover:text-white transition-colors"
          style={{ borderColor: "#26262B" }}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Upload new image */}
      <div className="rounded-xl p-5" style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
        <p className="text-white font-bold text-xs mb-3">Upload New Image</p>
        <ImageUploader
          value={uploadUrl}
          onChange={url => { setUploadUrl(url); if (url) setTimeout(load, 500); }}
          folder="media"
          label="Upload to Media Library"
        />
      </div>

      {/* Folder filter */}
      {folders.length > 2 && (
        <div className="flex gap-2 flex-wrap">
          {folders.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-[11px] font-mono px-3 py-1 rounded-full border transition-colors capitalize"
              style={filter === f
                ? { backgroundColor: "#00D964", color: "#0A0A0B", borderColor: "#00D964" }
                : { backgroundColor: "#0A0A0B", color: "#6B7280", borderColor: "#26262B" }}>
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl animate-pulse aspect-square" style={{ backgroundColor: "#16161A" }} />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl" style={{ backgroundColor: "#16161A", border: "1px dashed #26262B" }}>
          <Images className="w-8 h-8 text-[#374151] mb-3" />
          <p className="text-white text-sm font-mono font-bold mb-1">No images yet</p>
          <p className="text-[#6B7280] text-xs font-mono">Upload images above — they'll appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map(blob => (
            <div key={blob.url} className="group rounded-xl overflow-hidden relative"
              style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}>
              {/* Image */}
              <div className="aspect-square overflow-hidden" style={{ backgroundColor: "#0A0A0B" }}>
                <img src={blob.url} alt={blob.pathname} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              </div>
              {/* Overlay on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
                <button onClick={() => copyUrl(blob.url)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: copiedUrl === blob.url ? "#00D964" : "#16161A", border: "1px solid #26262B" }}
                  title="Copy URL">
                  {copiedUrl === blob.url
                    ? <Check className="w-4 h-4 text-black" />
                    : <Copy className="w-4 h-4 text-white" />}
                </button>
                <a href={blob.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: "#16161A", border: "1px solid #26262B" }}
                  title="Open">
                  <ExternalLink className="w-4 h-4 text-white" />
                </a>
                <button onClick={() => deleteBlob(blob.url)} disabled={deletingUrl === blob.url}
                  className="p-2 rounded-lg border border-red/30 transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
                  title="Delete">
                  {deletingUrl === blob.url
                    ? <Loader2 className="w-4 h-4 text-red animate-spin" />
                    : <Trash2 className="w-4 h-4 text-red" />}
                </button>
              </div>
              {/* Footer */}
              <div className="px-3 py-2">
                <p className="text-white text-[10px] font-mono truncate">{blob.pathname.split("/").pop()}</p>
                <p className="text-[#6B7280] text-[9px] font-mono mt-0.5">{formatSize(blob.size)} · {formatDate(blob.uploadedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
