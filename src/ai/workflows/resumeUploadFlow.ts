import { extractResume } from "@/ai/agents/extractResume";
import { createResume, createResumeVersion } from "@/domains/resume/services/resume.service";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";

export type UploadFlowResult = {
  resumeId: number;
  versionId: number;
  structuredData: ResumeData;
};

// The `resumes` row is created here, AFTER extraction succeeds — not before. Creating it
// first (the previous order) left a permanent version-less orphan row behind on every failed
// extraction (e.g. during a Gemini outage), and the client's post-upload auto-select logic
// picks from the resume list without knowing which entry is "new," so those orphans could get
// auto-selected instead of the resume that was actually just uploaded, making even a
// successful upload appear to silently fail in the UI.
export async function resumeUploadFlow(
  userId: string,
  resumeTitle: string,
  fileBytes: ArrayBuffer,
  mimeType: string,
  sourceFileUrl?: string
): Promise<UploadFlowResult> {
  const structuredData = await extractResume(fileBytes, mimeType);

  const resume = await createResume(userId, resumeTitle);
  const version = await createResumeVersion(resume.id, {
    structuredData: JSON.stringify(structuredData),
    sourceFileUrl: sourceFileUrl ?? null,
  });

  return { resumeId: resume.id, versionId: version.id, structuredData };
}
