import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { updateMatchStatus } from "@/domains/jobs/services/jobs.service";
import type { JobStatus } from "@/domains/jobs/services/jobs.service";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const { status } = await req.json();
  await updateMatchStatus(session!.user.id, parseInt(id), status as JobStatus);
  return NextResponse.json({ ok: true });
}
