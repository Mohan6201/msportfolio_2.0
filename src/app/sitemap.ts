import type { MetadataRoute } from "next";

const SITE_URL = "https://m-s-r-portfolio.vercel.app";

const STATIC_ROUTES = [
  "",
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
  return STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
