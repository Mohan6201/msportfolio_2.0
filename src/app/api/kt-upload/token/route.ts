// src/app/api/kt-upload/token/route.ts
// Token-generation handshake for client-side direct-to-Blob uploads.
// The browser calls @vercel/blob/client's upload() against this route, which
// hands back a short-lived token so the PDF bytes go straight from the
// browser to Blob storage — never through this (or any) serverless function
// body, which is what caused the mobile "Network error" bug on large PDFs
// (see src/app/api/kt-upload/route.ts for the full explanation).

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { BLOB_NOT_CONFIGURED_CODE } from "@/domains/knowledge/lib/blobUpload";

/**
 * Cheap capability probe the client calls before attempting a direct-to-Blob
 * upload. NOTE: @vercel/blob/client's upload() does not surface this route's
 * JSON error body when the POST handshake fails — it throws a generic
 * `BlobError("Failed to retrieve the client token")` regardless of cause —
 * so a distinguishable inline error code on the POST response (as originally
 * planned) can't actually be read by the client. This GET probe is checked
 * explicitly instead, before upload() is ever called.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { error } = await requireAdmin(request);
  if (error) return error;

  return NextResponse.json({ available: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { error } = await requireAdmin(request);
  if (error) return error;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage not configured", code: BLOB_NOT_CONFIGURED_CODE },
      { status: 501 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["application/pdf"],
        maximumSizeInBytes: 50 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      // Do NOT rely on onUploadCompleted for the DB insert — Vercel's async
      // webhook callback cannot reach a localhost dev server, so anything
      // load-bearing here would silently never run in local dev. Leave
      // onUploadCompleted unset; the client explicitly calls the JSON
      // finalize path on /api/kt-upload after upload() resolves instead.
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
