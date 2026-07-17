import { generateObject } from "ai";
import { TEXT_MODEL, TEXT_MODEL_FALLBACK_1, GROQ_BEST_EFFORT_OPTIONS, TEXT_MODEL_FALLBACK_2 } from "@/ai/providers/gateway";
import { resumeDataSchema, type ResumeData } from "@/ai/schemas/resumeExtraction";
import { withFallback } from "@/ai/lib/withFallback";
import { extractDocumentText } from "@/ai/lib/extractDocumentText";

export async function extractResume(fileBytes: ArrayBuffer, mimeType: string): Promise<ResumeData> {
  const documentText = await extractDocumentText(fileBytes, mimeType);

  const prompt = `Extract all information from this resume into structured JSON.
Be thorough — capture every experience, skill, certification, project, and education entry.
For dates, preserve the original format (e.g. "Jan 2023", "2023-01", "2023").
For responsibilities and technologies, extract as individual items (not combined).
If a field is not present in the resume, omit it or use an empty array.

Return the result as this exact JSON shape (use these exact key names):
{
  "contact": { "fullName": string, "email": string, "phone"?: string, "location"?: string, "linkedinUrl"?: string, "githubUrl"?: string, "portfolioUrl"?: string },
  "summary"?: string,
  "experiences": [{ "jobTitle": string, "company": string, "location"?: string, "startDate": string, "endDate"?: string, "isCurrent": boolean, "responsibilities": string[], "technologies": string[] }],
  "education": [{ "degree": string, "institution": string, "location"?: string, "startDate"?: string, "endDate"?: string, "gpa"?: string, "honors"?: string }],
  "skills": [{ "category": string, "items": string[] }],
  "certifications": [{ "title": string, "issuer": string, "date"?: string, "url"?: string }],
  "projects": [{ "name": string, "description": string, "technologies": string[], "url"?: string, "githubUrl"?: string }]
}

Resume text:
${documentText}`;

  // Groq's strict structured-output mode rejects this schema (it has genuinely optional
  // fields), so both Groq tiers run in best-effort mode here — unlike the other agents, which
  // use schemas without optional fields and can stay on TEXT_MODEL's default strict mode.
  // maxOutputTokens is explicit because the default cut generation off mid-object on a real,
  // detailed resume — contact/summary came through fine but experiences/education/skills/
  // certifications/projects never arrived, so the schema validation failure was actually a
  // truncation failure wearing a "response did not match schema" costume. Capped at 4000, not
  // higher: Groq's free tier for gpt-oss-120b/20b has an 8000 tokens-PER-MINUTE ceiling that
  // covers input+output combined — asking for 8000 output tokens alone gets the request
  // rejected outright ("Request too large") before generation even starts, regardless of how
  // much of that budget actually gets used.
  const { object } = await withFallback([
    () => generateObject({ model: TEXT_MODEL, schema: resumeDataSchema, prompt, providerOptions: GROQ_BEST_EFFORT_OPTIONS, maxOutputTokens: 4000 }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_1, schema: resumeDataSchema, prompt, providerOptions: GROQ_BEST_EFFORT_OPTIONS, maxOutputTokens: 4000 }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_2, schema: resumeDataSchema, prompt, maxOutputTokens: 8000 }),
  ]);

  return object;
}
