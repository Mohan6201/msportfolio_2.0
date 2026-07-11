import { db } from "@/db/client";
import { projects, certifications } from "@/db/schema/profile";
import { ktDocuments } from "@/db/schema/legacy";
import { interviewQuestions } from "@/db/schema/interview";
import { pageViews } from "@/db/schema/analytics";
import { getProfile, calcExperience } from "@/domains/profile/services/profile.service";
import { count } from "drizzle-orm";

export interface AchievementsData {
  yearsExperience: string;
  projectsDelivered: number;
  certificationsEarned: number;
  ktDocuments: number;
  interviewQuestions: number;
  totalPageViews: number;
}

export async function getAchievements(): Promise<AchievementsData> {
  try {
    const [profile, projectCount, certCount, ktCount, iqCount, pvCount] = await Promise.all([
      getProfile(),
      db.select({ count: count() }).from(projects),
      db.select({ count: count() }).from(certifications),
      db.select({ count: count() }).from(ktDocuments),
      db.select({ count: count() }).from(interviewQuestions),
      db.select({ count: count() }).from(pageViews),
    ]);

    return {
      yearsExperience: profile ? calcExperience(profile.careerStartDate) : "0+ years",
      projectsDelivered: projectCount[0]?.count ?? 0,
      certificationsEarned: certCount[0]?.count ?? 0,
      ktDocuments: ktCount[0]?.count ?? 0,
      interviewQuestions: iqCount[0]?.count ?? 0,
      totalPageViews: pvCount[0]?.count ?? 0,
    };
  } catch {
    return {
      yearsExperience: "0+ years",
      projectsDelivered: 0,
      certificationsEarned: 0,
      ktDocuments: 0,
      interviewQuestions: 0,
      totalPageViews: 0,
    };
  }
}
