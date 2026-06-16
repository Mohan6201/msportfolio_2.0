import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { jobMatches, jobs } from "@/db/schema/jobs";
import { users } from "@/db/schema/auth";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const rows = await db
    .select({
      id: jobMatches.id,
      userId: jobMatches.userId,
      userName: users.name,
      userEmail: users.email,
      jobId: jobMatches.jobId,
      jobTitle: jobs.title,
      jobLocation: jobs.location,
      matchScore: jobMatches.matchScore,
      verdict: jobMatches.verdict,
      status: jobMatches.status,
      createdAt: jobMatches.createdAt,
    })
    .from(jobMatches)
    .leftJoin(jobs, eq(jobMatches.jobId, jobs.id))
    .leftJoin(users, eq(jobMatches.userId, users.id))
    .orderBy(desc(jobMatches.createdAt));

  return NextResponse.json({ data: rows });
}
