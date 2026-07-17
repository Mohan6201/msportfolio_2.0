import { generateObject } from "ai";
import { EXTRACT_MODEL, EXTRACT_MODEL_FALLBACK } from "@/ai/providers/gateway";
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
The coverLetterHook should be a single compelling opening sentence tailored to this specific role.`;

  const { object } = await withFallback([
    () => generateObject({ model: EXTRACT_MODEL, schema: jdMatchSchema, prompt }),
    () => generateObject({ model: EXTRACT_MODEL_FALLBACK, schema: jdMatchSchema, prompt }),
  ]);

  return object;
}
