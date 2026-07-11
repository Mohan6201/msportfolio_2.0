import { NextRequest, NextResponse } from "next/server";
import { getAllContacts, getAllSubscribers, getStats, getDashboardStats, markContactRead } from "@/db/queries";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const tab = req.nextUrl.searchParams.get("tab") ?? "stats";

  if (tab === "contacts")    return NextResponse.json({ data: await getAllContacts() });
  if (tab === "subscribers") return NextResponse.json({ data: await getAllSubscribers() });
  if (tab === "dashboard")   return NextResponse.json(await getDashboardStats());

  return NextResponse.json({ stats: await getStats() });
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { id } = await req.json();
  await markContactRead(Number(id));
  return NextResponse.json({ ok: true });
}
