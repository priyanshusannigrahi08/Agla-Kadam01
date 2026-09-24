import type { MetadataRoute } from "next";

const SITE_URL = "https://agla-kadam.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/book/",
        "/career-memory",
        "/conversation/",
        "/dashboard",
        "/goals",
        "/mentor/dashboard",
        "/mentor/evidence",
        "/profile-setup",
        "/settings",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
