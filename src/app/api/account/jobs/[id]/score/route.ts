import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getJob, upsertJobMatch } from "@/domains/jobs/services/jobs.service";
import { getLatestVersion } from "@/domains/resume/services/resume.service";
import { listResumes } from "@/domains/resume/services/resume.service";
import { scoreJobMatch } from "@/ai/agents/scoreJobMatch";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const { id } = await params;
  const job = await getJob(parseInt(id));
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  // Get user's latest resume version
  const userResumes = await listResumes(session!.user.id);
  if (userResumes.length === 0) {
    return NextResponse.json({ error: "No resume found. Upload a resume first." }, { status: 400 });
  }
  const latestVersion = await getLatestVersion(userResumes[0].id);
  if (!latestVersion) {
    return NextResponse.json({ error: "No resume version found." }, { status: 400 });
  }

  let resumeData: ResumeData;
  try {
    resumeData = JSON.parse(latestVersion.structuredData);
  } catch {
    return NextResponse.json({ error: "Resume data is not yet processed. Try re-uploading." }, { status: 400 });
  }
  let requirements: string[];
  try { requirements = job.requirements ? JSON.parse(job.requirements) : []; } catch { requirements = []; }
  const score = await scoreJobMatch(resumeData, {
    title: job.title,
    description: job.description,
    requirements,
    location: job.location,
    remote: !!job.remote,
  });

  const match = await upsertJobMatch(session!.user.id, job.id, {
    resumeVersionId: latestVersion.id,
    matchScore: score.matchScore,
    skillGaps: score.skillGaps,
    matchedSkills: score.matchedSkills,
    verdict: score.verdict,
    status: "suggested",
  });

  return NextResponse.json({ match, score });
}
