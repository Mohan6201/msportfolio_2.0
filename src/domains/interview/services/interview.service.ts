import { eq, desc, and } from "drizzle-orm";
import { db } from "@/db/client";
import { interviewQuestions, mockInterviews } from "@/db/schema/interview";

export type Question = typeof interviewQuestions.$inferSelect;
export type MockInterview = typeof mockInterviews.$inferSelect;

export async function listQuestions(category?: string) {
  const base = db.select().from(interviewQuestions);
  if (category) return base.where(eq(interviewQuestions.category, category));
  return base;
}

export async function getQuestion(id: number) {
  const rows = await db.select().from(interviewQuestions).where(eq(interviewQuestions.id, id));
  return rows[0] ?? null;
}

export async function getRandomQuestions(category: string, count = 5): Promise<Question[]> {
  const all = await db.select().from(interviewQuestions).where(eq(interviewQuestions.category, category));
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function startMockInterview(userId: string, category: string) {
  const result = await db.insert(mockInterviews).values({ userId, category }).returning();
  return result[0];
}

export async function updateInterview(
  id: number,
  userId: string,
  data: { transcript?: string; score?: number; feedback?: string }
) {
  await db
    .update(mockInterviews)
    .set(data)
    .where(and(eq(mockInterviews.id, id), eq(mockInterviews.userId, userId)));
}

export async function listInterviews(userId: string) {
  return db
    .select()
    .from(mockInterviews)
    .where(eq(mockInterviews.userId, userId))
    .orderBy(desc(mockInterviews.createdAt));
}

export async function getInterview(id: number, userId: string) {
  const rows = await db
    .select()
    .from(mockInterviews)
    .where(eq(mockInterviews.id, id));
  const interview = rows[0];
  if (!interview || interview.userId !== userId) return null;
  return interview;
}
