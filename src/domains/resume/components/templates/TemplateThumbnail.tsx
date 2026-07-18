"use client";

import { useEffect, useRef, useState } from "react";
import { SAMPLE_RESUME_DATA } from "@/domains/resume/lib/sampleResumeData";
import type { TemplateKey, TEMPLATES } from "./index";

/**
 * Renders a real, live, scaled-down instance of an actual template component — replacing what
 * used to be a fake thumbnail (a colored bar + 3 gray placeholder lines that never resembled
 * the template itself). Always renders against the fixed SAMPLE_RESUME_DATA, never the user's
 * real resumeData, so every thumbnail looks identical for every visitor regardless of upload
 * state — the picker is for choosing a look, not previewing your own content (that's what the
 * live preview panel is for once a template is selected).
 *
 * Scaling technique is the same ResizeObserver + virtual-viewport + transform-scale pattern as
 * LiveProjectPreview.tsx, just at a page-width virtual size instead of a desktop-width one —
 * rendering at a fixed real width and scaling down avoids the template falling into some
 * unintended narrow-width layout the way a naive `width: 100%` render would.
 */
const PAGE_WIDTH_PX = 816; // US Letter @ 96dpi

export default function TemplateThumbnail({
  templateKey,
  component: TemplateComponent,
}: {
  templateKey: TemplateKey;
  component: (typeof TEMPLATES)[number]["component"];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Lazy-mount: 7 thumbnails means 7 fully-rendered template trees painting at once in a narrow
  // sidebar grid — cheap insurance on low-end mobile to only render the ones actually visible.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = containerSize.w > 0 ? containerSize.w / PAGE_WIDTH_PX : 0.2;
  // Thumbnails only ever show the top slice of the template (like a book cover, not the full
  // page) — a fixed virtual height rather than deriving it from the container keeps every
  // thumbnail showing a comparable amount of content regardless of a template's true full length.
  const VIRTUAL_HEIGHT_PX = 1000;

  return (
    <div ref={containerRef} data-template-thumbnail={templateKey} className="absolute inset-0 overflow-hidden bg-[#fff]">
      {inView && containerSize.w > 0 && (
        <div
          className="absolute top-0 left-0 origin-top-left pointer-events-none"
          style={{ width: PAGE_WIDTH_PX, height: VIRTUAL_HEIGHT_PX, transform: `scale(${scale})` }}
        >
          <TemplateComponent data={SAMPLE_RESUME_DATA} />
        </div>
      )}
      {(!inView || containerSize.w === 0) && (
        <div className="absolute inset-0 animate-pulse bg-gray-100" aria-hidden />
      )}
    </div>
  );
}
