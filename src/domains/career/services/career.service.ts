import { db } from "@/db/client";
import { skillGapReports, careerRecommendations } from "@/db/schema/career";
import { eq, desc } from "drizzle-orm";
import type { CareerRoadmap } from "@/ai/schemas/careerRoadmap";

export type SkillGapReport = typeof skillGapReports.$inferSelect;
export type CareerRecommendation = typeof careerRecommendations.$inferSelect;

export async function saveCareerRoadmap(userId: string, roadmap: CareerRoadmap): Promise<CareerRecommendation> {
  const result = await db
    .insert(careerRecommendations)
    .values({ userId, type: "roadmap", content: JSON.stringify(roadmap) })
    .returning();
  return result[0];
}

export async function getLatestRoadmap(userId: string): Promise<CareerRoadmap | null> {
  const rows = await db
    .select()
    .from(careerRecommendations)
    .where(eq(careerRecommendations.userId, userId))
    .orderBy(desc(careerRecommendations.createdAt))
    .limit(1);

  if (!rows[0]) return null;
  try {
    return JSON.parse(rows[0].content) as CareerRoadmap;
  } catch {
    return null;
  }
}

export async function saveSkillGapReport(userId: string, targetRole: string, gaps: string[]): Promise<SkillGapReport> {
  const result = await db
    .insert(skillGapReports)
    .values({ userId, targetRole, gaps: JSON.stringify(gaps) })
    .returning();
  return result[0];
}
