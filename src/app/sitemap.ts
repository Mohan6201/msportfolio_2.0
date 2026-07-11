import type { MetadataRoute } from "next";
import { getAllPosts } from "@/domains/blog/lib/blog";

const SITE_URL = "https://m-s-r-portfolio.vercel.app";

const STATIC_ROUTES = [
  "",
  "/blog",
  "/blueprints",
  "/career-progress",
  "/certifications",
  "/devops-toolkit",
  "/monitoring-demo",
  "/profile",
  "/projects",
  "/services",
  "/skills",
  "/architecture",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...blogEntries];
}
