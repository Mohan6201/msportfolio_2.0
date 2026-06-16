import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/adminAuth";

// Roles an admin/owner is allowed to assign. "owner" is intentionally excluded —
// ownership can never be granted through this endpoint.
const ASSIGNABLE_ROLES = ["admin", "user", "recruiter"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { role?: string };
  const role = body.role;

  if (!role || !ASSIGNABLE_ROLES.includes(role as AssignableRole)) {
    return NextResponse.json(
      { error: `Invalid role. Allowed: ${ASSIGNABLE_ROLES.join(", ")}` },
      { status: 400 },
    );
  }

  // Never allow demoting/altering an existing owner via this route.
  const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, id));
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.role === "owner") {
    return NextResponse.json({ error: "Cannot modify an owner account" }, { status: 403 });
  }

  await db
    .update(users)
    .set({ role: role as AssignableRole, updatedAt: new Date() })
    .where(eq(users.id, id));

  return NextResponse.json({ ok: true, id, role });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireAdmin(req);
  if (error) return error;

  const { id } = await params;

  // Guard: never delete yourself, and never delete an owner.
  const selfId = (session?.user as unknown as { id?: string })?.id;
  if (selfId && selfId === id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, id));
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.role === "owner") {
    return NextResponse.json({ error: "Cannot delete an owner account" }, { status: 403 });
  }

  await db.delete(users).where(eq(users.id, id));

  return NextResponse.json({ ok: true, id });
}
