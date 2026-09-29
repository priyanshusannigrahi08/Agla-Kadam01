import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/ai-mentor/rateLimiter";
import { classifyUserIntent } from "@/lib/ai-mentor/intentClassifier";

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
    const question = String(body?.question || "").trim();

    if (!question) {
      return NextResponse.json(
        { error: "Please provide a question to navigate." },
        { status: 400 }
      );
    }

    const intent = classifyUserIntent(question);

    // Recommended journey based on detected intent and question
    const suggestedActions = [
      {
        step: 1,
        title: "Clarify the Core Constraint",
        description: "Identify what is holding you back right now (skills, confidence, clarity, or opportunities).",
      },
      {
        step: 2,
        title: "Consult the Dedicated AI Mentor",
        description: "Get an initial structured breakdown and tailored learning/decision roadmap.",
      },
      {
        step: 3,
        title: "Take a Low-Risk Action (Agla Kadam)",
        description: "Execute a 3-7 day experiment (mini-project, application, or syllabus review).",
      },
      {
        step: 4,
        title: "Connect with a Real Human Mentor",
        description: "Book a targeted 1-on-1 guidance call when you need company-specific insights or live portfolio critique.",
      },
    ];

    return NextResponse.json({
      intent,
      suggestedActions,
    });
  } catch (error) {
    console.error("Navigator route error:", error);
    return NextResponse.json(
      { error: "Failed to navigate request." },
      { status: 500 }
    );
  }
}
