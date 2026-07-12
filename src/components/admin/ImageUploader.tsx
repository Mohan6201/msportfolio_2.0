// src/components/admin/ImageUploader.tsx
// NEW FILE — reusable image upload + preview component used across all admin tabs
// Drop or click to upload, shows preview, returns URL to parent

"use client";
import { useRef, useState } from "react";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface Props {
  value: string;           // current URL (from DB)
  onChange: (url: string) => void;
  folder?: string;         // blob subfolder: "certifications" | "projects" | "profile" etc
  label?: string;
  className?: string;
}

export function ImageUploader({ value, onChange, folder = "uploads", label = "Image", className = "" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) upload(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-[11px] text-[#6B7280] font-mono uppercase tracking-widest">{label}</label>

      <div className="flex gap-3 items-start">
        {/* Preview */}
        <div
          className="w-16 h-16 rounded-lg border border-[#26262B] flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: "#0A0A0B" }}
        >
          {value ? (
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-[#374151]" />
          )}
        </div>

        {/* Drop zone */}
        <div
          className="flex-1 rounded-lg border border-dashed cursor-pointer transition-colors"
          style={{
            borderColor: dragging ? "#00D964" : "#26262B",
            backgroundColor: dragging ? "rgba(0,217,100,0.04)" : "#0A0A0B",
            padding: "10px 14px",
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#00D964]" />
              <span className="text-xs font-mono text-[#6B7280]">Uploading…</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#374151]" />
              <span className="text-xs font-mono text-[#6B7280]">
                Drop image or <span className="text-[#00D964]">click to upload</span>
              </span>
            </div>
          )}
          <p className="text-[10px] font-mono mt-1" style={{ color: "#374151" }}>
            JPEG · PNG · WebP · GIF · max 5 MB
          </p>
        </div>

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1.5 rounded-lg border border-[#26262B] text-[#6B7280] hover:text-red hover:border-red/30 transition-colors flex-shrink-0"
            title="Remove image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Manual URL input fallback */}
      <input
        type="url"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Or paste image URL directly"
        className="w-full rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-[#374151] focus:outline-none focus:ring-2 focus:ring-cyan/60 transition-colors"
        style={{ backgroundColor: "#0A0A0B", border: "1px solid #26262B" }}
      />

      {error && <p className="text-[11px] font-mono text-red">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
