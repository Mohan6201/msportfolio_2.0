import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/domains/blog/lib/blog";
import { BookOpen, Clock, ArrowLeft, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Mohana Srinivasan — DevOps & Cloud Engineering",
  description: "DevOps and cloud engineering insights — CI/CD, AWS, Docker, Kubernetes, Terraform, and more.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-darkBrown grid-bg">
      {/* Header */}
      <div className="relative pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="absolute -top-20 right-20 w-80 h-80 rounded-full bg-cyan/4 blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-lightGrey hover:text-cyan transition-colors text-sm font-mono mb-6 sm:mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Portfolio
          </Link>
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Terminal className="w-5 h-5 text-cyan" />
            </div>
            <div>
              <p className="section-tag mb-2">Technical Writing</p>
              <h1 className="font-special text-3xl sm:text-5xl font-bold text-white">DevOps Blog</h1>
            </div>
          </div>
          <p className="text-lightGrey max-w-xl font-mono text-sm mt-2">
            Deep dives into AWS, CI/CD patterns, container orchestration, and infrastructure automation.
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 text-xs sm:text-sm font-mono text-lightGrey/50">
            <span>{posts.length} articles</span>
            <span>·</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 mr-1" />AWS · DevOps · Cloud</span>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {posts.length === 0 && (
          <div className="terminal p-10 text-center">
            <p className="terminal-prompt">$ ls articles/</p>
            <p className="terminal-output mt-2">No articles yet. Check back soon.</p>
          </div>
        )}

        <div className="flex flex-col gap-5">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="glass glass-hover rounded-2xl p-5 sm:p-6 border border-white/5 group block">
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span key={tag} className="badge badge-cyan">{tag}</span>
                ))}
              </div>
              <h2 className="font-special text-lg sm:text-xl font-bold text-white group-hover:text-cyan transition-colors duration-200 mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-lightGrey text-sm leading-relaxed mb-4">{post.description}</p>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex items-center gap-4 text-xs font-mono text-lightGrey/60">
                  <span>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
                <span className="text-xs font-mono text-cyan group-hover:text-lightCyan transition-colors">Read more →</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 p-6 glass rounded-2xl border border-cyan/10 text-center">
          <p className="text-lightGrey text-sm font-mono mb-3">More articles on their way. Subscribe below.</p>
          <Link href="/#contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan text-black text-xs font-mono font-bold hover:bg-lightCyan transition-colors shadow-cyanShadow">
            Stay Updated →
          </Link>
        </div>
      </div>
    </main>
  );
}
