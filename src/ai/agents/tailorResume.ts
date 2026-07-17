import { generateObject } from "ai";
import { EXTRACT_MODEL, EXTRACT_MODEL_FALLBACK } from "@/ai/providers/gateway";
import { resumeDataSchema, type ResumeData } from "@/ai/schemas/resumeExtraction";
import { withFallback } from "@/ai/lib/withFallback";

export async function tailorResume(resumeData: ResumeData, jdText?: string): Promise<ResumeData> {
  const prompt = jdText
    ? `You are an expert resume writer. Tailor the following resume to better match the job description.

Rules:
- Only enhance/reword existing content — never fabricate experience or skills
- Use keywords from the job description where they genuinely apply
- Reorder skills to highlight the most relevant ones first
- Strengthen bullet points to use impact-focused language (metrics, outcomes)
- Keep the same structure — just improve the content

Original Resume:
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jdText}

Return the full tailored resume in the same structure.`
    : `You are an expert resume writer. Strengthen the following resume so it reads as more impactful and professional, without targeting any specific job description.

Rules:
- Only enhance/reword existing content — never fabricate experience or skills
- Use stronger, more specific action verbs at the start of each bullet point
- Quantify achievements wherever a plausible metric can be inferred from the existing content — do not invent numbers that aren't grounded in what's already there
- Tighten wording and cut filler so each bullet is concise and impact-focused
- Do NOT optimize for or invent keywords tied to a specific job — this is a general improvement pass
- Keep the same structure — just improve the content

Original Resume:
${JSON.stringify(resumeData, null, 2)}

Return the full improved resume in the same structure.`;

  const { object } = await withFallback([
    () => generateObject({ model: EXTRACT_MODEL, schema: resumeDataSchema, prompt }),
    () => generateObject({ model: EXTRACT_MODEL_FALLBACK, schema: resumeDataSchema, prompt }),
  ]);

  return object;
}
