import type { Metadata } from "next";
import { virtualMentors } from "@/app/data/virtualMentors";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mentor = virtualMentors.find((item) => item.id.toLowerCase() === id.toLowerCase());

  if (!mentor) return { title: "AI mentor not found" };

  return {
    title: `Talk with ${mentor.name}`,
    description: mentor.bio,
  };
}

export default function AiMentorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
