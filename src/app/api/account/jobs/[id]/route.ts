import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getJob } from "@/domains/jobs/services/jobs.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const job = await getJob(parseInt(id));
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}
