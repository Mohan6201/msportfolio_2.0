import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getPreferences } from "@/domains/accounts/services/accounts.service";
import { getUserMatches } from "@/domains/jobs/services/jobs.service";
import { listResumes, getLatestVersion } from "@/domains/resume/services/resume.service";
import { runCareerAdvisor } from "@/ai/agents/careerAdvisor";
import { saveCareerRoadmap } from "@/domains/career/services/career.service";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const userId = session!.user.id;

  // Gather all inputs
  const [prefs, matches, userResumes] = await Promise.all([
    getPreferences(userId),
    getUserMatches(userId),
    listResumes(userId),
  ]);

  if (userResumes.length === 0) {
    return NextResponse.json({ error: "No resume found. Upload a resume in Resume Studio first." }, { status: 400 });
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

  function safeArr(v: string | null | undefined): string[] {
    try { return v ? JSON.parse(v) : []; } catch { return []; }
  }

  const preferences = {
    targetRoles: prefs ? safeArr(prefs.targetRoles) : [],
    remotePreference: prefs?.remotePreference ?? "any",
    minSalary: prefs?.minSalary ?? null,
    keywords: prefs ? safeArr(prefs.keywords) : [],
  };

  const recentMatches = matches.slice(0, 10).map((m) => ({
    jobTitle: m.job.title,
    matchScore: m.matchScore ?? 0,
    skillGaps: safeArr(m.skillGaps),
    status: m.status,
  }));

  const roadmap = await runCareerAdvisor(resumeData, preferences, recentMatches);
  const saved = await saveCareerRoadmap(userId, roadmap);

  return NextResponse.json({ roadmap, savedId: saved.id });
}
