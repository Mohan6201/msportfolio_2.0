import { NextRequest, NextResponse } from "next/server";
import { getKTDocumentFile } from "@/db/queries";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await getKTDocumentFile(Number(id));
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const raw = doc.file_data as unknown;
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
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}
