import { generateObject } from "ai";
import { z } from "zod";
import { TEXT_MODEL, TEXT_MODEL_FALLBACK_1, GROQ_BEST_EFFORT_OPTIONS, TEXT_MODEL_FALLBACK_2 } from "@/ai/providers/gateway";
import { withFallback } from "@/ai/lib/withFallback";

const evaluationSchema = z.object({
  projectName: z.string(),
  techStack: z.array(z.string()),
  overallScore: z.number().min(0).max(100),
  marketValue: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  improvements: z.array(z.string()),
  hirabilityNote: z.string(),
  matchingRoles: z.array(z.string()),
  estimatedSalaryRange: z.string(),
});

export type ProjectEvaluation = z.infer<typeof evaluationSchema>;

export async function evaluateProject(input: string): Promise<ProjectEvaluation> {
  const prompt = `You are a senior DevOps/Cloud technical recruiter and engineering manager with 15+ years of experience evaluating portfolios and projects.

Evaluate the following project/portfolio input:

"${input}"

Provide a thorough technical assessment:

- projectName: infer the project or portfolio name from the input
- techStack: list every technology, tool, framework, or cloud service mentioned or implied
- overallScore: score from 0–100 based on technical depth, DevOps maturity, cloud architecture quality, and market alignment
- marketValue: concise assessment of what engineering level this demonstrates (e.g. "Junior DevOps", "Mid-level Cloud Engineer", "Senior Platform Engineer")
- strengths: 3–5 technical strengths (specific, evidence-based)
- weaknesses: 2–4 areas where the project/portfolio falls short compared to industry expectations
- improvements: 3–5 concrete, actionable improvements that would increase market value
- hirabilityNote: 1–2 sentences on overall hireability for DevOps/Cloud roles based on this evidence
- matchingRoles: 3–5 specific job titles this person could realistically target (e.g. "DevOps Engineer", "AWS Solutions Architect", "SRE")
- estimatedSalaryRange: market salary range this profile could realistically command (e.g. "£45,000–£60,000 / $60,000–$85,000")

Be specific and honest. Don't pad with generic compliments — give actionable, expert-level feedback.

Return the result as this exact JSON shape:
{
  "projectName": string,
  "techStack": string[],
  "overallScore": number (0-100),
  "marketValue": string,
  "strengths": string[],
  "weaknesses": string[],
  "improvements": string[],
  "hirabilityNote": string,
  "matchingRoles": string[],
  "estimatedSalaryRange": string
}`;

  const { object } = await withFallback([
    () => generateObject({ model: TEXT_MODEL, schema: evaluationSchema, prompt }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_1, schema: evaluationSchema, prompt, providerOptions: GROQ_BEST_EFFORT_OPTIONS }),
    () => generateObject({ model: TEXT_MODEL_FALLBACK_2, schema: evaluationSchema, prompt }),
  ]);

  return object;
}
