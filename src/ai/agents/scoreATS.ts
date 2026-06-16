import { generateObject } from "ai";
import { EXTRACT_MODEL } from "@/ai/providers/gateway";
import { atsScoreSchema, type AtsScore } from "@/ai/schemas/atsScore";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";

export async function scoreATS(resumeData: ResumeData): Promise<AtsScore> {
  const { object } = await generateObject({
    model: EXTRACT_MODEL,
    schema: atsScoreSchema,
    prompt: `You are an expert ATS (Applicant Tracking System) analyzer.
Analyze the following resume data and produce a detailed ATS compatibility score.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Score each section (0-100) and identify specific issues. Be precise and actionable.
For the keywords section, identify industry-standard keywords that are present and important ones that are missing.`,
  });

  return object;
}
