import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { socialLinks } from "@/db/schema/profile";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  await db.update(socialLinks).set(body).where(eq(socialLinks.id, Number(id)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  await db.delete(socialLinks).where(eq(socialLinks.id, Number(id)));
  return NextResponse.json({ ok: true });
}
