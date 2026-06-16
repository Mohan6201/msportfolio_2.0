import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getPost } from "@/domains/blog/lib/blog";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

interface BlogPayload {
  title: string;
  date: string;
  description: string;
  tags: string[];
  readTime: string;
  content: string;
}

/** Resolve a safe path inside BLOG_DIR for the given slug, or null if invalid. */
function resolveFile(slug: string): string | null {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null;
  const filepath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!filepath.startsWith(BLOG_DIR)) return null;
  return filepath;
}

function buildMdx(data: Omit<BlogPayload, "content">, content: string): string {
  const frontmatter = {
    title: data.title,
    date: data.date,
    description: data.description,
    tags: Array.isArray(data.tags) ? data.tags : [],
    readTime: data.readTime,
  };
  return matter.stringify(content ?? "", frontmatter);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { slug } = await params;
  const filepath = resolveFile(slug);
  if (!filepath || !fs.existsSync(filepath)) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  try {
    const data = getPost(slug);
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Failed to read post." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { slug } = await params;
  const filepath = resolveFile(slug);
  if (!filepath || !fs.existsSync(filepath)) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const body = (await req.json()) as Partial<BlogPayload>;
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const mdx = buildMdx(
    {
      title: body.title.trim(),
      date: body.date || new Date().toISOString().slice(0, 10),
      description: body.description ?? "",
      tags: Array.isArray(body.tags) ? body.tags : [],
      readTime: body.readTime ?? "",
    },
    body.content ?? ""
  );

  fs.writeFileSync(filepath, mdx, "utf-8");
  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  const { slug } = await params;
  const filepath = resolveFile(slug);
  if (!filepath || !fs.existsSync(filepath)) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
  fs.unlinkSync(filepath);
  return NextResponse.json({ ok: true });
}
