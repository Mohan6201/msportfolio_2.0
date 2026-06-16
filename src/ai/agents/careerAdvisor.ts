import { generateObject } from "ai";
import { EXTRACT_MODEL } from "@/ai/providers/gateway";
import { careerRoadmapSchema, type CareerRoadmap } from "@/ai/schemas/careerRoadmap";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";

type JobMatchSummary = {
  jobTitle: string;
  matchScore: number;
  skillGaps: string[];
  status: string;
};

export async function runCareerAdvisor(
  resumeData: ResumeData,
  preferences: {
    targetRoles: string[];
    remotePreference: string;
    minSalary?: number | null;
    keywords: string[];
  },
  recentMatches: JobMatchSummary[]
): Promise<CareerRoadmap> {
  const targetRole = preferences.targetRoles[0] ?? resumeData.experiences[0]?.jobTitle ?? "Senior DevOps Engineer";

  const { object } = await generateObject({
    model: EXTRACT_MODEL,
    schema: careerRoadmapSchema,
    prompt: `You are a senior career coach specialising in DevOps, Cloud, and SRE careers.

Candidate Profile:
- Current Role: ${resumeData.experiences[0]?.jobTitle ?? "N/A"} at ${resumeData.experiences[0]?.company ?? "N/A"}
- Summary: ${resumeData.summary ?? "N/A"}
- Skills: ${resumeData.skills.flatMap((g) => g.items).join(", ")}
- Certifications: ${resumeData.certifications.map((c) => c.title).join(", ") || "none"}
- Experience: ${resumeData.experiences.length} roles

Target:
- Target Role: ${targetRole}
- Remote Preference: ${preferences.remotePreference}
- Min Salary: ${preferences.minSalary ? `$${preferences.minSalary.toLocaleString()}` : "Not specified"}
- Keywords: ${preferences.keywords.join(", ")}

Recent Job Match Analysis (${recentMatches.length} jobs scored):
${recentMatches.slice(0, 5).map((m) => `- "${m.jobTitle}": ${m.matchScore}/100, gaps: ${m.skillGaps.join(", ")}`).join("\n") || "No matches yet"}

Build a realistic, actionable career roadmap. Be specific about skill gaps and timeline. The keyMessage should be a one-line positioning statement the candidate can use in interviews and their LinkedIn headline.`,
  });

  return object;
}
