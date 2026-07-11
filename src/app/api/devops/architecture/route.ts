import { NextRequest, NextResponse } from "next/server";
import { generateAWSArchitecture } from "@/ai/agents/generateDevOpsConfig";
import { logAiUsage } from "@/domains/analytics/services/analytics.service";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`devops-architecture:${ip}`, 10, 60_000); // 10/min — each call is a paid LLM request
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const { requirements } = await req.json() as { requirements: string };
    if (!requirements?.trim()) {
      return NextResponse.json({ error: "requirements is required" }, { status: 400 });
    }
    if (requirements.length > 1000) {
      return NextResponse.json({ error: "Requirements too long (max 1000 chars)" }, { status: 400 });
    }

    const architecture = await generateAWSArchitecture(requirements.trim());
    await logAiUsage("aws-architecture-generator");
    return NextResponse.json({ architecture });
  } catch (err) {
    console.error("Architecture generation error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
