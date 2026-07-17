import { generateText } from "ai";
import { EXTRACT_MODEL, EXTRACT_MODEL_FALLBACK } from "@/ai/providers/gateway";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import { withFallback } from "@/ai/lib/withFallback";

export async function generateCoverLetter(
  resumeData: ResumeData,
  jobTitle: string,
  company: string,
  jdText?: string
): Promise<string> {
  const prompt = `Write a professional, compelling cover letter for the following candidate and job.

Candidate Resume Summary:
- Name: ${resumeData.contact.fullName}
- Summary: ${resumeData.summary ?? "N/A"}
- Most recent role: ${resumeData.experiences[0]?.jobTitle ?? "N/A"} at ${resumeData.experiences[0]?.company ?? "N/A"}
- Key skills: ${resumeData.skills.flatMap((g) => g.items).slice(0, 10).join(", ")}
- Certifications: ${resumeData.certifications.map((c) => c.title).join(", ") || "None listed"}

Target Role: ${jobTitle} at ${company}
${jdText ? `\nJob Description:\n${jdText}` : ""}

Guidelines:
- 3–4 short paragraphs, professional but confident tone
- Opening: hook that immediately connects the candidate's unique background to this specific role
- Body: 2 most relevant achievements with impact/numbers from the resume; how they address the role's key needs
- Closing: clear call to action, enthusiasm for the company specifically
- Do NOT use generic phrases like "I am writing to express my interest" or "I believe I would be a great fit"
- Output only the letter body (no subject line, no date, no address blocks)`;

  const { text } = await withFallback([
    () => generateText({ model: EXTRACT_MODEL, prompt }),
    () => generateText({ model: EXTRACT_MODEL_FALLBACK, prompt }),
  ]);

  return text;
}
