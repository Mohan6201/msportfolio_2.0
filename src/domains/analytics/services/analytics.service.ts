import { desc, sql, eq, count } from "drizzle-orm";
import { db } from "@/db/client";
import { pageViews, aiUsageLogs, resumeDownloads } from "@/db/schema/analytics";

export async function logPageView(path: string, visitorHash?: string) {
  await db.insert(pageViews).values({ path, visitorHash });
}

export async function logAiUsage(feature: string, tokensUsed = 0) {
  await db.insert(aiUsageLogs).values({ feature, tokensUsed });
}

export async function logResumeDownload(resumeVersionId?: number) {
  await db.insert(resumeDownloads).values({ resumeVersionId });
}

export async function getAnalyticsSummary() {
  const [totalViews, todayViews, topPages, aiBreakdown, downloads] = await Promise.all([
    db.select({ total: count() }).from(pageViews),

    db
      .select({ total: count() })
      .from(pageViews)
      .where(sql`date(${pageViews.createdAt}) = date('now')`),

    db
      .select({ path: pageViews.path, views: count() })
      .from(pageViews)
      .groupBy(pageViews.path)
      .orderBy(desc(count()))
      .limit(10),

    db
      .select({ feature: aiUsageLogs.feature, calls: count(), tokens: sql<number>`sum(${aiUsageLogs.tokensUsed})` })
      .from(aiUsageLogs)
      .groupBy(aiUsageLogs.feature)
      .orderBy(desc(count()))
      .limit(10),

    db.select({ total: count() }).from(resumeDownloads),
  ]);

  return {
    pageViews: { total: totalViews[0]?.total ?? 0, today: todayViews[0]?.total ?? 0 },
    topPages,
    aiUsage: aiBreakdown,
    resumeDownloads: downloads[0]?.total ?? 0,
  };
}
