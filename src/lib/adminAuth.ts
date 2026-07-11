import type { NextRequest } from "next/server";
import { requireRole } from "./requireRole";

/** Call in every admin API route. Returns the session or a 401 response. */
export function requireAdmin(req: NextRequest) {
  return requireRole(req, ["owner", "admin"]);
}
