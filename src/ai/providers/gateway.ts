import { google, createGoogleGenerativeAI } from "@ai-sdk/google";

// gemini-2.0-flash's free tier was reduced to 0 RPM/TPM/RPD at some point after this
// was first wired up (confirmed via https://aistudio.google.com/rate-limit) — every
// AI feature site-wide was silently failing with a Gemini quota error. gemini-2.5-flash
// and text-embedding-004 are both fully retired now too ("no longer available to new
// users" / 404). gemini-flash-latest is Google's self-updating alias for the current
// recommended flash model, which avoids this exact breakage recurring every time Google
// retires a dated model name.
const MODEL_ID = "gemini-flash-latest";
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
