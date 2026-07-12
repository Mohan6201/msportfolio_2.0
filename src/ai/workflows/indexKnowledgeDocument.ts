import { generateText, embedMany } from "ai";
import { EXTRACT_MODEL, EMBED_MODEL, EMBED_PROVIDER_OPTIONS } from "@/ai/providers/gateway";
import { serializeEmbedding } from "@/ai/agents/embedText";
import { libsqlClient } from "@/db/client";

const CHUNK_SIZE = 400;
const CHUNK_OVERLAP = 80;

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
  // Extract text from the PDF using Gemini
  const { text } = await generateText({
    model: EXTRACT_MODEL,
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
      model: EMBED_MODEL,
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
