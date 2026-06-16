import { db } from "@/db/client";
import {
  resumes,
  resumeVersions,
  resumeAnalyses,
  coverLetters,
} from "@/db/schema/resume";
import { eq, desc, and } from "drizzle-orm";

export type Resume = typeof resumes.$inferSelect;
export type ResumeVersion = typeof resumeVersions.$inferSelect;
export type ResumeAnalysis = typeof resumeAnalyses.$inferSelect;
export type CoverLetter = typeof coverLetters.$inferSelect;

// ── Resumes ───────────────────────────────────────────────────────────────────

export async function listResumes(userId: string): Promise<Resume[]> {
  return db.select().from(resumes).where(eq(resumes.userId, userId));
}

export async function getResume(id: number, userId: string): Promise<Resume | null> {
  const rows = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createResume(userId: string, title: string): Promise<Resume> {
  const result = await db
    .insert(resumes)
    .values({ userId, title })
    .returning();
  return result[0];
}

export async function updateResume(id: number, userId: string, title: string): Promise<void> {
  await db
    .update(resumes)
    .set({ title })
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
}

export async function deleteResume(id: number, userId: string): Promise<void> {
  await db
    .delete(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
}

// ── Resume Versions ──────────────────────────────────────────────────────────

export async function listVersions(resumeId: number): Promise<ResumeVersion[]> {
  return db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.resumeId, resumeId))
    .orderBy(desc(resumeVersions.versionNumber));
}

export async function getVersion(versionId: number): Promise<ResumeVersion | null> {
  const rows = await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.id, versionId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getLatestVersion(resumeId: number): Promise<ResumeVersion | null> {
  const rows = await db
    .select()
    .from(resumeVersions)
    .where(eq(resumeVersions.resumeId, resumeId))
    .orderBy(desc(resumeVersions.versionNumber))
    .limit(1);
  return rows[0] ?? null;
}

export async function createResumeVersion(
  resumeId: number,
  data: { structuredData: string; sourceFileUrl?: string | null }
): Promise<ResumeVersion> {
  const existing = await listVersions(resumeId);
  const nextVersion = (existing[0]?.versionNumber ?? 0) + 1;

  const result = await db
    .insert(resumeVersions)
    .values({
      resumeId,
      versionNumber: nextVersion,
      structuredData: data.structuredData,
      sourceFileUrl: data.sourceFileUrl ?? null,
    })
    .returning();
  return result[0];
}

export async function updateVersionData(versionId: number, structuredData: string): Promise<void> {
  await db
    .update(resumeVersions)
    .set({ structuredData })
    .where(eq(resumeVersions.id, versionId));
}

// ── Analyses ─────────────────────────────────────────────────────────────────

export async function saveAnalysis(
  resumeVersionId: number,
  analysisType: "ats" | "jd_match",
  result: object,
  jdText?: string
): Promise<ResumeAnalysis> {
  const rows = await db
    .insert(resumeAnalyses)
    .values({
      resumeVersionId,
      analysisType,
      result: JSON.stringify(result),
      jdText: jdText ?? null,
    })
    .returning();
  return rows[0];
}

export async function getLatestAnalysis(
  resumeVersionId: number,
  analysisType: "ats" | "jd_match"
): Promise<ResumeAnalysis | null> {
  const rows = await db
    .select()
    .from(resumeAnalyses)
    .where(
      and(
        eq(resumeAnalyses.resumeVersionId, resumeVersionId),
        eq(resumeAnalyses.analysisType, analysisType)
      )
    )
    .orderBy(desc(resumeAnalyses.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

// ── Cover Letters ─────────────────────────────────────────────────────────────

export async function saveCoverLetter(
  resumeVersionId: number,
  content: string,
  jobTitle?: string,
  company?: string
): Promise<CoverLetter> {
  const rows = await db
    .insert(coverLetters)
    .values({ resumeVersionId, content, jobTitle: jobTitle ?? null, company: company ?? null })
    .returning();
  return rows[0];
}

export async function listCoverLetters(resumeVersionId: number): Promise<CoverLetter[]> {
  return db
    .select()
    .from(coverLetters)
    .where(eq(coverLetters.resumeVersionId, resumeVersionId))
    .orderBy(desc(coverLetters.createdAt));
}
