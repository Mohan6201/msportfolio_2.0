import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url"),
  logoUrl: text("logo_url"),
});

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyId: integer("company_id").references(() => companies.id),
  source: text("source", { enum: ["adzuna", "jsearch", "manual"] }).notNull(),
  externalId: text("external_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  requirements: text("requirements").notNull().default("[]"),   // JSON string[]
  location: text("location").notNull().default(""),
  remote: integer("remote").notNull().default(0),               // 0 | 1
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  url: text("url").notNull(),
  postedAt: text("posted_at"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const jobMatches = sqliteTable("job_matches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  jobId: integer("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  resumeVersionId: integer("resume_version_id"),
  matchScore: real("match_score"),
  skillGaps: text("skill_gaps").notNull().default("[]"),        // JSON string[]
  matchedSkills: text("matched_skills").notNull().default("[]"),// JSON string[]
  verdict: text("verdict"),
  status: text("status", {
    enum: ["suggested", "saved", "applied", "interviewing", "rejected", "offer"],
  }).notNull().default("suggested"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});
