import { auth } from "@/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Shared session/role check used by requireAdmin, requireUser, and requireRecruiter.
 * Pass allowedRoles to restrict to specific roles, or omit it to just require any
 * logged-in session.
 */
export async function requireRole(req: NextRequest, allowedRoles?: string[]) {
  const session = await auth.api.getSession({ headers: req.headers });
  const role = (session?.user as unknown as { role?: string })?.role;
  if (!session || (allowedRoles && !allowedRoles.includes(role ?? ""))) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}
