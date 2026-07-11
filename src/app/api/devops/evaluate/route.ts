import { NextRequest, NextResponse } from "next/server";
import { evaluateProject } from "@/ai/agents/evaluateProject";
import { logAiUsage } from "@/domains/analytics/services/analytics.service";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`devops-evaluate:${ip}`, 10, 60_000); // 10/min — each call is a paid LLM request
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const { input } = await req.json() as { input?: string };
  if (!input?.trim() || input.trim().length < 20) {
    return NextResponse.json({ error: "Please provide at least 20 characters describing your project." }, { status: 400 });
  }
  if (input.trim().length > 2000) {
    return NextResponse.json({ error: "Input too long. Limit to 2000 characters." }, { status: 400 });
  }

  try {
    const evaluation = await evaluateProject(input.trim());
    logAiUsage("project-evaluator").catch(() => undefined);
    return NextResponse.json({ evaluation });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Evaluation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
