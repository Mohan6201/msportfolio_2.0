import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { listResumes, createResume } from "@/domains/resume/services/resume.service";

export async function GET(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const list = await listResumes(session!.user.id);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { title } = await req.json();
  const resume = await createResume(session!.user.id, title ?? "My Resume");
  return NextResponse.json(resume, { status: 201 });
}
