import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import {
  getResume,
  updateResume,
  deleteResume,
  getLatestVersion,
} from "@/domains/resume/services/resume.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const resume = await getResume(parseInt(id), session!.user.id);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const latestVersion = await getLatestVersion(resume.id);
  return NextResponse.json({ resume, latestVersion });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const { title } = await req.json();
  await updateResume(parseInt(id), session!.user.id, title);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  await deleteResume(parseInt(id), session!.user.id);
  return NextResponse.json({ ok: true });
}
