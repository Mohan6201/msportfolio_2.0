// src/app/api/admin/visibility/route.ts
// NEW FILE — read/write section visibility from the settings key-value table

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { settings } from "@/db/schema/profile";
import { eq } from "drizzle-orm";

const VISIBILITY_KEY = "section_visibility";

const DEFAULTS: Record<string, boolean> = {
  about: true,
  experience: true,
  skills: true,
  projects: true,
  certifications: true,
  achievements: true,
  resume: true,
  services: true,
  careerCentre: true,
  githubStats: true,
  ktCentre: true,
  blog: true,
  contact: true,
};

async function getVisibility(): Promise<Record<string, boolean>> {
  const rows = await db.select().from(settings).where(eq(settings.key, VISIBILITY_KEY)).limit(1);
  if (!rows[0]) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(rows[0].value) };
  } catch {
    return DEFAULTS;
  }
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  return NextResponse.json(await getVisibility());
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json() as Record<string, boolean>;
  const current = await getVisibility();
  const merged = { ...current, ...body };

  await db
    .insert(settings)
    .values({ key: VISIBILITY_KEY, value: JSON.stringify(merged) })
    .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(merged) } });

  return NextResponse.json(merged);
}
