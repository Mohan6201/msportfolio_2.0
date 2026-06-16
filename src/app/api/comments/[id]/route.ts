import { NextRequest, NextResponse } from "next/server";
import { setCommentApproval, deleteComment } from "@/db/queries";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  const { approved } = await req.json();
  await setCommentApproval(Number(id), approved ? 1 : 0);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await params;
  await deleteComment(Number(id));
  return NextResponse.json({ ok: true });
}
