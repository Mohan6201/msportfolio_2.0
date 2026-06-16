import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getProfile } from "@/domains/profile/services/profile.service";

export async function GET(req: NextRequest) {
  const { error } = await requireUser(req);
  if (error) return error;

  const profile = await getProfile();
  if (!profile) return NextResponse.json({}, { status: 404 });

  return NextResponse.json({
    fullName: profile.fullName,
    title: profile.title,
    location: profile.location,
    email: profile.email,
  });
}
