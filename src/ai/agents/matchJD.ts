import { generateObject } from "ai";
import { TEXT_MODEL, TEXT_MODEL_FALLBACK_1, GROQ_BEST_EFFORT_OPTIONS, TEXT_MODEL_FALLBACK_2 } from "@/ai/providers/gateway";
import { jdMatchSchema, type JdMatchResult } from "@/ai/schemas/atsScore";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import { withFallback } from "@/ai/lib/withFallback";

export async function matchJD(resumeData: ResumeData, jdText: string): Promise<JdMatchResult> {
  const prompt = `You are a senior recruiter and career coach. Compare this resume against the job description and produce a detailed match analysis.

Resume:
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jdText}

Be precise about skill gaps. The matchScore should reflect realistic hiring probability (0-100).
The coverLetterHook should be a single compelling opening sentence tailored to this specific role.

Return the result as this exact JSON shape:
{
  "matchScore": number (0-100),
  "matchedSkills": string[],
  "missingSkills": string[],
  "strongPoints": string[],
  "weakPoints": string[],
  "suggestions": string[],
  "coverLetterHook": string
}`;

  const { object } = await withFallback([
    () => generateObject({ model: TEXT_MODEL, schema: jdMatchSchema, prompt }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_1, schema: jdMatchSchema, prompt, providerOptions: GROQ_BEST_EFFORT_OPTIONS }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_2, schema: jdMatchSchema, prompt }),
  ]);

  return object;
}
