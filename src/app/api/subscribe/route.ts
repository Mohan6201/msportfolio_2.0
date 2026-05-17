import { NextRequest, NextResponse } from "next/server";
import { insertSubscriber } from "@/db/queries";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    await insertSubscriber(email.trim().toLowerCase());
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe API error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
