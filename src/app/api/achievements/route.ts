import { NextResponse } from "next/server";
import { getAchievements } from "@/domains/analytics/services/achievements.service";

export async function GET() {
  const data = await getAchievements();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
