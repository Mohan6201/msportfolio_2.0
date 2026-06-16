import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const interviewQuestions = sqliteTable("interview_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  level: text("level").notNull().default("Intermediate"),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  tags: text("tags").notNull().default("[]"),
});

export const mockInterviews = sqliteTable("mock_interviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  category: text("category").notNull(),
  transcript: text("transcript").notNull().default("[]"),
  score: integer("score"),
  feedback: text("feedback"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
});
