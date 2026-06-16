import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getProfile, upsertProfile } from "@/domains/profile/services/profile.service";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const profile = await getProfile();
  return NextResponse.json({ data: profile });
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const body = await req.json();
  await upsertProfile(body);
  return NextResponse.json({ ok: true });
}
