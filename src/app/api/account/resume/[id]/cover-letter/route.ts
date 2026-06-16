import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getResume, getLatestVersion, saveCoverLetter, listCoverLetters } from "@/domains/resume/services/resume.service";
import { generateCoverLetter } from "@/ai/agents/generateCoverLetter";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";

export const maxDuration = 60;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const resume = await getResume(parseInt(id), session!.user.id);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const version = await getLatestVersion(resume.id);
  if (!version) return NextResponse.json([]);

  const letters = await listCoverLetters(version.id);
  return NextResponse.json(letters);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const resume = await getResume(parseInt(id), session!.user.id);
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const version = await getLatestVersion(resume.id);
  if (!version) return NextResponse.json({ error: "No version found" }, { status: 404 });

  let resumeData: ResumeData;
  try {
    resumeData = JSON.parse(version.structuredData);
  } catch {
    return NextResponse.json({ error: "Resume not yet processed. Try re-uploading." }, { status: 400 });
  }
  const { jobTitle, company, jdText } = await req.json();

  if (!jobTitle || !company) {
    return NextResponse.json({ error: "jobTitle and company required" }, { status: 400 });
  }

  const content = await generateCoverLetter(resumeData, jobTitle, company, jdText);
  const letter = await saveCoverLetter(version.id, content, jobTitle, company);
  return NextResponse.json(letter, { status: 201 });
}
