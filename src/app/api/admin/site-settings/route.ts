import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { CHAT_MODEL, EXTRACT_MODEL, EMBED_MODEL } from "@/ai/providers/gateway";

/**
 * Read-only site configuration snapshot for the admin dashboard.
 * SECURITY: never returns secret values — only booleans indicating whether
 * an env var is set, plus non-sensitive runtime metadata.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const isSet = (v: string | undefined) => Boolean(v && v.trim().length > 0);

  const deploymentUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "https://m-s-r-portfolio.vercel.app";

  // model() ids — pull a readable label without importing provider internals.
  const modelId = (m: unknown) =>
    (m as { modelId?: string })?.modelId ?? String(m);

  return NextResponse.json({
    environment: {
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      nodeVersion: process.version,
      vercelEnv: process.env.VERCEL_ENV ?? "local",
      deploymentUrl,
      region: process.env.VERCEL_REGION ?? null,
    },
    models: {
      chat: modelId(CHAT_MODEL),
      extract: modelId(EXTRACT_MODEL),
      embedding: modelId(EMBED_MODEL),
    },
    features: {
      googleOAuth: isSet(process.env.GOOGLE_CLIENT_ID),
      ktCentre: true,
      jobBoard: isSet(process.env.ADZUNA_APP_ID) || isSet(process.env.JSEARCH_API_KEY),
      aiResume: isSet(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
      interview: isSet(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    },
    connectedServices: {
      GOOGLE_GENERATIVE_AI_API_KEY: isSet(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
      ADZUNA_APP_ID: isSet(process.env.ADZUNA_APP_ID),
      JSEARCH_API_KEY: isSet(process.env.JSEARCH_API_KEY),
      RESEND_API_KEY: isSet(process.env.RESEND_API_KEY),
      DATABASE_URL: isSet(process.env.DATABASE_URL),
      TURSO_AUTH_TOKEN: isSet(process.env.TURSO_AUTH_TOKEN),
    },
  });
}
