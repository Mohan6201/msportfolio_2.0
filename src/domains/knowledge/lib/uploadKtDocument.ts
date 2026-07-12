"use client";
// src/domains/knowledge/lib/uploadKtDocument.ts
// Shared client-side upload logic for KT documents, used by both the public
// KnowledgeBase upload modal and the admin KTDocumentsTab bulk uploader.
//
// Prefers a direct-to-Blob client upload (bytes go straight from the browser
// to Vercel Blob storage, never through a serverless function body) which is
// what fixes the "Network error, please try again" bug seen on mobile: the
// old flow buffered the whole PDF into /api/kt-upload via req.formData(),
// which could exceed Vercel's serverless function request body-size limit
// well under the 50MB the UI advertised, causing a non-JSON error response
// that `await res.json()` would throw on — surfacing as a misleading generic
// "network error" regardless of the real cause.
//
// Falls back to the legacy multipart route when Blob storage isn't
// configured server-side (BLOB_READ_WRITE_TOKEN unset).

import { upload } from "@vercel/blob/client";

export type KtUploadMeta = {
  title: string;
  category: string;
  level: string;
};

export type KtUploadResult = {
  filename: string;
  title: string;
  category: string;
  level: string;
};

let blobAvailableCache: boolean | null = null;

/** Cheap capability probe — only caches a definitive yes/no from the server,
 *  never a network failure, so a transient blip doesn't stick for the rest
 *  of the session. */
async function checkBlobAvailable(): Promise<boolean> {
  if (blobAvailableCache !== null) return blobAvailableCache;
  try {
    const res = await fetch("/api/kt-upload/token");
    if (!res.ok) return false;
    const data = (await res.json().catch(() => ({}))) as { available?: boolean };
    const available = Boolean(data.available);
    blobAvailableCache = available;
    return available;
  } catch {
    return false;
  }
}

async function parseJsonSafe(res: Response): Promise<Record<string, unknown>> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function finalizeBlobUpload(payload: { url: string; filename: string } & KtUploadMeta): Promise<KtUploadResult> {
  const res = await fetch("/api/kt-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Upload failed");
  return data as unknown as KtUploadResult;
}

async function legacyMultipartUpload(file: File, meta: KtUploadMeta): Promise<KtUploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("title", meta.title);
  fd.append("category", meta.category);
  fd.append("level", meta.level);
  const res = await fetch("/api/kt-upload", { method: "POST", body: fd });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Upload failed");
  return data as unknown as KtUploadResult;
}

/**
 * Uploads a KT PDF, preferring direct-to-Blob and falling back to the legacy
 * multipart route when Blob storage isn't configured. Throws a real Error
 * with a meaningful `.message` on failure — see `describeUploadError` for
 * turning that into UI copy.
 */
export async function uploadKtDocument(
  file: File,
  meta: KtUploadMeta,
  onUploadProgress?: (percentage: number) => void
): Promise<KtUploadResult> {
  const blobAvailable = await checkBlobAvailable();

  if (!blobAvailable) {
    return legacyMultipartUpload(file, meta);
  }

  const blob = await upload(`kt-documents/${file.name}`, file, {
    access: "public",
    handleUploadUrl: "/api/kt-upload/token",
    contentType: "application/pdf",
    onUploadProgress: onUploadProgress
      ? ({ percentage }) => onUploadProgress(percentage)
      : undefined,
  });

  return finalizeBlobUpload({ url: blob.url, filename: file.name, ...meta });
}

/**
 * Turns a thrown error from uploadKtDocument into a user-facing message that
 * explains WHY the upload failed, instead of always showing a generic
 * "Network error" regardless of cause.
 */
export function describeUploadError(err: unknown): string {
  if (err instanceof TypeError) {
    // fetch() throws a TypeError for genuine connectivity failures (DNS,
    // offline, CORS) — distinct from a resolved-but-non-2xx response, which
    // surfaces as a regular Error with a real server-provided message below.
    return "You appear to be offline — check your connection and try again.";
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Upload failed — please try again.";
}
