"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Renders a live, scaled-down iframe preview of a project's real URL in the same
 * panel as the project card, falling back to a static screenshot when the target
 * site can't be embedded (blocked via X-Frame-Options/CSP, offline, or too slow).
 *
 * `embeddable` is decided server-side (see src/lib/checkEmbeddable.ts) since a
 * cross-origin iframe's load event fires whether or not the content actually
 * rendered — client JS alone can't tell the difference reliably.
 */
export default function LiveProjectPreview({
  liveUrl,
  embeddable,
  fallbackImageUrl,
  alt,
}: {
  liveUrl: string;
  embeddable: boolean;
  fallbackImageUrl: string;
  alt: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!embeddable);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // Only start loading the iframe once the card actually scrolls into view.
  useEffect(() => {
    if (!embeddable || failed) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [embeddable, failed]);

  // The iframe is rendered at a fixed desktop-width "virtual viewport" and scaled down to fit
  // the card, rather than at ~2x the card's own (small) width — a narrow render width makes many
  // sites fall into their mobile/tablet breakpoint (oversized centered hero text, stacked nav),
  // which reads as a "zoomed in" crop instead of the compact desktop layout a screenshot would
  // normally show. Tracking the card's real rendered size via ResizeObserver keeps the scale
  // correct across the grid's responsive column counts (1/2/3/4 cols).
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

  // Safety net: if the iframe never signals load within a few seconds, fall back to the screenshot.
  useEffect(() => {
    if (!inView || failed || loaded) return;
    const timer = setTimeout(() => setFailed(true), 6000);
    return () => clearTimeout(timer);
  }, [inView, failed, loaded]);

  const showLive = embeddable && !failed && inView;

  // Render at a realistic desktop width; height follows so the visible slice matches the
  // card's own aspect ratio exactly (no letterboxing/cropping surprises when scaled down).
  const VIRTUAL_WIDTH = 1440;
  const scale = containerSize.w > 0 ? containerSize.w / VIRTUAL_WIDTH : 0.5;
  const virtualHeight = containerSize.h > 0 && scale > 0 ? containerSize.h / scale : VIRTUAL_WIDTH * (9 / 16);

  return (
    // Raw black throughout this component, not the theme's `black` token (which is white in
    // light mode) — this is a scrim/placeholder behind a photo or live embed, not page chrome,
    // so it needs to stay dark regardless of the site's own light/dark theme.
    <div ref={containerRef} className="absolute inset-0 bg-[#000]/20">
      {showLive && containerSize.w > 0 && (
        <iframe
          src={liveUrl}
          title={`Live preview of ${alt}`}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          className="pointer-events-none border-0 absolute top-0 left-0 origin-top-left"
          style={{ width: VIRTUAL_WIDTH, height: virtualHeight, transform: `scale(${scale})` }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {!showLive && (
        <Image
          src={fallbackImageUrl}
          alt={alt}
          fill
          sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      )}
      {showLive && !loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#000]/40 backdrop-blur-sm">
          <span className="text-xs font-mono text-[#7a8fa6] animate-pulse">Loading live preview…</span>
        </div>
      )}
    </div>
  );
}
