import { generateObject } from "ai";
import { TEXT_MODEL, TEXT_MODEL_FALLBACK_1, GROQ_BEST_EFFORT_OPTIONS, TEXT_MODEL_FALLBACK_2 } from "@/ai/providers/gateway";
import { atsScoreSchema, type AtsScore } from "@/ai/schemas/atsScore";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import { withFallback } from "@/ai/lib/withFallback";

export async function scoreATS(resumeData: ResumeData): Promise<AtsScore> {
  const prompt = `You are an expert ATS (Applicant Tracking System) analyzer.
Analyze the following resume data and produce a detailed ATS compatibility score.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Score each section (0-100) and identify specific issues. Be precise and actionable.
For the keywords section, identify industry-standard keywords that are present and important ones that are missing.

Return the result as this exact JSON shape:
{
  "overallScore": number (0-100),
  "sections": {
    "contactInfo": { "score": number, "issues": string[] },
    "workExperience": { "score": number, "issues": string[] },
    "education": { "score": number, "issues": string[] },
    "skills": { "score": number, "issues": string[] },
    "formatting": { "score": number, "issues": string[] }
  },
  "strengths": string[],
  "improvements": string[],
  "keywords": { "found": string[], "missing": string[] }
}`;

  const { object } = await withFallback([
    () => generateObject({ model: TEXT_MODEL, schema: atsScoreSchema, prompt }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_1, schema: atsScoreSchema, prompt, providerOptions: GROQ_BEST_EFFORT_OPTIONS }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_2, schema: atsScoreSchema, prompt }),
  ]);

  return object;
}
