import type { NextRequest } from "next/server";
import { requireRole } from "./requireRole";

/** Call in every recruiter-accessible API route. Returns the session or a 401 response. */
export function requireRecruiter(req: NextRequest) {
  return requireRole(req, ["owner", "admin", "recruiter"]);
}
