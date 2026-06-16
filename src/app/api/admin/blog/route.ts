import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getAllPosts } from "@/domains/blog/lib/blog";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

interface BlogPayload {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readTime: string;
  content: string;
}

/** Serialize frontmatter + body into an MDX file string. */
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

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;
  try {
    const data = getAllPosts();
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = (await req.json()) as Partial<BlogPayload>;
  const slug = (body.slug ?? "").trim();

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "Invalid slug. Use lowercase letters, numbers and hyphens only." },
      { status: 400 }
    );
  }
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });

  const filepath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (fs.existsSync(filepath)) {
    return NextResponse.json(
      { error: `A post with slug "${slug}" already exists.` },
      { status: 409 }
    );
  }

  const mdx = buildMdx(
    {
      slug,
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
