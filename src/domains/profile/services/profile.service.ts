import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { profiles, socialLinks, skills, experiences, certifications, projects, settings } from "@/db/schema/profile";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProfileRow = typeof profiles.$inferSelect;
export type SkillRow = typeof skills.$inferSelect;
export type ExperienceRow = typeof experiences.$inferSelect;
export type CertificationRow = typeof certifications.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type SocialLinkRow = typeof socialLinks.$inferSelect;

// Parsed versions with JSON fields deserialized
export type ParsedExperience = Omit<ExperienceRow, "tech" | "responsibilities"> & {
  tech: string[];
  responsibilities: string[];
};
export type ParsedProject = Omit<ProjectRow, "tech" | "responsibilities"> & {
  tech: string[];
  responsibilities: string[];
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseJSON<T>(json: string, fallback: T): T {
  try { return JSON.parse(json) as T; } catch { return fallback; }
}

/** Years of experience auto-calculated from a career start date. */
export function calcExperience(careerStart: string | Date): string {
  const start = typeof careerStart === "string" ? new Date(careerStart) : careerStart;
  const now = new Date();
  const years = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const rounded = Math.floor(years * 2) / 2; // nearest 0.5
  return `${rounded}+ years`;
}

const MONTHS: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

/** Parses experience start/end dates in either "MMM YYYY" (e.g. "NOV 2025") or ISO form. */
function parseExperienceDate(raw: string): Date | null {
  const m = raw.trim().toUpperCase().match(/^([A-Z]{3})\s+(\d{4})$/);
  if (m && m[1] in MONTHS) return new Date(Number(m[2]), MONTHS[m[1]], 1);
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Earliest start date across all experience entries — so "years of experience" auto-updates
 * (like LinkedIn) whenever a role is added to the timeline, instead of relying on a separately
 * maintained profile field that can drift out of sync.
 */
export function earliestExperienceStart(exps: ParsedExperience[]): Date | null {
  const dates = exps.map((e) => parseExperienceDate(e.startDate)).filter((d): d is Date => d !== null);
  if (dates.length === 0) return null;
  return dates.reduce((min, d) => (d < min ? d : min), dates[0]);
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<ProfileRow | null> {
  const rows = await db.select().from(profiles).limit(1);
  return rows[0] ?? null;
}

export async function getSocialLinks(profileId: number): Promise<SocialLinkRow[]> {
  return db
    .select()
    .from(socialLinks)
    .where(eq(socialLinks.profileId, profileId))
    .orderBy(socialLinks.sortOrder);
}

export async function getSkills(profileId: number): Promise<SkillRow[]> {
  return db
    .select()
    .from(skills)
    .where(eq(skills.profileId, profileId))
    .orderBy(skills.sortOrder);
}

export async function getExperiences(profileId: number): Promise<ParsedExperience[]> {
  const rows = await db
    .select()
    .from(experiences)
    .where(eq(experiences.profileId, profileId))
    .orderBy(experiences.sortOrder);
  return rows.map((r) => ({
    ...r,
    tech: parseJSON<string[]>(r.tech, []),
    responsibilities: parseJSON<string[]>(r.responsibilities, []),
  }));
}

export async function getCertifications(profileId: number): Promise<CertificationRow[]> {
  return db
    .select()
    .from(certifications)
    .where(eq(certifications.profileId, profileId))
    .orderBy(certifications.sortOrder);
}

export async function getProjects(profileId: number): Promise<ParsedProject[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.profileId, profileId))
    .orderBy(projects.sortOrder);
  return rows.map((r) => ({
    ...r,
    tech: parseJSON<string[]>(r.tech, []),
    responsibilities: parseJSON<string[]>(r.responsibilities, []),
  }));
}

export async function getSetting(key: string): Promise<string | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, key));
  return rows[0]?.value ?? null;
}

/** Fetch all profile data needed to render the public site in one pass. */
export async function getAllProfileData() {
  const profile = await getProfile();
  if (!profile) return null;

  const [allSkills, allExperiences, allCertifications, allProjects, allSocialLinks] =
    await Promise.all([
      getSkills(profile.id),
      getExperiences(profile.id),
      getCertifications(profile.id),
      getProjects(profile.id),
      getSocialLinks(profile.id),
    ]);

  const careerStart = earliestExperienceStart(allExperiences) ?? profile.careerStartDate;

  return {
    profile,
    skills: allSkills,
    experiences: allExperiences,
    certifications: allCertifications,
    projects: allProjects,
    socialLinks: allSocialLinks,
    yearsOfExperience: calcExperience(careerStart),
  };
}

// ── Mutations (used by Admin CMS in Phase 2) ──────────────────────────────────

export async function upsertProfile(data: Omit<typeof profiles.$inferInsert, "id">) {
  const existing = await getProfile();
  if (existing) {
    await db.update(profiles).set(data).where(eq(profiles.id, existing.id));
  } else {
    await db.insert(profiles).values(data);
  }
}
