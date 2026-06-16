import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { experiences } from "@/db/schema/profile";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  const { tech, responsibilities, ...rest } = await req.json();
  await db.update(experiences).set({
    ...rest,
    tech: JSON.stringify(Array.isArray(tech) ? tech : []),
    responsibilities: JSON.stringify(Array.isArray(responsibilities) ? responsibilities : []),
  }).where(eq(experiences.id, Number(id)));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  await db.delete(experiences).where(eq(experiences.id, Number(id)));
  return NextResponse.json({ ok: true });
}
