import { z } from "zod";

export const skillGapItemSchema = z.object({
  skill: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  resources: z.array(z.string()),
});

export const roadmapMilestoneSchema = z.object({
  timeframe: z.string(),
  milestone: z.string(),
  actions: z.array(z.string()),
});

export const careerRoadmapSchema = z.object({
  targetRole: z.string(),
  currentLevel: z.string(),
  keyMessage: z.string(),
  strengths: z.array(z.string()),
  skillGaps: z.array(skillGapItemSchema),
  roadmap: z.array(roadmapMilestoneSchema),
  salaryRange: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string().default("USD"),
  }),
  topCompanies: z.array(z.string()),
  certificationRecommendations: z.array(z.string()),
});

export const jobMatchScoreSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  skillGaps: z.array(z.string()),
  verdict: z.string(),
  suggestions: z.array(z.string()),
});

export type CareerRoadmap = z.infer<typeof careerRoadmapSchema>;
export type JobMatchScore = z.infer<typeof jobMatchScoreSchema>;
