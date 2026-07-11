import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { libsqlClient } from "@/db/client";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`recruiter-signup:${ip}`, 5, 15 * 60_000); // 5 signups per 15 min
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": "900" } }
    );
  }

  const body = await req.json() as {
    name?: string; email?: string; company?: string; password?: string;
  };
  const { name, email, company, password } = body;

  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
  }

  const displayName = company?.trim()
    ? `${name.trim()} · ${company.trim()}`
    : name.trim();

  try {
    await auth.api.signUpEmail({
      body: { name: displayName, email: email.trim(), password },
      headers: req.headers,
    });

    await libsqlClient.execute({
      sql: "UPDATE users SET role = 'recruiter' WHERE email = ?",
      args: [email.trim()],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Signup failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
