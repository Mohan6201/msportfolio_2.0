// src/app/api/kt-upload/route.ts
// SECURITY FIX: added requireAdmin auth — only admins can upload KT documents
//
// This route now serves two purposes, dispatched by Content-Type:
//
// 1. JSON body ({ url, filename, title, category, level }) — the "finalize"
//    path used after the client uploads a PDF directly to Vercel Blob via
//    /api/kt-upload/token (see that file). The bytes never pass through this
//    function; this just persists metadata and kicks off indexing. This is
//    the path that fixes the mobile "Network error" bug: the old flow
//    buffered the entire file into this serverless function via
//    req.formData()/file.arrayBuffer(), which could exceed Vercel's request
//    body-size limit well before the 50MB the UI advertised, causing a
//    non-JSON (HTML 413/504) response that the client's `await res.json()`
//    would throw on.
//
// 2. multipart/form-data body (file + title + category + level) — the
//    legacy full-buffer path, kept as a fallback for environments where
//    BLOB_READ_WRITE_TOKEN isn't configured (client-side direct-to-Blob
//    upload isn't possible without it, so the client falls back to this).

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { ktDocuments } from "@/db/schema/legacy";
import { indexKnowledgeDocument } from "@/ai/workflows/indexKnowledgeDocument";
import { requireAdmin } from "@/lib/adminAuth";
import { KT_CATEGORIES } from "@/domains/knowledge/lib/categories";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Reference"];

function isValidCategory(category: string): boolean {
  return (KT_CATEGORIES as readonly string[]).includes(category);
}

/** JSON finalize path: blob already exists, we just persist metadata + index it. */
async function finalizeFromBlobUrl(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as {
    url?: string;
    filename?: string;
    title?: string;
    category?: string;
    level?: string;
  };

  const url = body.url;
  const filename = body.filename;
  const title = body.title?.trim();
  const category = body.category ?? "DevOps";
  const level = body.level ?? "Reference";

  if (!url || !filename || !title) {
    return NextResponse.json({ error: "url, filename and title are required" }, { status: 400 });
  }
  if (!filename.endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }
  if (!isValidCategory(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!LEVELS.includes(level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }

  // Fetch the blob back so it can be indexed for AI search. This is an
  // outbound fetch from the function to Blob storage — not an inbound
  // request body — so it isn't subject to the platform request-body-size
  // limit that caused the original bug. Indexing is best-effort: if this
  // fetch fails we still persist the document, just without AI search.
  let arrayBuffer: ArrayBuffer | null = null;
  try {
    const blobRes = await fetch(url);
    if (blobRes.ok) arrayBuffer = await blobRes.arrayBuffer();
  } catch (e) {
    console.error("KT upload: failed to fetch blob for indexing:", e);
  }

  const fileSize = arrayBuffer?.byteLength ?? 0;

  const rows = await db
    .insert(ktDocuments)
    .values({
      title,
      filename,
      category,
      level,
      fileData: undefined,
      fileSize,
      storageUrl: url,
    })
    .onConflictDoUpdate({
      target: ktDocuments.filename,
      set: {
        title,
        category,
        level,
        fileData: undefined,
        fileSize,
        storageUrl: url,
      },
    })
    .returning({ id: ktDocuments.id });

  const docId = rows[0]?.id;

  if (docId && arrayBuffer && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    indexKnowledgeDocument(docId, arrayBuffer, "application/pdf").catch((e) =>
      console.error("KT index error:", e)
    );
  }

  return NextResponse.json({ ok: true, filename, title, category, level });
}

/** Legacy multipart path: buffers the whole file into this function. Only
 *  used when BLOB_READ_WRITE_TOKEN isn't configured. */
async function legacyMultipartUpload(req: NextRequest): Promise<NextResponse> {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null)?.trim();
  const category = (formData.get("category") as string | null) ?? "DevOps";
  const level = (formData.get("level") as string | null) ?? "Reference";

  if (!file || !title) return NextResponse.json({ error: "file and title are required" }, { status: 400 });
  if (!file.name.endsWith(".pdf")) return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 50 MB)" }, { status: 400 });
  if (!isValidCategory(category)) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  if (!LEVELS.includes(level)) return NextResponse.json({ error: "Invalid level" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  let storageUrl: string | null = null;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`kt-documents/${file.name}`, Buffer.from(arrayBuffer), {
      access: "public",
      contentType: "application/pdf",
    });
    storageUrl = blob.url;
  }

  const rows = await db
    .insert(ktDocuments)
    .values({
      title,
      filename: file.name,
      category,
      level,
      fileData: storageUrl ? undefined : Buffer.from(arrayBuffer),
      fileSize: file.size,
      storageUrl,
    })
    .onConflictDoUpdate({
      target: ktDocuments.filename,
      set: {
        title,
        category,
        level,
        fileData: storageUrl ? undefined : Buffer.from(arrayBuffer),
        fileSize: file.size,
        storageUrl,
      },
    })
    .returning({ id: ktDocuments.id });

  const docId = rows[0]?.id;

  if (docId && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    indexKnowledgeDocument(docId, arrayBuffer, "application/pdf").catch((e) =>
      console.error("KT index error:", e)
    );
  }

  return NextResponse.json({ ok: true, filename: file.name, title, category, level });
}

export async function POST(req: NextRequest) {
  // 🔒 Admin-only — prevents arbitrary users from uploading PDFs
  const { error } = await requireAdmin(req);
  if (error) return error;

  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      return await finalizeFromBlobUrl(req);
    }
    return await legacyMultipartUpload(req);
  } catch (err) {
    console.error("KT upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
