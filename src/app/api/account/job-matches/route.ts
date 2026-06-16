import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getUserMatches } from "@/domains/jobs/services/jobs.service";
import type { JobStatus } from "@/domains/jobs/services/jobs.service";

export async function GET(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as JobStatus | null;

  const matches = await getUserMatches(session!.user.id, status ?? undefined);
  return NextResponse.json(matches);
}
