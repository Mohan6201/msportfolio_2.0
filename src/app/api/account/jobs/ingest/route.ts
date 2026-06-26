// src/app/api/account/jobs/ingest/route.ts
// FIX 2b: Pass userId to ingestJobPostings so auto-scoring works
// REPLACE entire file

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getPreferences } from "@/domains/accounts/services/accounts.service";
import { ingestJobPostings } from "@/ai/workflows/ingestJobPostings";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const prefs = await getPreferences(session!.user.id);
  function safeArr(v: string | null | undefined): string[] {
    try { return v ? JSON.parse(v) : []; } catch { return []; }
  }
  const targetRoles: string[] = prefs ? safeArr(prefs.targetRoles) : [];
  const locations: string[] = prefs ? safeArr(prefs.preferredLocations) : [];

  // Pass userId so ingest auto-scores new jobs against the user's resume
  const result = await ingestJobPostings(targetRoles, locations, session!.user.id);
  return NextResponse.json(result);
}
