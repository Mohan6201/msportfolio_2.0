import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { ktDocuments } from "@/db/schema/legacy";
import { requireAdmin } from "@/lib/adminAuth";

/** GET — list all KT documents (metadata only, never the fileData blob). */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const docs = await db
      .select({
        id: ktDocuments.id,
        title: ktDocuments.title,
        filename: ktDocuments.filename,
        category: ktDocuments.category,
        level: ktDocuments.level,
        fileSize: ktDocuments.fileSize,
        storageUrl: ktDocuments.storageUrl,
        uploadedAt: ktDocuments.uploadedAt,
      })
      .from(ktDocuments)
      .orderBy(desc(ktDocuments.uploadedAt));

    return NextResponse.json({ docs });
  } catch (err) {
    console.error("Admin KT docs list error:", err);
    return NextResponse.json({ error: "Failed to list documents" }, { status: 500 });
  }
}
