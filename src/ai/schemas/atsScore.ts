import { z } from "zod";

export const atsSectionSchema = z.object({
  score: z.number().min(0).max(100),
  issues: z.array(z.string()),
});

export const atsScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  sections: z.object({
    contactInfo: atsSectionSchema,
    workExperience: atsSectionSchema,
    education: atsSectionSchema,
    skills: atsSectionSchema,
    formatting: atsSectionSchema,
  }),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  keywords: z.object({
    found: z.array(z.string()),
    missing: z.array(z.string()),
  }),
});

export const jdMatchSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  strongPoints: z.array(z.string()),
  weakPoints: z.array(z.string()),
  suggestions: z.array(z.string()),
  coverLetterHook: z.string(),
});

export type AtsScore = z.infer<typeof atsScoreSchema>;
export type JdMatchResult = z.infer<typeof jdMatchSchema>;
