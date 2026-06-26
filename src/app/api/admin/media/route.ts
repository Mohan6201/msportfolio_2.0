// src/app/api/admin/media/route.ts
// NEW FILE — lists all uploaded images from Vercel Blob

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ blobs: [], cursor: null });
  }

  try {
    const { list } = await import("@vercel/blob");
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") ?? undefined;

    const result = await list({ limit: 50, cursor, mode: "folded" });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { url } = await req.json() as { url: string };
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    const { del } = await import("@vercel/blob");
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
