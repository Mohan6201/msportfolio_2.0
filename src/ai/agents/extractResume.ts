import { generateObject } from "ai";
import { EXTRACT_MODEL, EXTRACT_MODEL_FALLBACK } from "@/ai/providers/gateway";
import { resumeDataSchema, type ResumeData } from "@/ai/schemas/resumeExtraction";
import { withFallback } from "@/ai/lib/withFallback";

export async function extractResume(fileBytes: ArrayBuffer, mimeType: string): Promise<ResumeData> {
  const messages: Parameters<typeof generateObject>[0]["messages"] = [
    {
      role: "user",
      content: [
        {
          type: "file",
          data: new Uint8Array(fileBytes),
          mediaType: mimeType,
        },
        {
          type: "text",
          text: `Extract all information from this resume into structured JSON.
Be thorough — capture every experience, skill, certification, project, and education entry.
For dates, preserve the original format (e.g. "Jan 2023", "2023-01", "2023").
For responsibilities and technologies, extract as individual items (not combined).
If a field is not present in the resume, omit it or use an empty array.`,
        },
      ],
    },
  ];

  const { object } = await withFallback([
    () => generateObject({ model: EXTRACT_MODEL, schema: resumeDataSchema, messages }),
    () => generateObject({ model: EXTRACT_MODEL_FALLBACK, schema: resumeDataSchema, messages }),
  ]);

  return object;
}
