import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import {
  startMockInterview,
  listInterviews,
  getRandomQuestions,
} from "@/domains/interview/services/interview.service";

export async function GET(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;
  const sessions = await listInterviews(session!.user.id);
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { category } = await req.json() as { category: string };
  if (!category) return NextResponse.json({ error: "category is required" }, { status: 400 });

  const [interview, questions] = await Promise.all([
    startMockInterview(session!.user.id, category),
    getRandomQuestions(category, 5),
  ]);

  return NextResponse.json({ interview, questions });
}
