import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import {
  getResume,
  getVersion,
  listVersions,
  createResumeVersion,
  updateVersionData,
} from "@/domains/resume/services/resume.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const resume = await getResume(parseInt(id), session!.user.id);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const versions = await listVersions(resume.id);
  return NextResponse.json(versions);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const resume = await getResume(parseInt(id), session!.user.id);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const version = await createResumeVersion(resume.id, {
    structuredData: JSON.stringify(body.structuredData),
    sourceFileUrl: body.sourceFileUrl ?? null,
  });

  return NextResponse.json(version, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const resume = await getResume(parseInt(id), session!.user.id);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { versionId, structuredData } = await req.json();
  const version = await getVersion(versionId);
  if (!version || version.resumeId !== resume.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await updateVersionData(versionId, JSON.stringify(structuredData));
  return NextResponse.json({ ok: true });
}
