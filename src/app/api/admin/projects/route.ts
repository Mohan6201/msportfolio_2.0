import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { projects } from "@/db/schema/profile";
import { getProfile } from "@/domains/profile/services/profile.service";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ data: [] });
  const data = await db.select().from(projects).where(eq(projects.profileId, profile.id)).orderBy(projects.sortOrder);
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });
  const { tech, responsibilities, ...rest } = await req.json();
  const [row] = await db.insert(projects).values({
    ...rest,
    profileId: profile.id,
    tech: JSON.stringify(Array.isArray(tech) ? tech : []),
    responsibilities: JSON.stringify(Array.isArray(responsibilities) ? responsibilities : []),
  }).returning();
  return NextResponse.json({ data: row });
}
