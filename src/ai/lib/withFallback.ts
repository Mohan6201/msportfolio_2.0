// Runs each attempt in order, returning the first success. Originally built after discovering
// (via a direct REST call, not a guess) that gemini-flash-latest was returning a raw
// Google-side 503 "experiencing high demand" -- a real outage of that specific alias, not a
// quota problem on either API key. The AI SDK's own generateObject/generateText already retry
// the SAME model on a transient error; this is for the case that retrying didn't cover: the
// model itself is down and no amount of retrying it will help, but a different model/provider
// might still work. Takes thunks (not model params directly) so it's usable with
// generateObject, generateText, or anything else with a comparable failure mode.
//
// Per-attempt timeout added after a real incident on the free Groq/OpenRouter stack: one
// OpenRouter free-tier model hung for 2+ minutes on a real resume-PDF request before its own
// gateway returned a 504, blocking the whole upload behind a single slow tier instead of
// failing fast into the next one. Free-tier inference capacity is shared/best-effort, so a
// hang (not just an error) has to be treated as a normal failure mode here, not an edge case.
// 18s (not 25s): every route calling into this has `export const maxDuration = 60` on Vercel,
// and every call site here uses a 3-tier chain — 3×25s=75s would blow past that ceiling on a
// worst-case run where every tier hangs, while 3×18s=54s leaves headroom for DB writes and
// other route overhead.
const DEFAULT_TIMEOUT_MS = 18_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`withFallback: attempt timed out after ${ms}ms`)), ms);
    }),
  ]);
}

export async function withFallback<T>(
  attempts: Array<() => Promise<T>>,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  let lastError: unknown;
  let i = 0;
  for (const attempt of attempts) {
    const idx = i++;
    const t0 = Date.now();
    try {
      const result = await withTimeout(attempt(), timeoutMs);
      // Only log when a fallback tier actually had to fire — tier-0 success is the normal
      // case and would just be noise every request. A tier >0 success or any failure is the
      // signal worth having in logs: it's the only way to see the free-tier stack degrading
      // before it fully breaks.
      if (idx > 0) console.log(`[withFallback] tier ${idx} succeeded in ${Date.now() - t0}ms (earlier tier(s) failed)`);
      return result;
    } catch (err) {
      // Message only, never `cause`/`text` — those can carry the raw prompt or model output,
      // which for this app's callers means real user PII (resume contents, names, emails).
      console.log(`[withFallback] tier ${idx} FAILED after ${Date.now() - t0}ms:`, err instanceof Error ? err.message : err);
      lastError = err;
    }
  }
  throw lastError;
}
