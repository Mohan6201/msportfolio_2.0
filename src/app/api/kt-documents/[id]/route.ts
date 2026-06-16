import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { ktDocuments } from "@/db/schema/legacy";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await db
      .select({
        filename: ktDocuments.filename,
        fileData: ktDocuments.fileData,
        storageUrl: ktDocuments.storageUrl,
      })
      .from(ktDocuments)
      .where(eq(ktDocuments.id, Number(id)));

    const doc = rows[0];
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // If stored in Vercel Blob, redirect there
    if (doc.storageUrl) {
      return NextResponse.redirect(doc.storageUrl);
    }

    // Serve from legacy DB blob
    const raw = doc.fileData as unknown;
    if (!raw) return NextResponse.json({ error: "No file data" }, { status: 404 });
    const buffer = Buffer.isBuffer(raw)
      ? raw
      : raw instanceof Uint8Array
        ? Buffer.from(raw)
        : Buffer.from(raw as ArrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${doc.filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("KT doc fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 404 });
  }
}
