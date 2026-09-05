import type { MetadataRoute } from "next";

const SITE_URL = "https://agla-kadam.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/mentors`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/find-mentor`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/mentor`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/mentee`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
