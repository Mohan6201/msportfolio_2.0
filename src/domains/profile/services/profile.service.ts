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

/** Years of experience auto-calculated from career_start_date */
export function calcExperience(careerStartDate: string): string {
  const start = new Date(careerStartDate);
  const now = new Date();
  const years = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const rounded = Math.floor(years * 2) / 2; // nearest 0.5
  return `${rounded}+ years`;
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

  return {
    profile,
    skills: allSkills,
    experiences: allExperiences,
    certifications: allCertifications,
    projects: allProjects,
    socialLinks: allSocialLinks,
    yearsOfExperience: calcExperience(profile.careerStartDate),
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
