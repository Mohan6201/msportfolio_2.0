import { NextRequest, NextResponse } from "next/server";
import { generateAWSArchitecture } from "@/ai/agents/generateDevOpsConfig";
import { logAiUsage } from "@/domains/analytics/services/analytics.service";

export async function POST(req: NextRequest) {
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
