import { generateObject } from "ai";
import { TEXT_MODEL, TEXT_MODEL_FALLBACK_1, GROQ_BEST_EFFORT_OPTIONS, TEXT_MODEL_FALLBACK_2 } from "@/ai/providers/gateway";
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

  const shapeReminder = `

Return the result as this exact JSON shape (use these exact key names):
{
  "contact": { "fullName": string, "email": string, "phone"?: string, "location"?: string, "linkedinUrl"?: string, "githubUrl"?: string, "portfolioUrl"?: string },
  "summary"?: string,
  "experiences": [{ "jobTitle": string, "company": string, "location"?: string, "startDate": string, "endDate"?: string, "isCurrent": boolean, "responsibilities": string[], "technologies": string[] }],
  "education": [{ "degree": string, "institution": string, "location"?: string, "startDate"?: string, "endDate"?: string, "gpa"?: string, "honors"?: string }],
  "skills": [{ "category": string, "items": string[] }],
  "certifications": [{ "title": string, "issuer": string, "date"?: string, "url"?: string }],
  "projects": [{ "name": string, "description": string, "technologies": string[], "url"?: string, "githubUrl"?: string }]
}`;
  const fullPrompt = prompt + shapeReminder;

  // Same schema as extractResume.ts — Groq's strict mode rejects it, so both Groq tiers run
  // in best-effort mode, and maxOutputTokens is explicit for the same reason (default cut a
  // full resumeDataSchema generation off mid-object on real data). Capped lower than
  // extractResume's (3500 vs 4000): this prompt also embeds the full original resume as JSON
  // plus the job description, so the input side of Groq's combined 8000 tokens-per-minute
  // ceiling is larger here, leaving less room on the output side.
  const { object } = await withFallback([
    () => generateObject({ model: TEXT_MODEL, schema: resumeDataSchema, prompt: fullPrompt, providerOptions: GROQ_BEST_EFFORT_OPTIONS, maxOutputTokens: 3500 }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_1, schema: resumeDataSchema, prompt: fullPrompt, providerOptions: GROQ_BEST_EFFORT_OPTIONS, maxOutputTokens: 3500 }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_2, schema: resumeDataSchema, prompt: fullPrompt, maxOutputTokens: 8000 }),
  ]);

  return object;
}
