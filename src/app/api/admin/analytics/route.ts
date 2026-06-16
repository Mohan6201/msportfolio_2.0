import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getAnalyticsSummary } from "@/domains/analytics/services/analytics.service";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const data = await getAnalyticsSummary();
  return NextResponse.json(data);
}
