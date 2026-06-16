"use client";
import type { ResumeVersion } from "@/domains/resume/services/resume.service";

export default function VersionList({
  versions,
  currentVersionId,
  onSelect,
}: {
  versions: ResumeVersion[];
  currentVersionId: number;
  onSelect: (v: ResumeVersion) => void;
}) {
  if (versions.length === 0) {
    return <p className="text-lightGrey text-xs font-mono">No versions yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {versions.map((v) => (
        <button
          key={v.id}
          onClick={() => onSelect(v)}
          className={`text-left px-4 py-3 rounded-lg border transition-colors ${
            v.id === currentVersionId
              ? "border-cyan/50 bg-cyan/10 text-cyan"
              : "border-white/10 text-lightGrey hover:border-white/30 hover:text-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold">v{v.versionNumber}</span>
            {v.id === currentVersionId && (
              <span className="text-[10px] bg-cyan/20 text-cyan px-2 py-0.5 rounded-full font-mono">current</span>
            )}
          </div>
          <p className="text-xs font-mono text-lightGrey/60 mt-0.5">
            {new Date(v.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
          {v.sourceFileUrl && (
            <p className="text-[10px] font-mono text-lightGrey/40 mt-0.5">from upload</p>
          )}
        </button>
      ))}
    </div>
  );
}
