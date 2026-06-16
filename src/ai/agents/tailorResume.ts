import { generateObject } from "ai";
import { EXTRACT_MODEL } from "@/ai/providers/gateway";
import { resumeDataSchema, type ResumeData } from "@/ai/schemas/resumeExtraction";

export async function tailorResume(resumeData: ResumeData, jdText: string): Promise<ResumeData> {
  const { object } = await generateObject({
    model: EXTRACT_MODEL,
    schema: resumeDataSchema,
    prompt: `You are an expert resume writer. Tailor the following resume to better match the job description.

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

Return the full tailored resume in the same structure.`,
  });

  return object;
}
