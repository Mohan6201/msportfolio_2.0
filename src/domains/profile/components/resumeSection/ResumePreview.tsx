"use client";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { AlertTriangle, Download, ExternalLink, FileText, Loader2, Minimize2 } from "lucide-react";
import { usePDFViewer } from "@/components/ui/PDFViewer";

// Self-hosted worker (copied from node_modules on every install by scripts/copy-pdf-worker.mjs)
// so the version always matches the installed pdfjs-dist exactly — a mismatch throws at runtime.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.mjs";

interface ResumePreviewProps {
  pdfUrl: string;
}

const ZOOM_LEVELS = [75, 100, 125, 150];

export default function ResumePreview({ pdfUrl }: ResumePreviewProps) {
  const { openPDF } = usePDFViewer();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [zoom, setZoom] = useState(100);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // Renders via PDF.js canvas instead of an <iframe> — the embedded-PDF approach used previously
  // rendered inconsistently (or not at all) on mobile browsers, so mobile got a "tap to view
  // externally" card instead of an actual preview. Canvas rendering doesn't depend on the
  // device's native PDF viewer, so this works the same way on every screen size.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Browser download managers (IDM etc.) and some content blockers silently intercept the PDF
  // request — guard against that hanging the loading state forever.
  useEffect(() => {
    if (status !== "loading") return;
    const t = setTimeout(() => setStatus((s) => (s === "loading" ? "error" : s)), 8000);
    return () => clearTimeout(t);
  }, [status, pdfUrl]);

  const pageWidth = containerWidth ? (containerWidth * zoom) / 100 : undefined;

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
            <p className="text-xs font-mono text-lightGrey/50 mt-0.5">
              AWS DevOps Engineer{numPages ? ` · ${numPages} page${numPages > 1 ? "s" : ""}` : ""}
            </p>
          </div>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green/10 border border-green/20 text-green text-xs font-mono flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Live
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {ZOOM_LEVELS.map((z) => (
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

      {/* Preview pane — same canvas renderer on every screen size */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan/5 bg-black"
      >
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="w-7 h-7 text-cyan animate-spin" />
            <p className="text-xs font-mono text-lightGrey/60">Loading resume...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
            <AlertTriangle className="w-7 h-7 text-orange" />
            <div>
              <p className="text-sm font-mono text-white font-medium">Preview is taking longer than expected</p>
              <p className="text-xs font-mono text-lightGrey/50 mt-1.5 max-w-xs">
                A browser extension or download manager may be blocking the preview.
                Open the PDF directly instead:
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan text-black text-xs font-mono font-bold hover:bg-lightCyan transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
              </a>
              <a
                href={pdfUrl}
                download="Mohana_Srinivasan_Resume.pdf"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 text-lightGrey text-xs font-mono hover:border-cyan/40 hover:text-cyan transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          </div>
        )}

        <div
          className="overflow-auto"
          style={{ maxHeight: "80vh", display: status === "ready" ? "block" : "none" }}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages: n }) => { setNumPages(n); setStatus("ready"); }}
            onLoadError={() => setStatus("error")}
            loading={null}
            error={null}
          >
            {containerWidth > 0 &&
              Array.from({ length: numPages ?? 0 }, (_, i) => (
                <Page
                  key={i}
                  pageNumber={i + 1}
                  width={pageWidth}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="mx-auto [&:not(:last-child)]:mb-2"
                />
              ))}
          </Document>
        </div>
      </div>

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
