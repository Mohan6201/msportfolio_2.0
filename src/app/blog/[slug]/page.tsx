import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost, compileMarkdown } from "@/lib/blog";
import CommentSection from "@/components/blog/CommentSection";
import { ArrowLeft, Clock, Calendar } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPost(slug);
    return {
      title: `${post.title} | Mohana Srinivasan`,
      description: post.description,
      openGraph: {
        title: post.title,
        description: post.description,
        type: "article",
        publishedTime: post.date,
        tags: post.tags,
      },
    };
  } catch {
    return { title: "Post Not Found" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post;
  try {
    post = getPost(slug);
  } catch {
    notFound();
  }

  const html = await compileMarkdown(post.content);

  return (
    <main className="min-h-screen bg-darkBrown grid-bg">
      {/* Hero banner */}
      <div className="relative pt-24 pb-12 px-4 border-b border-white/5">
        <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full bg-cyan/4 blur-[100px] pointer-events-none" />
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-lightGrey hover:text-cyan transition-colors text-sm font-mono mb-8">
            <ArrowLeft className="w-4 h-4" /> All articles
          </Link>

          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag) => <span key={tag} className="badge badge-cyan">{tag}</span>)}
          </div>

          <h1 className="font-special text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-5 text-xs font-mono text-lightGrey/60 pb-6 border-b border-white/5">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />
              {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
          </div>
        </div>
      </div>

      {/* Article */}
      <div className="max-w-3xl mx-auto px-4 py-14">
        <article className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />
        <CommentSection slug={slug} />
        <div className="mt-16 pt-8 border-t border-white/5">
          <Link href="/blog" className="inline-flex items-center gap-2 text-cyan hover:text-lightCyan transition-colors font-mono text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to all articles
          </Link>
        </div>
      </div>
    </main>
  );
}
