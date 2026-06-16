import { upsertCompany, upsertJob } from "@/domains/jobs/services/jobs.service";

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

  const country = "in"; // India — matches Mohan's primary market
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

export type IngestResult = { inserted: number; skipped: number; errors: number };

export async function ingestJobPostings(
  targetRoles: string[],
  preferredLocations: string[]
): Promise<IngestResult> {
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  const roles = targetRoles.length > 0 ? targetRoles.slice(0, 3) : ["DevOps Engineer"];
  const locations = preferredLocations.length > 0 ? preferredLocations.slice(0, 2) : ["India"];

  for (const role of roles) {
    for (const location of locations) {
      // Adzuna
      const adzunaJobs = await fetchAdzuna(role, location);
      for (const j of adzunaJobs) {
        try {
          const companyId = await upsertCompany({ name: j.company.display_name });
          const wasNew = await upsertJob({
            companyId,
            source: "adzuna",
            externalId: j.id,
            title: j.title,
            description: j.description ?? "",
            requirements: [],
            location: j.location.display_name,
            remote: j.contract_type?.toLowerCase().includes("remote") ? 1 : 0,
            salaryMin: j.salary_min ?? null,
            salaryMax: j.salary_max ?? null,
            url: j.redirect_url,
            postedAt: j.created,
          });
          wasNew ? inserted++ : skipped++;
        } catch {
          errors++;
        }
      }

      // JSearch
      const jsearchJobs = await fetchJSearch(role, location);
      for (const j of jsearchJobs) {
        try {
          const companyId = await upsertCompany({ name: j.employer_name });
          const loc = [j.job_city, j.job_country].filter(Boolean).join(", ");
          const wasNew = await upsertJob({
            companyId,
            source: "jsearch",
            externalId: j.job_id,
            title: j.job_title,
            description: j.job_description ?? "",
            requirements: [],
            location: loc,
            remote: j.job_is_remote ? 1 : 0,
            salaryMin: j.job_min_salary ?? null,
            salaryMax: j.job_max_salary ?? null,
            url: j.job_apply_link,
            postedAt: j.job_posted_at_datetime_utc ?? null,
          });
          wasNew ? inserted++ : skipped++;
        } catch {
          errors++;
        }
      }
    }
  }

  return { inserted, skipped, errors };
}
