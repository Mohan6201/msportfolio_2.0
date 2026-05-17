import { NextRequest, NextResponse } from "next/server";
import { insertKTDocument } from "@/db/queries";

export const config = { api: { bodyParser: false } };

const CATEGORIES = ["AWS", "Docker", "Kubernetes", "Linux", "Terraform", "DevOps", "CI/CD", "Ansible", "Networking", "Azure", "Systems", "Cloud"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Reference"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string | null)?.trim();
    const category = (formData.get("category") as string | null) ?? "DevOps";
    const level = (formData.get("level") as string | null) ?? "Reference";

    if (!file || !title) {
      return NextResponse.json({ error: "file and title are required" }, { status: 400 });
    }
    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 50 MB)" }, { status: 400 });
    }
    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (!LEVELS.includes(level)) {
      return NextResponse.json({ error: "Invalid level" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await insertKTDocument(title, file.name, category, level, buffer);

    return NextResponse.json({ ok: true, filename: file.name, title, category, level });
  } catch (err) {
    console.error("KT upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
