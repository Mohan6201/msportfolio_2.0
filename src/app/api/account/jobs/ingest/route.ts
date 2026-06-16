import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
import { requireUser } from "@/lib/accountAuth";
import { getPreferences } from "@/domains/accounts/services/accounts.service";
import { ingestJobPostings } from "@/ai/workflows/ingestJobPostings";

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const prefs = await getPreferences(session!.user.id);
  function safeArr(v: string | null | undefined): string[] {
    try { return v ? JSON.parse(v) : []; } catch { return []; }
  }
  const targetRoles: string[] = prefs ? safeArr(prefs.targetRoles) : [];
  const locations: string[] = prefs ? safeArr(prefs.preferredLocations) : [];

  const result = await ingestJobPostings(targetRoles, locations);
  return NextResponse.json(result);
}
