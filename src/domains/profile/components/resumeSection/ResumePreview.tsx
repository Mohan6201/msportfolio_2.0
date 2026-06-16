"use client";
import { useState } from "react";
import Image from "next/image";
import { Download, ExternalLink, FileText, Loader2, Minimize2, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { usePDFViewer } from "@/components/ui/PDFViewer";

interface ResumePreviewProps {
  pdfUrl: string;
}

const PREVIEW_PAGES = [
  { src: "/resume/preview-1.png", label: "Page 1 — Profile & Experience" },
  { src: "/resume/preview-2.png", label: "Page 2 — Skills & Projects" },
];

function MobilePreview({ pdfUrl }: { pdfUrl: string }) {
  const [page, setPage] = useState(0);
  const { openPDF } = usePDFViewer();

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#1a1a1a] shadow-xl">
        <div className="relative w-full" style={{ aspectRatio: "1 / 1.414" }}>
          <Image
            src={PREVIEW_PAGES[page].src}
            alt={PREVIEW_PAGES[page].label}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Page overlay controls */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 bg-gradient-to-t from-black/80 to-transparent">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 hover:border-cyan/40 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-white/70">
            {page + 1} / {PREVIEW_PAGES.length}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(PREVIEW_PAGES.length - 1, p + 1))}
            disabled={page === PREVIEW_PAGES.length - 1}
            className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-white disabled:opacity-30 hover:border-cyan/40 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Expand button */}
        <button
          onClick={() => openPDF(pdfUrl, "Mohana Srinivasan — Resume")}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-white hover:border-cyan/40 transition-all"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-center text-[11px] font-mono text-lightGrey/40">
        {PREVIEW_PAGES[page].label}
      </p>
    </div>
  );
}

function DesktopPreview({ pdfUrl }: { pdfUrl: string }) {
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(100);
  const { openPDF } = usePDFViewer();

  const zoomLevels = [75, 100, 125, 150];

  return (
    <div className="flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="flex items-center justify-end gap-1">
        {zoomLevels.map((z) => (
          <button
            key={z}
            onClick={() => setZoom(z)}
            className={`px-2 py-1 text-[10px] font-mono rounded transition-all ${
              zoom === z
                ? "bg-cyan text-black font-bold"
                : "text-lightGrey/60 hover:text-cyan hover:bg-cyan/5 border border-white/5"
            }`}
          >
            {z}%
          </button>
        ))}
        <span className="w-px h-4 bg-white/10 mx-1" />
        <button
          onClick={() => openPDF(pdfUrl, "Mohana Srinivasan — Resume")}
          className="px-2 py-1 text-[10px] font-mono text-orange hover:text-orange/80 border border-orange/20 hover:bg-orange/5 rounded transition-all flex items-center gap-1"
        >
          <Minimize2 className="w-2.5 h-2.5" /> PiP
        </button>
      </div>

      {/* PDF iframe */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan/5 bg-[#1a1a1a]"
        style={{ height: "900px" }}
      >
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-[#1a1a1a]">
            <Loader2 className="w-7 h-7 text-cyan animate-spin" />
            <p className="text-xs font-mono text-lightGrey/60">Loading resume...</p>
          </div>
        )}

        <div
          className="w-full h-full overflow-auto"
          style={{ padding: zoom > 100 ? "8px" : 0 }}
        >
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=${zoom}`}
            title="Mohana Srinivasan Resume"
            className="border-0 block"
            style={{
              width: `${zoom}%`,
              height: "100%",
              minHeight: "880px",
              minWidth: zoom > 100 ? `${zoom}%` : "100%",
              transformOrigin: "top left",
            }}
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}

export default function ResumePreview({ pdfUrl }: ResumePreviewProps) {
  const { openPDF } = usePDFViewer();

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 px-1 gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-cyan" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-mono text-white font-medium leading-none truncate">
              Mohana_Srinivasan_Resume.pdf
            </p>
            <p className="text-xs font-mono text-lightGrey/50 mt-0.5">AWS DevOps Engineer · 2 pages</p>
          </div>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green/10 border border-green/20 text-green text-xs font-mono flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Live
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => openPDF(pdfUrl, "Mohana Srinivasan — Resume")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange/30 text-orange text-xs font-mono hover:bg-orange/10 transition-all duration-200"
            title="Open in PiP viewer"
          >
            <Minimize2 className="w-3 h-3" />
            PiP
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-lightGrey text-xs font-mono hover:border-cyan/40 hover:text-cyan transition-all duration-200"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Open</span>
          </a>
          <a
            href={pdfUrl}
            download="Mohana_Srinivasan_Resume.pdf"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan text-black text-xs font-mono font-bold hover:bg-lightCyan transition-colors shadow-cyanShadow"
          >
            <Download className="w-3 h-3" />
            Download
          </a>
        </div>
      </div>

      {/* Mobile: image pages */}
      <div className="block md:hidden">
        <MobilePreview pdfUrl={pdfUrl} />
      </div>

      {/* Desktop: iframe */}
      <div className="hidden md:block">
        <DesktopPreview pdfUrl={pdfUrl} />
      </div>

      {/* Bottom fallback */}
      <p className="text-center text-xs font-mono text-lightGrey/40 mt-4">
        PDF not rendering?{" "}
        <button
          onClick={() => openPDF(pdfUrl, "Mohana Srinivasan — Resume")}
          className="text-orange hover:text-orange/80 transition-colors"
        >
          Open PiP viewer
        </button>
        {" · "}
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-cyan hover:text-lightCyan transition-colors">
          Open in new tab →
        </a>
      </p>
    </div>
  );
}
