import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/accountAuth";
import { resumeUploadFlow } from "@/ai/workflows/resumeUploadFlow";

export const maxDuration = 60;

const ALLOWED_TYPES = ["application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export async function POST(req: NextRequest) {
  const { session, error } = await requireUser(req);
  if (error) return error;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const resumeTitle = (formData.get("title") as string | null) ?? "Uploaded Resume";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF and DOCX files are supported" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 5MB" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();

  try {
    const result = await resumeUploadFlow(session!.user.id, resumeTitle, bytes, file.type);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[resume/upload] AI extraction error:", err);
    return NextResponse.json({ error: `Resume parsing failed: ${message}` }, { status: 500 });
  }
}
