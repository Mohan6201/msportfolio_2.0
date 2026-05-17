import { NextRequest, NextResponse } from "next/server";
import { getAllContacts, getAllComments, getAllSubscribers, getStats, markContactRead } from "@/db/queries";

function checkAdmin(req: NextRequest) {
  const secret =
    req.headers.get("x-admin-secret") ??
    req.nextUrl.searchParams.get("secret");
  return secret === process.env.ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tab = req.nextUrl.searchParams.get("tab") ?? "stats";

  if (tab === "contacts") {
    return NextResponse.json({ data: await getAllContacts() });
  }
  if (tab === "comments") {
    return NextResponse.json({ data: await getAllComments() });
  }
  if (tab === "subscribers") {
    return NextResponse.json({ data: await getAllSubscribers() });
  }

  return NextResponse.json({ stats: await getStats() });
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await markContactRead(Number(id));
  return NextResponse.json({ ok: true });
}
