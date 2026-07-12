import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { ktDocuments } from "@/db/schema/legacy";
import { requireAdmin } from "@/lib/adminAuth";
import { KT_CATEGORIES } from "@/domains/knowledge/lib/categories";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Reference"];

/** DELETE — remove a KT document by id. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await db.delete(ktDocuments).where(eq(ktDocuments.id, numId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin KT doc delete error:", err);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}

/** PATCH — update title, category and/or level for a KT document. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = (await req.json()) as { title?: string; category?: string; level?: string };
    const updates: { title?: string; category?: string; level?: string } = {};

    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim();
    }
    if (typeof body.category === "string") {
      if (!(KT_CATEGORIES as readonly string[]).includes(body.category)) {
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
      }
      updates.category = body.category;
    }
    if (typeof body.level === "string") {
      if (!LEVELS.includes(body.level)) {
        return NextResponse.json({ error: "Invalid level" }, { status: 400 });
      }
      updates.level = body.level;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    await db.update(ktDocuments).set(updates).where(eq(ktDocuments.id, numId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Admin KT doc update error:", err);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}
