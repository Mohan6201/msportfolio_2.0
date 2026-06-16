import { db } from "@/db/client";
import { userJobPreferences } from "@/db/schema/accounts";
import { eq } from "drizzle-orm";

export type JobPreferences = typeof userJobPreferences.$inferSelect;
export type JobPreferencesInput = Omit<JobPreferences, "id" | "updatedAt">;

export async function getPreferences(userId: string): Promise<JobPreferences | null> {
  const rows = await db
    .select()
    .from(userJobPreferences)
    .where(eq(userJobPreferences.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertPreferences(
  userId: string,
  data: Partial<Omit<JobPreferencesInput, "userId">>
): Promise<JobPreferences> {
  const existing = await getPreferences(userId);
  const now = new Date().toISOString();

  if (existing) {
    await db
      .update(userJobPreferences)
      .set({ ...data, updatedAt: now })
      .where(eq(userJobPreferences.userId, userId));
  } else {
    await db.insert(userJobPreferences).values({
      userId,
      targetRoles: "[]",
      preferredLocations: "[]",
      remotePreference: "any",
      employmentType: "[]",
      keywords: "[]",
      ...data,
      updatedAt: now,
    });
  }

  return (await getPreferences(userId))!;
}
