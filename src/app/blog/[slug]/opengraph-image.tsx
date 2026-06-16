import { ImageResponse } from "next/og";
import { getAllPosts, getPost } from "@/domains/blog/lib/blog";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let title = "Blog Post";
  let description = "";
  let tags: string[] = [];

  try {
    const post = getPost(slug);
    title = post.title;
    description = post.description;
    tags = post.tags;
  } catch {
    // fallback values already set
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "60px",
          background: "linear-gradient(135deg, #2c2523 0%, #1e1917 60%, #0d1a1c 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(21,209,233,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div
            style={{ width: 6, height: 40, background: "#15d1e9", borderRadius: 3 }}
          />
          <span style={{ color: "#15d1e9", fontSize: 16, letterSpacing: "0.1em" }}>
            MOHANA SRINIVASAN · BLOG
          </span>
        </div>

        <h1
          style={{
            fontSize: title.length > 50 ? 44 : 54,
            fontWeight: 700,
            color: "#f1e1d9",
            margin: "0 0 16px",
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          {title}
        </h1>

        {description && (
          <p
            style={{
              fontSize: 20,
              color: "#978580",
              margin: "0 0 28px",
              maxWidth: 800,
              lineHeight: 1.5,
            }}
          >
            {description.length > 120 ? description.slice(0, 120) + "…" : description}
          </p>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              style={{
                padding: "5px 14px",
                background: "rgba(21,209,233,0.1)",
                border: "1px solid rgba(21,209,233,0.3)",
                borderRadius: 20,
                color: "#15d1e9",
                fontSize: 15,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
