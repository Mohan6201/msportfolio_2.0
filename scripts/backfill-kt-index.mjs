#!/usr/bin/env node
// One-time backfill: indexes every kt_documents row that has no kt_chunks yet.
// Indexing has always been fire-and-forget on upload (failures only console.error'd,
// never surfaced) and the Gemini model it depended on (gemini-2.0-flash /
// text-embedding-004) was fully retired at some point before this was ever noticed —
// so as of this script, zero documents on either DB have ever been successfully
// indexed, despite AI Search existing in the UI since early in the project.
//
// Sequential by design (not Promise.all) to respect the free-tier request quota — each
// document costs 1 generateText (extraction) + 1-2 batched embedMany calls (indexing
// now batches embeddings instead of one call per chunk; see indexKnowledgeDocument.ts).
// Stops cleanly and reports progress-so-far on a real rate-limit/quota error instead of
// looping into more failures; safe to re-run afterward (already-indexed docs are skipped).
//
// This calls indexKnowledgeDocument(), which routes through GOOGLE_GENERATIVE_AI_API_KEY_
// BACKGROUND if it's set (see src/ai/providers/gateway.ts) — pass it alongside DATABASE_URL/
// TURSO_AUTH_TOKEN below so a manual run of this script also uses the isolated quota
// pool rather than the primary key real-time features depend on. The daily cron
// (/api/cron/index-kt-documents) covers ongoing catch-up automatically; this script is
// for a manual push (e.g. right after adding a bunch of new documents at once).
//
// Local (default):  node scripts/backfill-kt-index.mjs
// Production:        DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... GOOGLE_GENERATIVE_AI_API_KEY_BACKGROUND=... node scripts/backfill-kt-index.mjs

import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "file:./portfolio.db";
const authToken = process.env.TURSO_AUTH_TOKEN;
const client = createClient(authToken ? { url, authToken } : { url });

console.log(`KT index backfill — target: ${url}\n`);

const { indexKnowledgeDocument } = await import("../src/ai/workflows/indexKnowledgeDocument.ts");

const alreadyIndexed = await client.execute("SELECT DISTINCT document_id FROM kt_chunks");
const indexedIds = new Set(alreadyIndexed.rows.map((r) => Number(r.document_id)));

const docs = await client.execute(
  "SELECT id, title, filename, storage_url, file_data FROM kt_documents ORDER BY id"
);

const todo = docs.rows.filter((d) => !indexedIds.has(Number(d.id)));
console.log(`${docs.rows.length} total documents, ${indexedIds.size} already indexed, ${todo.length} to backfill.\n`);

const MAX_INLINE_FILE_BYTES = 15 * 1024 * 1024;

let succeeded = 0;
let skippedNoBytes = 0;
let skippedTooLarge = 0;
let failed = 0;

for (const doc of todo) {
  const id = Number(doc.id);
  const label = `[${id}] "${doc.title}"`;

  let bytes;
  const hasRealFileData = doc.file_data && (doc.file_data.byteLength ?? doc.file_data.length ?? 0) > 0;
  if (hasRealFileData) {
    bytes = doc.file_data instanceof ArrayBuffer ? doc.file_data : doc.file_data.buffer.slice(doc.file_data.byteOffset, doc.file_data.byteOffset + doc.file_data.byteLength);
  } else if (doc.storage_url) {
    try {
      const res = await fetch(doc.storage_url);
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      bytes = await res.arrayBuffer();
    } catch (e) {
      console.log(`⏭  ${label} — could not fetch storage_url: ${e.message}`);
      skippedNoBytes++;
      continue;
    }
  } else {
    console.log(`⏭  ${label} — no file_data or storage_url, skipping`);
    skippedNoBytes++;
    continue;
  }

  if (bytes.byteLength > MAX_INLINE_FILE_BYTES) {
    console.log(`⏭  ${label} — ${(bytes.byteLength / 1024 / 1024).toFixed(1)}MB exceeds the ${MAX_INLINE_FILE_BYTES / 1024 / 1024}MB inline-file limit, skipping (needs Files API support to index)`);
    skippedTooLarge++;
    continue;
  }

  try {
    const result = await indexKnowledgeDocument(id, bytes, "application/pdf");
    console.log(`✅ ${label} — ${result.chunks} chunks`);
    succeeded++;
  } catch (e) {
    const msg = e?.message ?? String(e);
    const isRateLimit = /quota|rate.?limit|429|RESOURCE_EXHAUSTED/i.test(msg);
    console.log(`❌ ${label} — ${msg.slice(0, 200)}`);
    failed++;
    if (isRateLimit) {
      console.log(`\n⚠️  Hit a rate limit / quota error — stopping here rather than continuing to fail.`);
      console.log(`Progress so far: ${succeeded} succeeded, ${failed} failed, ${skippedNoBytes} skipped (no bytes), ${skippedTooLarge} skipped (too large), ${todo.length - succeeded - failed - skippedNoBytes - skippedTooLarge} not yet attempted.`);
      console.log(`Safe to re-run this script later — already-indexed documents will be skipped.`);
      process.exit(1);
    }
  }

  // Pacing delay between documents regardless of outcome — each document already burns
  // through 1 extraction call + one embed call per chunk in quick succession, so RPM
  // exhaustion happens fast; give the per-minute window room to recover between docs.
  await new Promise((r) => setTimeout(r, 8000));
}

console.log(`\nDone. ${succeeded} succeeded, ${failed} failed, ${skippedNoBytes} skipped (no bytes) out of ${todo.length} attempted.`);
