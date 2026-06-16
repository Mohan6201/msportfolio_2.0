import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const pageViews = sqliteTable("page_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  path: text("path").notNull(),
  visitorHash: text("visitor_hash"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const resumeDownloads = sqliteTable("resume_downloads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  resumeVersionId: integer("resume_version_id"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const aiUsageLogs = sqliteTable("ai_usage_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  feature: text("feature").notNull(),
  tokensUsed: integer("tokens_used").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
