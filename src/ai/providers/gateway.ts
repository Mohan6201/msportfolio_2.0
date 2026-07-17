import { google, createGoogleGenerativeAI } from "@ai-sdk/google";

// gemini-2.0-flash's free tier was reduced to 0 RPM/TPM/RPD at some point after this
// was first wired up (confirmed via https://aistudio.google.com/rate-limit) — every
// AI feature site-wide was silently failing with a Gemini quota error. gemini-2.5-flash
// and text-embedding-004 are both fully retired now too ("no longer available to new
// users" / 404). gemini-flash-latest itself then started returning a raw 503
// "This model is currently experiencing high demand" — confirmed via a direct REST call
// against the primary key, the background key, AND plain generateText (no schema, no
// file), so it's a genuine Google-side outage of that alias, not a quota issue on either
// key. gemini-flash-lite-latest is a separate self-updating alias that was responding
// 200 (verified with both generateText and a generateObject schema call) when
// gemini-flash-latest was down — still avoids the "dated model retires" problem, and the
// lite tier tends to have more available capacity than the full flash model during a
// demand spike like this one.
const MODEL_ID = "gemini-flash-lite-latest";
const EMBED_MODEL_ID = "gemini-embedding-001";

// Real-time, visitor-facing traffic: chat widget, resume ATS/tailor/cover-letter,
// career advisor, interview grading, job match scoring. Uses the primary API key.
export const CHAT_MODEL = google(MODEL_ID);
export const EXTRACT_MODEL = google(MODEL_ID);
export const EMBED_MODEL = google.textEmbeddingModel(EMBED_MODEL_ID);

// Background/batch work: KT document indexing (upload-triggered and the catch-up
// cron). Deliberately routed through a SEPARATE Google AI Studio project/API key so a
// bulk operation can never exhaust the quota real-time visitor features depend on —
// each free-tier project gets its own independent daily quota. Falls back to the
// primary key if a dedicated one isn't configured, so nothing breaks if it's unset;
// it just loses the isolation until GOOGLE_GENERATIVE_AI_API_KEY_BACKGROUND is added.
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
