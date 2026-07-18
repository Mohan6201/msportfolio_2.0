import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { resumeDataSchema } from "@/ai/schemas/resumeExtraction";
import { generateResumeDocx } from "@/domains/resume/services/generateResumeDocx";

export const maxDuration = 30;

// Stateless by design, unlike the [id]-scoped resume routes: this one takes resumeData directly
// in the body rather than looking up a stored version, since the client already holds
// authorized data from its own earlier authenticated fetch. That also means it transparently
// supports exporting the AI-tailored-but-not-yet-applied "Optimize" tab result, which has no
// persisted version yet — an [id]-scoped route couldn't do that. Because it trusts client-
// supplied JSON shape by design (no DB ownership check to fall back on), zod validation against
// resumeDataSchema below is the real security guard here, not a nicety.
export async function POST(req: NextRequest) {
  const { error } = await requireUser(req);
  if (error) return error;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { format } = body as { format?: string };
  const parsed = resumeDataSchema.safeParse(body.resumeData);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid resume data" }, { status: 400 });
  }

  if (format === "docx") {
    const buffer = await generateResumeDocx(parsed.data);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="resume.docx"',
      },
    });
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}
