import { NextRequest, NextResponse } from "next/server";
import { virtualMentors } from "@/app/data/virtualMentors";
import { MENTOR_PERSONAS } from "@/lib/ai-mentor/mentorPersonas";
import { checkRateLimit } from "@/lib/ai-mentor/rateLimiter";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous-client";

    const rateLimit = checkRateLimit(clientIp, 40, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const query = String(body?.query || body?.situation || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json(
        { error: "Please provide a search query or situation to match." },
        { status: 400 }
      );
    }

    // Score all 15 mentors based on relevance to query keywords and problem types
    const scoredMentors = virtualMentors.map((mentor) => {
      let score = 0;
      const persona = MENTOR_PERSONAS[mentor.id];

      // Match name
      if (query.includes(mentor.name.toLowerCase())) score += 50;

      // Match profession
      if (query.includes(mentor.profession.toLowerCase())) score += 30;

      // Match expertise keywords
      mentor.expertise.forEach((exp) => {
        const words = exp.toLowerCase().split(/\s+/);
        words.forEach((w) => {
          if (w.length > 2 && query.includes(w)) score += 15;
        });
      });

      // Match persona problem types
      if (persona?.methodology?.problemTypes) {
        persona.methodology.problemTypes.forEach((pt) => {
          const ptWords = pt.toLowerCase().split(/\s+/);
          ptWords.forEach((w) => {
            if (w.length > 3 && query.includes(w)) score += 8;
          });
        });
      }

      return {
        mentor,
        score,
      };
    });

    scoredMentors.sort((a, b) => b.score - a.score);

    const matches = scoredMentors.slice(0, 3).map((item) => ({
      ...item.mentor,
      matchConfidence: item.score > 0 ? Math.min(95, 50 + item.score) : 40,
    }));

    return NextResponse.json({
      bestMatch: matches[0],
      alternativeMatches: matches.slice(1),
    });
  } catch (error) {
    console.error("Match route error:", error);
    return NextResponse.json(
      { error: "Failed to process mentor match." },
      { status: 500 }
    );
  }
}
