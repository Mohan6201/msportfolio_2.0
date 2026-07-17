import { generateObject } from "ai";
import { EXTRACT_MODEL, EXTRACT_MODEL_FALLBACK } from "@/ai/providers/gateway";
import { atsScoreSchema, type AtsScore } from "@/ai/schemas/atsScore";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import { withFallback } from "@/ai/lib/withFallback";

export async function scoreATS(resumeData: ResumeData): Promise<AtsScore> {
  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer.
Analyze the following resume data and produce a detailed ATS compatibility score.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Score each section (0-100) and identify specific issues. Be precise and actionable.
For the keywords section, identify industry-standard keywords that are present and important ones that are missing.`;

  const { object } = await withFallback([
    () => generateObject({ model: EXTRACT_MODEL, schema: atsScoreSchema, prompt }),
    () => generateObject({ model: EXTRACT_MODEL_FALLBACK, schema: atsScoreSchema, prompt }),
  ]);

  return object;
}
