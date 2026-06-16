import { extractResume } from "@/ai/agents/extractResume";
import { createResumeVersion } from "@/domains/resume/services/resume.service";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";

export type UploadFlowResult = {
  resumeId: number;
  versionId: number;
  structuredData: ResumeData;
};

export async function resumeUploadFlow(
  userId: string,
  resumeId: number,
  fileBytes: ArrayBuffer,
  mimeType: string,
  sourceFileUrl?: string
): Promise<UploadFlowResult> {
  const structuredData = await extractResume(fileBytes, mimeType);

  const version = await createResumeVersion(resumeId, {
    structuredData: JSON.stringify(structuredData),
    sourceFileUrl: sourceFileUrl ?? null,
  });

  return { resumeId, versionId: version.id, structuredData };
}
