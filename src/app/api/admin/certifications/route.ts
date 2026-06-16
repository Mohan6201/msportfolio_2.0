import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/db/client";
import { certifications } from "@/db/schema/profile";
import { getProfile } from "@/domains/profile/services/profile.service";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ data: [] });
  const data = await db.select().from(certifications).where(eq(certifications.profileId, profile.id)).orderBy(certifications.sortOrder);
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });
  const body = await req.json();
  const [row] = await db.insert(certifications).values({ ...body, profileId: profile.id }).returning();
  return NextResponse.json({ data: row });
}
