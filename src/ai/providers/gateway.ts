import { google } from "@ai-sdk/google";

// gemini-2.0-flash's free tier was reduced to 0 RPM/TPM/RPD at some point after this
// was first wired up (confirmed via https://aistudio.google.com/rate-limit) — every
// AI feature site-wide was silently failing with a Gemini quota error. gemini-2.5-flash
// and text-embedding-004 are both fully retired now too ("no longer available to new
// users" / 404). gemini-flash-latest is Google's self-updating alias for the current
// recommended flash model, which avoids this exact breakage recurring every time Google
// retires a dated model name.
export const CHAT_MODEL = google("gemini-flash-latest");
export const EXTRACT_MODEL = google("gemini-flash-latest");
export const EMBED_MODEL = google.textEmbeddingModel("gemini-embedding-001");

// Vector dimension must match every F32_BLOB(n) column — never change without a migration.
// gemini-embedding-001 natively outputs 3072 dims; pass EMBED_PROVIDER_OPTIONS to embed()
// to truncate it down to this via the API's outputDimensionality parameter instead.
export const EMBED_DIMENSIONS = 768;
export const EMBED_PROVIDER_OPTIONS = { google: { outputDimensionality: EMBED_DIMENSIONS } };
