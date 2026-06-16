import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const resumes = sqliteTable("resumes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  title: text("title").notNull().default("My Resume"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const resumeVersions = sqliteTable("resume_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  resumeId: integer("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull().default(1),
  structuredData: text("structured_data").notNull().default("{}"), // JSON ResumeData
  sourceFileUrl: text("source_file_url"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const resumeAnalyses = sqliteTable("resume_analyses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  resumeVersionId: integer("resume_version_id").notNull().references(() => resumeVersions.id, { onDelete: "cascade" }),
  jdText: text("jd_text"),
  analysisType: text("analysis_type", { enum: ["ats", "jd_match"] }).notNull(),
  result: text("result").notNull().default("{}"), // JSON AtsScore | JdMatchResult
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const coverLetters = sqliteTable("cover_letters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  resumeVersionId: integer("resume_version_id").notNull().references(() => resumeVersions.id, { onDelete: "cascade" }),
  jobTitle: text("job_title"),
  company: text("company"),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});
