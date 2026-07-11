// src/app/api/admin/upload-image/route.ts
// NEW FILE — centralized image upload for certifications, projects, profile avatar
// Saves to Vercel Blob, returns public URL
// Admin-only, validates file type + size

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
// SVG intentionally excluded: it can embed <script>/event-handler payloads (stored-XSS risk
// if ever rendered inline rather than downloaded), and file.type is client-declared, not
// content-sniffed, so a proper fix would need real sanitization rather than an allowlist entry.
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string | null) ?? "uploads";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, GIF allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
  }

  // Sanitize folder to prevent path traversal
  const safeFolder = folder.replace(/[^a-zA-Z0-9-_]/g, "");
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Blob storage not configured" }, { status: 503 });
  }

  const { put } = await import("@vercel/blob");
  const blob = await put(safeName, file, {
    access: "public",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
