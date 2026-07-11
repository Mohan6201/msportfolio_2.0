import type { MetadataRoute } from "next";

const SITE_URL = "https://m-s-r-portfolio.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/recruiter", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
