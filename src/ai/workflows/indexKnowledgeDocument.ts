import { generateText, embedMany } from "ai";
import { BACKGROUND_EXTRACT_MODEL, BACKGROUND_EMBED_MODEL, EMBED_PROVIDER_OPTIONS } from "@/ai/providers/gateway";
import { serializeEmbedding } from "@/ai/agents/embedText";
import { libsqlClient } from "@/db/client";

const CHUNK_SIZE = 400;
const CHUNK_OVERLAP = 80;

// Gemini's inline-file request body caps at 20MB total (base64 encoding inflates raw
// bytes by ~33%, plus JSON wrapping overhead) — anything larger needs the separate
// Files API (upload once, reference by URI), which this doesn't implement. Guard at a
// conservative 15MB so oversized documents fail fast with a clear, permanent reason
// instead of burning a real API call on a 400 "Request contains an invalid argument"
// that gives no hint it was actually a size problem. At least 3 of the 46 KT documents
// (up to 65MB) exceed this — they're skipped until Files API support is added.
const MAX_INLINE_FILE_BYTES = 15 * 1024 * 1024;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    if (end === text.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.length > 50);
}

export async function indexKnowledgeDocument(
  documentId: number,
  fileBytes: ArrayBuffer,
  mimeType: string
): Promise<{ chunks: number }> {
  if (fileBytes.byteLength > MAX_INLINE_FILE_BYTES) {
    throw new Error(
      `FILE_TOO_LARGE_FOR_INLINE: ${(fileBytes.byteLength / 1024 / 1024).toFixed(1)}MB exceeds the ${MAX_INLINE_FILE_BYTES / 1024 / 1024}MB inline-file limit — needs Files API support (not implemented) to index.`
    );
  }

  // Extract text from the PDF using Gemini
  const { text } = await generateText({
    model: BACKGROUND_EXTRACT_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "file", data: new Uint8Array(fileBytes), mediaType: mimeType },
          { type: "text", text: "Extract all text content from this document. Output plain text only, preserving structure with newlines. No markdown formatting." },
        ],
      },
    ],
  });

  const chunks = chunkText(text);

  // Delete any existing chunks for this document
  await libsqlClient.execute({
    sql: "DELETE FROM kt_chunks WHERE document_id = ?",
    args: [documentId],
  });

  // Batch-embed chunks instead of one call per chunk — Google's batchEmbedContents
  // endpoint actually caps at 100 texts per request (its own error message says so;
  // the SDK's maxEmbeddingsPerCall of 2048 is misleading and doesn't reflect the real
  // API limit), so split into groups of 100. The free tier's request-count quota is
  // tight enough that per-chunk embed() calls could exhaust an entire document's worth
  // of quota (or more) on one document alone, so batching still matters even capped.
  const BATCH_SIZE = 100;
  const embeddings: number[][] = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const { embeddings: batchEmbeddings } = await embedMany({
      model: BACKGROUND_EMBED_MODEL,
      values: batch,
      providerOptions: EMBED_PROVIDER_OPTIONS,
    });
    embeddings.push(...batchEmbeddings);
  }

  for (let i = 0; i < chunks.length; i++) {
    const vecJson = serializeEmbedding(embeddings[i]);
    await libsqlClient.execute({
      sql: "INSERT INTO kt_chunks (document_id, chunk_index, content, embedding) VALUES (?, ?, ?, vector32(?))",
      args: [documentId, i, chunks[i], vecJson],
    });
  }

  return { chunks: chunks.length };
}
