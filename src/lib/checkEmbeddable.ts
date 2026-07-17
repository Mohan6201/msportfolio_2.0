import { setDefaultResultOrder } from "node:dns";

/**
 * Server-side check for whether a project's live URL can be embedded in an <iframe>.
 *
 * Client-side JS cannot reliably detect an X-Frame-Options / CSP frame-ancestors block on a
 * cross-origin iframe (the load event fires either way), so the decision is made here, server-side,
 * by inspecting the actual response headers before we ever render an iframe tag. This avoids ever
 * showing a blank/broken embed to a recruiter — if we're not sure it will render, we fall back to
 * the static screenshot instead.
 */

// Vercel's serverless runtime resolves external hostnames IPv6-first and stalls until timeout
// on hosts that don't answer cleanly over IPv6 (same root cause as the documented Turso
// connectivity flakiness from this environment) — every project fetch was timing out and
// silently falling back to the screenshot. Forcing IPv4 first fixes it.
setDefaultResultOrder("ipv4first");

const SITE_HOSTS = ["m-s-r-portfolio.vercel.app", "localhost"];

type CacheEntry = { value: boolean; ts: number };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours — resets on cold start, which is fine, it's just an optimization

export async function checkEmbeddable(url: string | null | undefined): Promise<boolean> {
  if (!url || url === "#" || !url.startsWith("http")) return false;

  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }

  // Never embed the site's own live URL inside itself — that would recursively
  // embed the projects section of the embedded page, which embeds itself, forever.
  if (SITE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return false;

  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached.value;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    const xfo = (res.headers.get("x-frame-options") ?? "").toLowerCase();
    const csp = (res.headers.get("content-security-policy") ?? "").toLowerCase();

    const blocked =
      xfo.includes("deny") ||
      xfo.includes("sameorigin") ||
      (csp.includes("frame-ancestors") && !csp.includes("frame-ancestors *"));

    const result = !blocked;
    cache.set(url, { value: result, ts: Date.now() });
    console.log(`[checkEmbeddable] ${url} -> ${result} (status=${res.status} xfo="${xfo}" csp-frame-ancestors=${csp.includes("frame-ancestors")})`);
    return result;
  } catch (err) {
    // Timed out, network error, or the site is down — safest default is the static screenshot.
    cache.set(url, { value: false, ts: Date.now() });
    console.log(`[checkEmbeddable] ${url} -> false (ERROR: ${err instanceof Error ? err.name + ": " + err.message : String(err)})`);
    return false;
  }
}
