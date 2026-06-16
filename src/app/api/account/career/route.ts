import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getLatestRoadmap } from "@/domains/career/services/career.service";

export async function GET(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const roadmap = await getLatestRoadmap(session!.user.id);
  return NextResponse.json(roadmap ?? null);
}
