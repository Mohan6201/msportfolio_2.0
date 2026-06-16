import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { getPreferences, upsertPreferences } from "@/domains/accounts/services/accounts.service";

export async function GET(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const prefs = await getPreferences(session!.user.id);
  return NextResponse.json(prefs ?? {});
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const body = await req.json();
  const prefs = await upsertPreferences(session!.user.id, body);
  return NextResponse.json(prefs);
}
