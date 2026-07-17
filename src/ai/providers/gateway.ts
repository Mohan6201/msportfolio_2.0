import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Real-time, visitor-facing traffic (chat widget, resume ATS/tailor/cover-letter, career
// advisor, interview grading, job match scoring) runs on a free, open-weight model stack —
// no billing, no API key cost. Two independent providers/infra so a full outage of one
// doesn't take down every AI feature at once (this replaced a Gemini-only setup after a
// gemini-flash-latest outage broke resume upload site-wide). Groq: free tier, no card,
// fast LPU inference. OpenRouter: free ":free"-suffixed models, no card, genuinely
// separate infrastructure/company for real cross-provider resilience.
const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

// Text/JSON tasks. gpt-oss is OpenAI's open-weight release — of everything on Groq's free
// tier, only gpt-oss-120b/20b guarantee schema-valid structured output (confirmed against
// Groq's own structured-outputs docs). Every model here was individually verified against
// the live free-tier APIs before being picked, not just checked against docs/catalogs —
// several plausible-looking candidates (qwen3-next-80b:free, both Gemma variants,
// openrouter's gpt-oss-20b:free mirror) turned out to time out, hit balance errors, or return
// unparseable output in practice despite looking fine on paper.
export const TEXT_MODEL = groq("openai/gpt-oss-120b");
export const TEXT_MODEL_FALLBACK_1 = groq("openai/gpt-oss-20b");
// Groq's strict/guaranteed structured-output mode rejects any schema with a genuinely optional
// field (OpenAI-style strict JSON Schema requires every property to be listed in `required`,
// which this codebase's idiomatic Zod `.optional()` fields don't satisfy) — confirmed this
// isn't specific to gpt-oss-20b, gpt-oss-120b rejects the same schemas the same way. Pass this
// at every Groq call site (both TEXT_MODEL and TEXT_MODEL_FALLBACK_1) to force best-effort mode.
// Best-effort mode doesn't enforce the schema at the decoding level, so the prompt itself needs
// to spell out the exact expected JSON shape for anything beyond a trivially flat schema —
// confirmed by direct testing: the same model produced a plausible but wrong-shaped JSON object
// (invented its own field names) when the prompt only said "extract into structured JSON",
// and produced a correctly-shaped one once the prompt listed the exact keys.
export const GROQ_BEST_EFFORT_OPTIONS = { groq: { structuredOutputs: false } };
// Different lab AND different infra (OpenRouter, not Groq) for genuine resilience against a
// Groq-wide outage, not just a Groq model-level one.
export const TEXT_MODEL_FALLBACK_2 = openrouter.chat("nvidia/nemotron-3-nano-30b-a3b:free");

// --- KT Centre document embeddings + indexing (unchanged, still Gemini) ---
// Separate concern from the real-time agents above: different quota-isolation setup
// (dedicated background API key), not implicated in the outage that prompted this
// migration, so left as-is rather than folded into the open-weight stack.
const MODEL_ID = "gemini-flash-lite-latest";
const EMBED_MODEL_ID = "gemini-embedding-001";
export const EMBED_MODEL = google.textEmbeddingModel(EMBED_MODEL_ID);

const backgroundProvider = process.env.GOOGLE_GENERATIVE_AI_API_KEY_BACKGROUND
  ? createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY_BACKGROUND })
  : google;

export const BACKGROUND_EXTRACT_MODEL = backgroundProvider(MODEL_ID);
export const BACKGROUND_EMBED_MODEL = backgroundProvider.textEmbeddingModel(EMBED_MODEL_ID);

// Vector dimension must match every F32_BLOB(n) column — never change without a migration.
// gemini-embedding-001 natively outputs 3072 dims; pass EMBED_PROVIDER_OPTIONS to embed()
// to truncate it down to this via the API's outputDimensionality parameter instead.
export const EMBED_DIMENSIONS = 768;
export const EMBED_PROVIDER_OPTIONS = { google: { outputDimensionality: EMBED_DIMENSIONS } };
