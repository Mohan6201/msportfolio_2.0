import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getPreferences } from "@/domains/accounts/services/accounts.service";
import { ingestJobPostings } from "@/ai/workflows/ingestJobPostings";

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const prefs = await getPreferences(session!.user.id);
  const targetRoles: string[] = prefs ? JSON.parse(prefs.targetRoles) : [];
  const locations: string[] = prefs ? JSON.parse(prefs.preferredLocations) : [];

  const result = await ingestJobPostings(targetRoles, locations);
  return NextResponse.json(result);
}
