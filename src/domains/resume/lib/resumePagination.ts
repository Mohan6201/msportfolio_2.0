// Pure pagination logic, kept out of the React component (mirrors instantAtsScore.ts's existing
// convention of keeping business logic in lib/, independently testable without rendering
// anything). Computes where page breaks should fall given a page height and the measured
// {top, bottom} of every repeating entry (experience/education/cert/project — anything wrapped
// in <ResumeBlock>, see templates/ResumeBlock.tsx).
//
// This is deliberately NOT naive `Math.ceil(totalHeight / pageHeight)` slicing — that would crop
// a bullet or an entire entry in half in the on-screen preview. `break-inside: avoid` (also on
// ResumeBlock) stops that in the real printed PDF, but that CSS only governs the browser's print
// engine, not this JS math, so the preview needs its own break-aware logic to actually match.
export type BlockRect = { top: number; bottom: number };

/**
 * Returns the Y-offset (px, relative to the measured content's own top) where each page starts.
 * `pageBreaks[0]` is always 0; `pageBreaks.length` is the real page count.
 */
export function computePageBreaks(blocks: BlockRect[], pageHeightPx: number): number[] {
  if (blocks.length === 0 || pageHeightPx <= 0) return [0];

  const breaks: number[] = [0];
  let pageStart = 0;

  for (const block of blocks) {
    const blockHeight = block.bottom - block.top;

    // A block taller than a full page can never fit no matter where a page starts — give it
    // its own page and let it overflow, rather than trying to force-split it.
    if (blockHeight > pageHeightPx) {
      if (block.top > pageStart) {
        pageStart = block.top;
        breaks.push(pageStart);
      }
      continue;
    }

    // Would this block overflow the current page? Start a new one at its top.
    if (block.bottom - pageStart > pageHeightPx) {
      pageStart = block.top;
      breaks.push(pageStart);
    }
  }

  return breaks;
}

/** Reads every [data-resume-block] element's position relative to `root`'s own top edge. */
export function measureBlockRects(root: HTMLElement): BlockRect[] {
  const rootTop = root.getBoundingClientRect().top;
  const nodes = root.querySelectorAll<HTMLElement>("[data-resume-block]");
  return Array.from(nodes).map((node) => {
    const rect = node.getBoundingClientRect();
    return { top: rect.top - rootTop, bottom: rect.bottom - rootTop };
  });
}
