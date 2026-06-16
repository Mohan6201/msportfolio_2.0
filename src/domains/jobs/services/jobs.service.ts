import { db } from "@/db/client";
import { companies, jobs, jobMatches } from "@/db/schema/jobs";
import { eq, and, desc, like, sql } from "drizzle-orm";

export type Job = typeof jobs.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type JobMatch = typeof jobMatches.$inferSelect;
export type JobStatus = "suggested" | "saved" | "applied" | "interviewing" | "rejected" | "offer";

// ── Companies ─────────────────────────────────────────────────────────────────

export async function upsertCompany(data: { name: string; url?: string | null; logoUrl?: string | null }): Promise<number> {
  const existing = await db.select().from(companies).where(eq(companies.name, data.name)).limit(1);
  if (existing[0]) return existing[0].id;
  const result = await db.insert(companies).values({ name: data.name, url: data.url, logoUrl: data.logoUrl }).returning();
  return result[0].id;
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export async function upsertJob(data: {
  companyId: number;
  source: "adzuna" | "jsearch" | "manual";
  externalId: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  remote: 0 | 1;
  salaryMin: number | null;
  salaryMax: number | null;
  url: string;
  postedAt: string | null;
}): Promise<boolean> {
  const existing = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.source, data.source), eq(jobs.externalId, data.externalId)))
    .limit(1);

  if (existing[0]) return false;

  await db.insert(jobs).values({
    companyId: data.companyId,
    source: data.source,
    externalId: data.externalId,
    title: data.title,
    description: data.description,
    requirements: JSON.stringify(data.requirements),
    location: data.location,
    remote: data.remote,
    salaryMin: data.salaryMin,
    salaryMax: data.salaryMax,
    url: data.url,
    postedAt: data.postedAt,
  });
  return true;
}

export async function searchJobs(query: string, limit = 20): Promise<(Job & { company: Company | null })[]> {
  const rows = await db
    .select()
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(like(jobs.title, `%${query}%`))
    .orderBy(desc(jobs.createdAt))
    .limit(limit);

  return rows.map((r) => ({ ...r.jobs, company: r.companies }));
}

export async function getJob(id: number): Promise<(Job & { company: Company | null }) | null> {
  const rows = await db
    .select()
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .where(eq(jobs.id, id))
    .limit(1);

  return rows[0] ? { ...rows[0].jobs, company: rows[0].companies } : null;
}

export async function getRecentJobs(limit = 50): Promise<(Job & { company: Company | null })[]> {
  const rows = await db
    .select()
    .from(jobs)
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .orderBy(desc(jobs.createdAt))
    .limit(limit);

  return rows.map((r) => ({ ...r.jobs, company: r.companies }));
}

export async function getTotalJobCount(): Promise<number> {
  const result = await db.select({ count: sql<number>`count(*)` }).from(jobs);
  return result[0]?.count ?? 0;
}

// ── Job Matches ───────────────────────────────────────────────────────────────

export async function getUserMatches(userId: string, status?: JobStatus): Promise<(JobMatch & { job: Job & { company: Company | null } })[]> {
  const baseQuery = db
    .select()
    .from(jobMatches)
    .innerJoin(jobs, eq(jobMatches.jobId, jobs.id))
    .leftJoin(companies, eq(jobs.companyId, companies.id))
    .orderBy(desc(jobMatches.matchScore));

  const rows = await (
    status
      ? baseQuery.where(and(eq(jobMatches.userId, userId), eq(jobMatches.status, status)))
      : baseQuery.where(eq(jobMatches.userId, userId))
  );

  return rows.map((r) => ({
    ...r.job_matches,
    job: { ...r.jobs, company: r.companies },
  }));
}

export async function getMatch(userId: string, jobId: number): Promise<JobMatch | null> {
  const rows = await db
    .select()
    .from(jobMatches)
    .where(and(eq(jobMatches.userId, userId), eq(jobMatches.jobId, jobId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertJobMatch(
  userId: string,
  jobId: number,
  data: {
    resumeVersionId?: number | null;
    matchScore?: number | null;
    skillGaps?: string[];
    matchedSkills?: string[];
    verdict?: string | null;
    status?: JobStatus;
  }
): Promise<JobMatch> {
  const existing = await getMatch(userId, jobId);
  const now = new Date().toISOString();

  if (existing) {
    await db
      .update(jobMatches)
      .set({
        ...data,
        skillGaps: JSON.stringify(data.skillGaps ?? []),
        matchedSkills: JSON.stringify(data.matchedSkills ?? []),
        updatedAt: now,
      })
      .where(and(eq(jobMatches.userId, userId), eq(jobMatches.jobId, jobId)));
    return (await getMatch(userId, jobId))!;
  }

  const result = await db
    .insert(jobMatches)
    .values({
      userId,
      jobId,
      resumeVersionId: data.resumeVersionId ?? null,
      matchScore: data.matchScore ?? null,
      skillGaps: JSON.stringify(data.skillGaps ?? []),
      matchedSkills: JSON.stringify(data.matchedSkills ?? []),
      verdict: data.verdict ?? null,
      status: data.status ?? "suggested",
      updatedAt: now,
    })
    .returning();
  return result[0];
}

export async function updateMatchStatus(userId: string, matchId: number, status: JobStatus): Promise<void> {
  await db
    .update(jobMatches)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(and(eq(jobMatches.id, matchId), eq(jobMatches.userId, userId)));
}
