import { NextRequest, NextResponse } from "next/server";
import { getApprovedComments, insertComment } from "@/db/queries";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const comments = await getApprovedComments(slug);
  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`comment:${ip}`, 5, 15 * 60_000); // 5 comments per 15 min
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many comments. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": "900" } }
    );
  }

  try {
    const { slug, author, email, body } = await req.json();

    if (!slug || !author?.trim() || !email?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    if (body.length > 1000) {
      return NextResponse.json({ error: "Comment too long (max 1000 chars)." }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? undefined;
    await insertComment(slug, author.trim(), email.trim(), body.trim(), ip);

    return NextResponse.json({ ok: true, message: "Comment submitted for review." });
  } catch (err) {
    console.error("Comment API error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
