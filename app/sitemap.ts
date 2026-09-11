import type { MetadataRoute } from "next";
import { ARTICLES } from "@/app/data/articles";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const SITE_URL = "https://agla-kadam.vercel.app";

type MentorIdRow = { id: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/mentors`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/find-mentor`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/mentor`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/mentee`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
  const articleEntries: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  let mentorEntries: MetadataRoute.Sitemap = [];
  try {
    const admin = getSupabaseAdmin();
    const { data: mentors } = await admin.from("mentors_public").select("id");
    mentorEntries = ((mentors || []) as MentorIdRow[]).map((mentor) => ({
      url: `${SITE_URL}/mentors/${mentor.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Sitemap mentor query error", error);
  }
  return [...staticEntries, ...articleEntries, ...mentorEntries];
}
