// Runs each attempt in order, returning the first success. Built after discovering (via a
// direct REST call, not a guess) that gemini-flash-latest was returning a raw Google-side 503
// "experiencing high demand" -- a real outage of that specific alias, not a quota problem on
// either API key. The AI SDK's own generateObject/generateText already retry the SAME model on
// a transient error; this is for the case that retrying didn't cover: the model itself is down
// and no amount of retrying it will help, but a different model alias might still work. Takes
// thunks (not model params directly) so it's usable with generateObject, generateText, or
// anything else with a comparable failure mode.
export async function withFallback<T>(attempts: Array<() => Promise<T>>): Promise<T> {
  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
