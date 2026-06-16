import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userJobPreferences } from "@/db/schema/accounts";
import { users } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const rows = await db
    .select({
      id: userJobPreferences.id,
      userId: userJobPreferences.userId,
      userName: users.name,
      userEmail: users.email,
      targetRoles: userJobPreferences.targetRoles,
      preferredLocations: userJobPreferences.preferredLocations,
      remotePreference: userJobPreferences.remotePreference,
      employmentType: userJobPreferences.employmentType,
      minSalary: userJobPreferences.minSalary,
      keywords: userJobPreferences.keywords,
      updatedAt: userJobPreferences.updatedAt,
    })
    .from(userJobPreferences)
    .leftJoin(users, eq(userJobPreferences.userId, users.id))
    .orderBy(desc(userJobPreferences.updatedAt));

  return NextResponse.json({ data: rows });
}
