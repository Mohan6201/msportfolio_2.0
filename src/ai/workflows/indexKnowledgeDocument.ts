import { generateText } from "ai";
import { EXTRACT_MODEL } from "@/ai/providers/gateway";
import { embedText, serializeEmbedding } from "@/ai/agents/embedText";
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
          { type: "file", data: new Uint8Array(fileBytes), mimeType },
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

  // Embed and insert each chunk
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i]);
    const vecJson = serializeEmbedding(embedding);
    await libsqlClient.execute({
      sql: "INSERT INTO kt_chunks (document_id, chunk_index, content, embedding) VALUES (?, ?, ?, vector32(?))",
      args: [documentId, i, chunks[i], vecJson],
    });
  }

  return { chunks: chunks.length };
}
