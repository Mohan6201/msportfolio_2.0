import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getResume, getLatestVersion, saveAnalysis } from "@/domains/resume/services/resume.service";
import { scoreATS } from "@/ai/agents/scoreATS";
import { matchJD } from "@/ai/agents/matchJD";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";

export const maxDuration = 60;

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
  const { type, jdText } = await req.json();

  if (type === "ats") {
    const result = await scoreATS(resumeData);
    const analysis = await saveAnalysis(version.id, "ats", result);
    return NextResponse.json({ analysis, result });
  }

  if (type === "jd_match") {
    if (!jdText) return NextResponse.json({ error: "jdText required" }, { status: 400 });
    const result = await matchJD(resumeData, jdText);
    const analysis = await saveAnalysis(version.id, "jd_match", result, jdText);
    return NextResponse.json({ analysis, result });
  }

  return NextResponse.json({ error: "Unknown analysis type" }, { status: 400 });
}
