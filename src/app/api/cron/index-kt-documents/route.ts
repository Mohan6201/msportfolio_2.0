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
      try {
        const res = await fetch(doc.storage_url as string);
        if (res.ok) bytes = await res.arrayBuffer();
      } catch {
        // fall through to skip below
      }
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
