"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink, FileText, Loader2 } from "lucide-react";

const PDF_URL = "/assets/Mohana Srinivasan (Resume).pdf";

export default function ResumePreview() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-cyan" />
          </div>
          <div>
            <p className="text-sm font-mono text-white font-medium leading-none">Mohana_Srinivasan_Resume.pdf</p>
            <p className="text-xs font-mono text-lightGrey/50 mt-0.5">AWS DevOps Engineer · 2 pages</p>
          </div>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green/10 border border-green/20 text-green text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-lightGrey text-xs font-mono hover:border-cyan/40 hover:text-cyan transition-all duration-200"
          >
            <ExternalLink className="w-3 h-3" />
            Open
          </a>
          <a
            href={PDF_URL}
            download="Mohana_Srinivasan_Resume.pdf"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan text-black text-xs font-mono font-bold hover:bg-lightCyan transition-colors shadow-cyanShadow"
          >
            <Download className="w-3 h-3" />
            Download
          </a>
        </div>
      </div>

      {/* PDF frame */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan/5 bg-[#1a1a1a]" style={{ height: "880px" }}>
        {/* Loading overlay */}
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-[#1a1a1a]">
            <Loader2 className="w-7 h-7 text-cyan animate-spin" />
            <p className="text-xs font-mono text-lightGrey/60">Loading resume...</p>
          </div>
        )}

        <iframe
          src={PDF_URL}
          title="Mohana Srinivasan Resume"
          className="w-full h-full border-0"
          onLoad={() => setLoaded(true)}
        />
      </div>

      {/* Fallback for mobile / unsupported browsers */}
      <p className="text-center text-xs font-mono text-lightGrey/40 mt-4">
        PDF not rendering?{" "}
        <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="text-cyan hover:text-lightCyan transition-colors">
          Open in new tab →
        </a>
      </p>
    </div>
  );
}
