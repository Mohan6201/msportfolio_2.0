import { google } from "@ai-sdk/google";

export const CHAT_MODEL = google("gemini-2.0-flash");
export const EXTRACT_MODEL = google("gemini-2.0-flash");
export const EMBED_MODEL = google.textEmbeddingModel("text-embedding-004");

// Vector dimension must match every F32_BLOB(n) column — never change without a migration.
export const EMBED_DIMENSIONS = 768;
