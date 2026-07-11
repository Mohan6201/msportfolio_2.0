"use client";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink, Minimize2, Maximize2, Loader2, FileText, AlertTriangle } from "lucide-react";

interface PDFViewerState {
  open: boolean;
  url: string;
  title: string;
  pip: boolean;
}

interface PDFViewerContextValue {
  openPDF: (url: string, title: string) => void;
  closePDF: () => void;
}

const PDFViewerContext = createContext<PDFViewerContextValue>({
  openPDF: () => {},
  closePDF: () => {},
});

export function usePDFViewer() {
  return useContext(PDFViewerContext);
}

function ViewerModal({ state, onClose, onTogglePip }: {
  state: PDFViewerState;
  onClose: () => void;
  onTogglePip: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [pipPos, setPipPos] = useState({ x: 24, y: 24 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLoaded(false); setTimedOut(false); }, [state.url]);

  // Browser download managers (IDM etc.) and some content blockers silently intercept
  // embedded PDF requests — the iframe's onLoad never fires and the spinner spins forever.
  useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, [loaded, state.url]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!state.pip) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pipPos.x, origY: pipPos.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      setPipPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
    };
    const onUp = () => { dragRef.current = null; document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [state.pip, pipPos]);

  if (state.pip) {
    return (
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        style={{ position: "fixed", right: pipPos.x, bottom: pipPos.y, zIndex: 9999, width: 360, height: 480 }}
        className="rounded-2xl overflow-hidden border border-cyan/20 shadow-2xl shadow-cyan/10 flex flex-col bg-[#0a0f1a]"
      >
        {/* PiP header — drag handle */}
        <div
          onMouseDown={onMouseDown}
          className="flex items-center gap-2 px-3 py-2 bg-black/80 border-b border-white/5 cursor-grab active:cursor-grabbing select-none shrink-0"
        >
          <FileText className="w-3.5 h-3.5 text-cyan shrink-0" />
          <span className="text-xs font-mono text-white/80 truncate flex-1">{state.title}</span>
          <button onClick={onTogglePip} className="w-5 h-5 flex items-center justify-center text-lightGrey hover:text-cyan transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onClose} className="w-5 h-5 flex items-center justify-center text-lightGrey hover:text-red-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="relative flex-1 bg-[#1a1a1a]">
          {!loaded && !timedOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1a] z-10">
              <Loader2 className="w-6 h-6 text-cyan animate-spin" />
            </div>
          )}
          {!loaded && timedOut && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0f1a] z-10 px-4 text-center">
              <AlertTriangle className="w-5 h-5 text-orange" />
              <p className="text-[11px] font-mono text-lightGrey/60">Preview blocked — try opening directly</p>
              <a href={state.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan text-black text-[11px] font-mono font-bold hover:bg-lightCyan transition-colors">
                <ExternalLink className="w-3 h-3" /> Open in New Tab
              </a>
            </div>
          )}
          <iframe src={state.url} className="w-full h-full border-0" onLoad={() => setLoaded(true)} title={state.title} />
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9998]"
        onClick={onClose}
      />

      {/* Main modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed inset-4 sm:inset-8 md:inset-12 z-[9999] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan/10 flex flex-col bg-[#05080f]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-black/40 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono font-medium text-white truncate">{state.title}</p>
            <p className="text-[10px] font-mono text-lightGrey/40 mt-0.5">PDF Document Viewer</p>
          </div>
          <div className="flex items-center gap-1.5">
            <a href={state.url} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-lightGrey hover:text-cyan hover:border-cyan/30 transition-all">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a href={state.url} download
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-lightGrey hover:text-green hover:border-green/30 transition-all">
              <Download className="w-3.5 h-3.5" />
            </a>
            <button onClick={onTogglePip}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-lightGrey hover:text-orange hover:border-orange/30 transition-all"
              title="Picture-in-Picture mode">
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <div className="relative flex-1 bg-[#1a1a1a]">
          {!loaded && !timedOut && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#05080f] z-10">
              <Loader2 className="w-8 h-8 text-cyan animate-spin" />
              <p className="text-xs font-mono text-lightGrey/50">Loading document...</p>
            </div>
          )}
          {!loaded && timedOut && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#05080f] z-10 px-6 text-center">
              <AlertTriangle className="w-7 h-7 text-orange" />
              <div>
                <p className="text-sm font-mono text-white font-medium">Preview is taking longer than expected</p>
                <p className="text-xs font-mono text-lightGrey/50 mt-1.5 max-w-xs">
                  A browser extension or download manager may be blocking the embedded preview.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a href={state.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan text-black text-xs font-mono font-bold hover:bg-lightCyan transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                </a>
                <a href={state.url} download
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 text-lightGrey text-xs font-mono hover:border-cyan/40 hover:text-cyan transition-all">
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            </div>
          )}
          <iframe
            src={state.url}
            className="w-full h-full border-0"
            onLoad={() => setLoaded(true)}
            title={state.title}
          />
        </div>
      </motion.div>
    </>
  );
}

export function PDFViewerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PDFViewerState>({ open: false, url: "", title: "", pip: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const openPDF = useCallback((url: string, title: string) => {
    setState({ open: true, url, title, pip: false });
  }, []);

  const closePDF = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const togglePip = useCallback(() => {
    setState((s) => ({ ...s, pip: !s.pip }));
  }, []);

  return (
    <PDFViewerContext.Provider value={{ openPDF, closePDF }}>
      {children}
      {mounted && createPortal(
        <AnimatePresence>
          {state.open && (
            <ViewerModal
              key="pdf-viewer"
              state={state}
              onClose={closePDF}
              onTogglePip={togglePip}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </PDFViewerContext.Provider>
  );
}
