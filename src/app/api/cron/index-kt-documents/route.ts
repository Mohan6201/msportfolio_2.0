import { NextRequest, NextResponse } from "next/server";
import { libsqlClient } from "@/db/client";
import { indexKnowledgeDocument } from "@/ai/workflows/indexKnowledgeDocument";

// Called daily by Vercel Cron — see vercel.json. Indexes a small, fixed batch of
// KT documents that have no kt_chunks yet, instead of the one-off manual backfill
// (scripts/backfill-kt-index.mjs) trying to do all of them in one run and hitting
// the daily quota wall after a handful of documents. Self-throttling: runs a bit
// every day until caught up, then naturally becomes a no-op once nothing's left.
export const maxDuration = 60;

const BATCH_SIZE = 5;

// Mirrors the retry added to scripts/backfill-kt-index.mjs after seeing the same
// TypeError: fetch failed / connect-timeout flakiness there — a bare fetch failure
// shouldn't permanently skip a document that's actually fine. Kept short (2 attempts,
// 1.5s backoff) since maxDuration is only 60s and there's still AI work to do per doc.
async function fetchDocBytes(url: string): Promise<ArrayBuffer | null> {
  const MAX_ATTEMPTS = 2;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.arrayBuffer();
      return null; // real HTTP error, not a transient network failure — don't retry
    } catch {
      if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await libsqlClient.execute(`
    SELECT kd.id, kd.title, kd.storage_url, kd.file_data
    FROM kt_documents kd
    LEFT JOIN (SELECT DISTINCT document_id FROM kt_chunks) kc ON kc.document_id = kd.id
    WHERE kc.document_id IS NULL
    ORDER BY kd.id
    LIMIT ${BATCH_SIZE}
  `);

  let succeeded = 0;
  let failed = 0;
  let skippedNoBytes = 0;
  let skippedTooLarge = 0;
  let stoppedOnQuota = false;
  const errors: string[] = [];

  for (const doc of pending.rows) {
    const id = Number(doc.id);
    const fileData = doc.file_data as ArrayBuffer | null;
    const hasRealFileData = fileData && fileData.byteLength > 0;

    let bytes: ArrayBuffer | null = null;
    if (hasRealFileData) {
      bytes = fileData;
    } else if (doc.storage_url) {
      bytes = await fetchDocBytes(doc.storage_url as string);
    }

    if (!bytes) {
      skippedNoBytes++;
      continue;
    }

    try {
      await indexKnowledgeDocument(id, bytes, "application/pdf");
      succeeded++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith("FILE_TOO_LARGE_FOR_INLINE")) {
        skippedTooLarge++;
        continue; // permanent, non-retryable — don't count as a failure or trip the quota check
      }
      failed++;
      errors.push(`[${id}] ${msg.slice(0, 150)}`);
      if (/quota|rate.?limit|429|RESOURCE_EXHAUSTED/i.test(msg)) {
        stoppedOnQuota = true;
        break; // don't keep burning requests once the background key is out for today
      }
    }
  }

  return NextResponse.json({
    ok: true,
    batchSize: pending.rows.length,
    succeeded,
    failed,
    skippedNoBytes,
    skippedTooLarge,
    stoppedOnQuota,
    errors,
  });
}
