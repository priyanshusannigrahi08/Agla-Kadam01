import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

type MentorMetadata = {
  name: string;
  headline: string | null;
  role: string | null;
  company: string | null;
  bio: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return { title: "Mentor" };

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data } = await supabase
    .from("mentors_public")
    .select("name,headline,role,company,bio")
    .eq("id", id)
    .maybeSingle();
  const mentor = data as MentorMetadata | null;

  if (!mentor) return { title: "Mentor not found" };

  const role = mentor.headline || [mentor.role, mentor.company].filter(Boolean).join(" at ") || "Mentor";
  const description = (mentor.bio || `${mentor.name} is available for a focused AglaKadam mentoring conversation.`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  return {
    title: `${mentor.name} — ${role}`,
    description,
  };
}

export default function MentorProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
