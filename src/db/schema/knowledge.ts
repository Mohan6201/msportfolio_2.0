import { integer, sqliteTable, text, blob } from "drizzle-orm/sqlite-core";

// kt_chunks rows are inserted via raw SQL using vector32() for the embedding.
// This Drizzle schema is used only for typed selects (content/metadata).
export const ktChunks = sqliteTable("kt_chunks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  content: text("content").notNull(),
  // embedding stored as F32_BLOB(768) via raw DDL — Drizzle sees it as blob
  embedding: blob("embedding"),
});
