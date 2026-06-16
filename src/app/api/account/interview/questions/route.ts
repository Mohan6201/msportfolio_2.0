import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { listQuestions } from "@/domains/interview/services/interview.service";

export async function GET(req: NextRequest) {
  const { error } = await requireUser(req);
  if (error) return error;

  const category = req.nextUrl.searchParams.get("category") ?? undefined;
  const questions = await listQuestions(category);
  return NextResponse.json(questions);
}
