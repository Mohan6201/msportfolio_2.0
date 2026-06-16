import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const skillGapReports = sqliteTable("skill_gap_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  targetRole: text("target_role").notNull(),
  gaps: text("gaps").notNull().default("[]"),        // JSON string[]
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const careerRecommendations = sqliteTable("career_recommendations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),                      // e.g. "roadmap" | "skill_gap"
  content: text("content").notNull().default("{}"),  // JSON CareerRoadmap
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});
