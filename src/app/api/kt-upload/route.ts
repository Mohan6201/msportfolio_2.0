import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { ktDocuments } from "@/db/schema/legacy";
import { indexKnowledgeDocument } from "@/ai/workflows/indexKnowledgeDocument";

const CATEGORIES = ["AWS", "Docker", "Kubernetes", "Linux", "Terraform", "DevOps", "CI/CD", "Ansible", "Networking", "Azure", "Systems", "Cloud"];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Reference"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string | null)?.trim();
    const category = (formData.get("category") as string | null) ?? "DevOps";
    const level = (formData.get("level") as string | null) ?? "Reference";

    if (!file || !title) return NextResponse.json({ error: "file and title are required" }, { status: 400 });
    if (!file.name.endsWith(".pdf")) return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 50 MB)" }, { status: 400 });
    if (!CATEGORIES.includes(category)) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    if (!LEVELS.includes(level)) return NextResponse.json({ error: "Invalid level" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    let storageUrl: string | null = null;

    // Try Vercel Blob first; fall back to DB blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(`kt-documents/${file.name}`, Buffer.from(arrayBuffer), {
        access: "public",
        contentType: "application/pdf",
      });
      storageUrl = blob.url;
    }

    // Insert or update metadata
    const rows = await db
      .insert(ktDocuments)
      .values({
        title,
        filename: file.name,
        category,
        level,
        fileData: storageUrl ? undefined : Buffer.from(arrayBuffer),
        fileSize: file.size,
        storageUrl,
      })
      .onConflictDoUpdate({
        target: ktDocuments.filename,
        set: {
          title,
          category,
          level,
          fileData: storageUrl ? undefined : Buffer.from(arrayBuffer),
          fileSize: file.size,
          storageUrl,
        },
      })
      .returning({ id: ktDocuments.id });

    const docId = rows[0]?.id;

    // Index asynchronously (don't block the upload response)
    if (docId && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      indexKnowledgeDocument(docId, arrayBuffer, "application/pdf").catch((e) =>
        console.error("KT index error:", e)
      );
    }

    return NextResponse.json({ ok: true, filename: file.name, title, category, level });
  } catch (err) {
    console.error("KT upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
