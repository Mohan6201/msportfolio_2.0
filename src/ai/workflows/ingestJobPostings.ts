// src/ai/workflows/ingestJobPostings.ts
// FIX 2: Auto-score all newly ingested jobs against user's resume
// REPLACE entire file with this version

import { upsertCompany, upsertJobMatch, getMatch } from "@/domains/jobs/services/jobs.service";
import { getLatestVersion, listResumes } from "@/domains/resume/services/resume.service";
import { scoreJobMatch } from "@/ai/agents/scoreJobMatch";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";

type AdzunaJob = {
  id: string;
  title: string;
  description: string;
  company: { display_name: string };
  location: { display_name: string };
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  redirect_url: string;
  created: string;
};

type JSearchJob = {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city?: string;
  job_country?: string;
  job_description: string;
  job_employment_type?: string;
  job_is_remote?: boolean;
  job_min_salary?: number;
  job_max_salary?: number;
  job_apply_link: string;
  job_posted_at_datetime_utc?: string;
};

async function fetchAdzuna(role: string, location: string): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_API_KEY;
  if (!appId || !appKey) return [];

  const country = process.env.ADZUNA_COUNTRY ?? "in";
  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("what", role);
  url.searchParams.set("where", location);
  url.searchParams.set("results_per_page", "20");
  url.searchParams.set("content-type", "application/json");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

async function fetchJSearch(role: string, location: string): Promise<JSearchJob[]> {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(`${role} in ${location}`)}&page=1&num_pages=1`,
      {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export type IngestResult = {
  inserted: number;
  skipped: number;
  errors: number;
  scored: number;
};

export async function ingestJobPostings(
  targetRoles: string[],
  preferredLocations: string[],
  userId?: string   // ← NEW: pass userId to auto-score against their resume
): Promise<IngestResult> {
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  let scored = 0;

  const roles = targetRoles.length > 0 ? targetRoles.slice(0, 3) : ["DevOps Engineer"];
  const locations = preferredLocations.length > 0 ? preferredLocations.slice(0, 2) : ["India"];

  // Resolve resume once for auto-scoring (if userId provided)
  let resumeData: ResumeData | null = null;
  let resumeVersionId: number | null = null;

  if (userId) {
    try {
      const userResumes = await listResumes(userId);
      if (userResumes.length > 0) {
        const latestVersion = await getLatestVersion(userResumes[0].id);
        if (latestVersion?.structuredData) {
          resumeData = JSON.parse(latestVersion.structuredData);
          resumeVersionId = latestVersion.id;
        }
      }
    } catch {
      // No resume — skip auto-scoring silently
    }
  }

  const newJobIds: Array<{ id: number; title: string; description: string; requirements: string[]; location: string; remote: boolean }> = [];

  const pairs = roles.flatMap(role => locations.map(loc => ({ role, loc })));

  await Promise.all(
    pairs.map(async ({ role, loc }) => {
      const [adzunaJobs, jsearchJobs] = await Promise.all([
        fetchAdzuna(role, loc),
        fetchJSearch(role, loc),
      ]);

      for (const j of adzunaJobs) {
        try {
          const companyId = await upsertCompany({ name: j.company.display_name });
          const [wasNew, jobId] = await upsertJobReturningId({
            companyId, source: "adzuna", externalId: j.id, title: j.title,
            description: j.description ?? "", requirements: [],
            location: j.location.display_name,
            remote: j.contract_type?.toLowerCase().includes("remote") ? 1 : 0,
            salaryMin: j.salary_min ?? null, salaryMax: j.salary_max ?? null,
            url: j.redirect_url, postedAt: j.created,
          });
          if (wasNew) {
            inserted++;
            newJobIds.push({ id: jobId, title: j.title, description: j.description ?? "", requirements: [], location: j.location.display_name, remote: !!j.contract_type?.toLowerCase().includes("remote") });
          } else {
            skipped++;
          }
        } catch { errors++; }
      }

      for (const j of jsearchJobs) {
        try {
          const companyId = await upsertCompany({ name: j.employer_name });
          const location = [j.job_city, j.job_country].filter(Boolean).join(", ");
          const reqs: string[] = [];
          const [wasNew, jobId] = await upsertJobReturningId({
            companyId, source: "jsearch", externalId: j.job_id, title: j.job_title,
            description: j.job_description ?? "", requirements: reqs,
            location, remote: j.job_is_remote ? 1 : 0,
            salaryMin: j.job_min_salary ?? null, salaryMax: j.job_max_salary ?? null,
            url: j.job_apply_link, postedAt: j.job_posted_at_datetime_utc ?? null,
          });
          if (wasNew) {
            inserted++;
            newJobIds.push({ id: jobId, title: j.job_title, description: j.job_description ?? "", requirements: reqs, location, remote: !!j.job_is_remote });
          } else {
            skipped++;
          }
        } catch { errors++; }
      }
    })
  );

  // Auto-score new jobs if we have a resume
  if (userId && resumeData && resumeVersionId && newJobIds.length > 0) {
    // Score up to 20 new jobs concurrently (rate limit protection)
    const toScore = newJobIds.slice(0, 20);
    await Promise.allSettled(
      toScore.map(async (job) => {
        try {
          // Skip if already matched
          const existing = await getMatch(userId, job.id);
          if (existing) return;

          const score = await scoreJobMatch(resumeData!, {
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            location: job.location,
            remote: job.remote,
          });

          await upsertJobMatch(userId, job.id, {
            resumeVersionId: resumeVersionId!,
            matchScore: score.matchScore,
            skillGaps: score.skillGaps,
            matchedSkills: score.matchedSkills,
            verdict: score.verdict,
            status: "suggested",
          });
          scored++;
        } catch {
          // Scoring failure is non-fatal
        }
      })
    );
  }

  return { inserted, skipped, errors, scored };
}

// ── Internal helper: upsert + return the job id ────────────────────────────────
import { db } from "@/db/client";
import { jobs } from "@/db/schema/jobs";
import { and, eq } from "drizzle-orm";

async function upsertJobReturningId(data: {
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
}): Promise<[boolean, number]> {
  const existing = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.source, data.source), eq(jobs.externalId, data.externalId)))
    .limit(1);

  if (existing[0]) return [false, existing[0].id];

  const result = await db.insert(jobs).values({
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
  }).returning({ id: jobs.id });

  return [true, result[0].id];
}
