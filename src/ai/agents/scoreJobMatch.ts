import { generateObject } from "ai";
import { TEXT_MODEL, TEXT_MODEL_FALLBACK_1, GROQ_BEST_EFFORT_OPTIONS, TEXT_MODEL_FALLBACK_2 } from "@/ai/providers/gateway";
import { jobMatchScoreSchema, type JobMatchScore } from "@/ai/schemas/careerRoadmap";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import { withFallback } from "@/ai/lib/withFallback";

type JobSummary = {
  title: string;
  description: string;
  requirements: string[];
  location: string;
  remote: boolean;
};

export async function scoreJobMatch(
  resumeData: ResumeData,
  job: JobSummary
): Promise<JobMatchScore> {
  const prompt = `You are a senior technical recruiter scoring candidate–job fit.

Candidate Resume Summary:
- Title: ${resumeData.experiences[0]?.jobTitle ?? "N/A"}
- Summary: ${resumeData.summary ?? "N/A"}
- Skills: ${resumeData.skills.flatMap((g) => g.items).join(", ")}
- Years experience: estimated from ${resumeData.experiences.length} roles
- Certs: ${resumeData.certifications.map((c) => c.title).join(", ") || "none"}

Job Posting:
- Title: ${job.title}
- Location: ${job.location}${job.remote ? " (Remote)" : ""}
- Description: ${job.description.slice(0, 1000)}
- Requirements: ${job.requirements.join(", ")}

Produce a realistic matchScore (0-100), list matched and missing skills, a one-line verdict, and 2-3 actionable suggestions for the candidate to improve their fit.

Return the result as this exact JSON shape:
{ "matchScore": number (0-100), "matchedSkills": string[], "skillGaps": string[], "verdict": string, "suggestions": string[] }`;

  const { object } = await withFallback([
    () => generateObject({ model: TEXT_MODEL, schema: jobMatchScoreSchema, prompt }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_1, schema: jobMatchScoreSchema, prompt, providerOptions: GROQ_BEST_EFFORT_OPTIONS }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_2, schema: jobMatchScoreSchema, prompt }),
  ]);

  return object;
}
