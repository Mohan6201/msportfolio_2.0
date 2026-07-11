import type { NextRequest } from "next/server";
import { requireRole } from "./requireRole";

/** Call in every account (logged-in user) API route. Returns the session or a 401 response. */
export function requireUser(req: NextRequest) {
  return requireRole(req);
}
