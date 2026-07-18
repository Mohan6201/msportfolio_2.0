"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import type { TEMPLATES } from "./templates";
import { computePageBreaks, measureBlockRects } from "@/domains/resume/lib/resumePagination";

// US Letter @ 96dpi — matches the print rule added to globals.css (`@page { size: letter }`).
const PAGE_WIDTH_PX = 816;
const PAGE_HEIGHT_PX = 1056;
const PAGE_GAP_PX = 28;

/**
 * A genuinely paginated, responsive live preview — replacing what used to be one continuously
 * scrolling div at a hardcoded `transform: scale(0.85)` with no page boundaries at all, and 4 of
 * the 7 templates hardcoding fake "Page 1 of 2"-style footer text that never reflected real
 * content length.
 *
 * Technique: render one hidden, full-height "measurer" instance of the template to find where
 * every <ResumeBlock> entry actually sits (see resumePagination.ts — this is break-boundary-
 * aware, not naive height-slicing, so an entry never gets visibly cropped in half at a page
 * edge). Render that many "page frame" divs, each an overflow-hidden window onto one absolutely-
 * positioned copy of the same template, shifted up by that page's break offset. The whole stack
 * scales responsively to fit any viewport width via the same ResizeObserver + virtual-width
 * technique already proven in LiveProjectPreview.tsx.
 *
 * This is a close approximation of what `window.print()` actually produces, not a pixel-exact
 * replica — different browsers round print margins/fonts slightly differently, a normal
 * limitation of any screen-rendered "page preview" (Reactive Resume's own print-preview iframe
 * has the same caveat). Worth knowing, not worth chasing further.
 */
export default function PaginatedResumePreview({
  component: TemplateComponent,
  data,
}: {
  component: (typeof TEMPLATES)[number]["component"];
  data: ResumeData;
}) {
  const measurerRef = useRef<HTMLDivElement>(null);
  const outerContainerRef = useRef<HTMLDivElement>(null);
  const [pageBreaks, setPageBreaks] = useState<number[]>([0]);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const remeasure = useCallback(() => {
    const el = measurerRef.current;
    if (!el) return;
    const blocks = measureBlockRects(el);
    setPageBreaks(computePageBreaks(blocks, PAGE_HEIGHT_PX));
    setContentHeight(el.getBoundingClientRect().height);
  }, []);

  // Re-measure whenever the template or resume data actually changes. Gated on document.fonts
  // being ready plus one animation frame before trusting layout — all 7 templates currently use
  // system font stacks (no webfonts), so this is low-risk today, but it's free insurance against
  // a future template adding one and silently shifting measured heights after the first paint.
  useEffect(() => {
    let cancelled = false;
    const fontsReady = typeof document !== "undefined" && document.fonts?.ready
      ? document.fonts.ready
      : Promise.resolve();
    fontsReady.then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => {
        if (!cancelled) remeasure();
      });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TemplateComponent, data]);

  // Also watch the measurer's own height directly, in case content shifts after the initial
  // paint for reasons unrelated to the props changing (e.g. a slow-loading resource).
  useEffect(() => {
    const el = measurerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => remeasure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [remeasure]);

  // Responsive scale — identical technique to LiveProjectPreview.tsx, just against a page-width
  // virtual viewport instead of a desktop-width one. Never scales up past 100%: a resume page
  // rendered oversized on a huge monitor looks broken, not "more readable".
  useEffect(() => {
    const el = outerContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const numberOfPages = pageBreaks.length;
  const scale = containerWidth > 0 ? Math.min(containerWidth / PAGE_WIDTH_PX, 1) : 0.5;
  const stackHeight = numberOfPages * PAGE_HEIGHT_PX + (numberOfPages - 1) * PAGE_GAP_PX;

  return (
    <div className="w-full">
      {/* Hidden measurer: visibility:hidden (not display:none, so layout still computes; also
          correctly excludes it from the accessibility tree and tab order, unlike opacity:0). */}
      <div
        style={{ position: "absolute", top: 0, left: -99999, width: PAGE_WIDTH_PX, visibility: "hidden", pointerEvents: "none" }}
        aria-hidden
      >
        <div ref={measurerRef}>
          <TemplateComponent data={data} />
        </div>
      </div>

      <div ref={outerContainerRef} className="w-full flex justify-center">
        <div style={{ width: PAGE_WIDTH_PX * scale, height: stackHeight * scale }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAGE_WIDTH_PX }}>
            {pageBreaks.map((breakY, i) => {
              // A page-frame's `overflow:hidden` only clips at its OWN fixed height
              // (PAGE_HEIGHT_PX) — it has no idea where the *next* page's break falls, so any
              // unused space at the bottom of a shorter page would otherwise show the next
              // page's content bleeding through underneath it. usedHeight is how much of this
              // frame is genuinely this page's own content; a white mask covers the rest.
              const pageContentEnd = i < numberOfPages - 1 ? pageBreaks[i + 1] : contentHeight;
              const usedHeight = Math.max(0, Math.min(pageContentEnd - breakY, PAGE_HEIGHT_PX));
              return (
                <div
                  key={i}
                  className="relative overflow-hidden bg-[#fff] shadow-2xl"
                  style={{
                    width: PAGE_WIDTH_PX,
                    height: PAGE_HEIGHT_PX,
                    marginBottom: i < numberOfPages - 1 ? PAGE_GAP_PX : 0,
                  }}
                >
                  <div style={{ position: "absolute", top: -breakY, left: 0, width: PAGE_WIDTH_PX }}>
                    <TemplateComponent data={data} />
                  </div>
                  {usedHeight < PAGE_HEIGHT_PX && (
                    <div
                      className="absolute left-0 right-0 bottom-0 bg-[#fff]"
                      style={{ top: usedHeight }}
                      aria-hidden
                    />
                  )}
                  <div
                    className="absolute bottom-2 right-3 text-[9px] font-mono px-1.5 py-0.5 rounded"
                    style={{ color: "#6B7280", backgroundColor: "rgba(255,255,255,0.85)" }}
                  >
                    Page {i + 1} of {numberOfPages}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
