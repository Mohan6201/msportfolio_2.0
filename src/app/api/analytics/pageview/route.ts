import { NextRequest, NextResponse } from "next/server";
import { logPageView } from "@/domains/analytics/services/analytics.service";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { createHash } from "crypto";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`pageview:${ip}`, 120, 60_000); // 120 pageviews/min per IP
  if (!rl.allowed) return NextResponse.json({ ok: false });

  try {
    const { path } = await req.json() as { path: string };
    if (!path || typeof path !== "string") return NextResponse.json({ ok: false });

    // Anonymous visitor hash: hash(IP + today's date) — no PII stored
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const today = new Date().toISOString().slice(0, 10);
    const visitorHash = createHash("sha256").update(`${ip}:${today}`).digest("hex").slice(0, 16);

    await logPageView(path, visitorHash);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
