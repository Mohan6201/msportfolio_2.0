import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { searchJobs, getRecentJobs, getUserMatches, getTotalJobCount } from "@/domains/jobs/services/jobs.service";

export async function GET(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const view = searchParams.get("view") ?? "suggested"; // suggested | search | all

  if (view === "suggested") {
    const matches = await getUserMatches(session!.user.id);
    return NextResponse.json(matches);
  }

  if (view === "search" && q) {
    const results = await searchJobs(q, 30);
    return NextResponse.json(results);
  }

  // Default: recent jobs from catalog + total count
  const [list, total] = await Promise.all([getRecentJobs(50), getTotalJobCount()]);
  return NextResponse.json({ jobs: list, total });
}
