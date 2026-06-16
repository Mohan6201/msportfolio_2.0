import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { userJobPreferences } from "@/db/schema/accounts";
import { ingestJobPostings } from "@/ai/workflows/ingestJobPostings";

// Called daily by Vercel Cron — see vercel.json
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Collect all users' preferences for ingestion
  const allPrefs = await db.select().from(userJobPreferences);

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  function safeArr(v: string | null | undefined): string[] {
    try { return v ? JSON.parse(v) : []; } catch { return []; }
  }

  for (const prefs of allPrefs) {
    const targetRoles: string[] = safeArr(prefs.targetRoles);
    const locations: string[] = safeArr(prefs.preferredLocations);
    const result = await ingestJobPostings(targetRoles, locations);
    totalInserted += result.inserted;
    totalSkipped += result.skipped;
    totalErrors += result.errors;
  }

  // Fallback: if no user preferences yet, ingest for default DevOps roles
  if (allPrefs.length === 0) {
    const result = await ingestJobPostings(
      ["DevOps Engineer", "Cloud Engineer", "SRE"],
      ["India", "Remote"]
    );
    totalInserted += result.inserted;
    totalSkipped += result.skipped;
    totalErrors += result.errors;
  }

  return NextResponse.json({
    ok: true,
    inserted: totalInserted,
    skipped: totalSkipped,
    errors: totalErrors,
    processedUsers: allPrefs.length,
  });
}
