import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type MentorProfile = {
  id: string;
  name: string;
  profession: string;
  bio: string;
};

const mentors: Record<string, MentorProfile> = {
  "arjun-mehta": {
    id: "arjun-mehta",
    name: "Arjun Mehta",
    profession: "Software Engineering",
    bio: "Helping aspiring and working software engineers build practical skills, strong projects, and clear career roadmaps.",
  },

  "vikram-rao": {
    id: "vikram-rao",
    name: "Vikram Rao",
    profession: "Finance & Accounting",
    bio: "Helping students and professionals understand finance, accounting, qualifications, and possible career directions.",
  },

  "isha-menon": {
    id: "isha-menon",
    name: "Isha Menon",
    profession: "Teaching & Education",
    bio: "Guidance for aspiring educators exploring teaching careers, qualifications, and opportunities in education.",
  },
};

const DEFAULT_MODEL = "gemini-3.6-flash";

function getMentor(mentorId: string): MentorProfile | null {
  return mentors[mentorId] ?? null;
}

function buildSystemInstruction(mentor: MentorProfile): string {
  return `
You are ${mentor.name}, a virtual career mentor specializing in ${mentor.profession}.

Your profile:
${mentor.bio}

You are part of Agla Kadam, a career guidance platform.

Your job is to provide practical, personalized, beginner-friendly career guidance.

IMPORTANT BEHAVIOR:

1. Stay in character as ${mentor.name}.
2. Focus primarily on ${mentor.profession}, education, skills, careers, qualifications, projects, interviews, job preparation, and professional development.
3. Give useful answers instead of generic motivational statements.
4. Explain difficult concepts in simple language.
5. Break complicated goals into clear steps.
6. When appropriate, give:
   - roadmaps
   - learning plans
   - skill lists
   - project ideas
   - study strategies
   - interview preparation
   - career options
   - realistic next steps
7. Do not pretend to have personal real-world experiences that you do not actually have.
8. Do not claim to be a real human professional.
9. You are an AI virtual mentor.
10. Do not make decisions for the user. Help them understand their options.
11. If information depends on country, university, employer, professional body, or current regulations, clearly say that requirements can vary.
12. Ask a short follow-up question only when it would materially improve the advice.
13. Avoid unnecessary filler such as "That's a great question!".
14. Do not repeat the user's question unnecessarily.
15. Use clean Markdown.
16. Prefer headings, numbered steps, and bullet points when they improve readability.
17. Keep answers practical and actionable.
18. For technical questions, provide examples when useful.
19. For career questions, prioritize realistic paths rather than promising guaranteed outcomes.
20. Never invent qualifications, regulations, salaries, job openings, or facts.

The user's current goal is to receive useful career guidance from you.
`;
}

function cleanMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message): message is ChatMessage => {
      if (!message || typeof message !== "object") return false;

      const item = message as Record<string, unknown>;

      return (
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0
      );
    })
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .slice(-30);
}

function convertToGeminiHistory(messages: ChatMessage[]) {
  return messages.slice(0, -1).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [
      {
        text: message.content,
      },
    ],
  }));
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is not configured. Add GEMINI_API_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const mentorId =
      typeof body?.mentorId === "string" ? body.mentorId.trim() : "";

    const messages = cleanMessages(body?.messages);

    if (!mentorId) {
      return NextResponse.json(
        { error: "mentorId is required." },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "At least one message is required." },
        { status: 400 }
      );
    }

    const mentor = getMentor(mentorId);

    if (!mentor) {
      return NextResponse.json(
        { error: "Mentor not found." },
        { status: 404 }
      );
    }

    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "The last message must be from the user." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: DEFAULT_MODEL,
      systemInstruction: buildSystemInstruction(mentor),
    });

    const history = convertToGeminiHistory(messages);

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1800,
      },
    });

    const result = await chat.sendMessage(lastMessage.content);

    const response = result.response;

    const reply = response.text();

    if (!reply || !reply.trim()) {
      return NextResponse.json(
        {
          error:
            "The mentor generated an empty response. Please try asking your question again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reply: reply.trim(),
      mentor: {
        id: mentor.id,
        name: mentor.name,
        profession: mentor.profession,
      },
      model: DEFAULT_MODEL,
    });
  } catch (error: unknown) {
    console.error("AI Mentor API Error:", error);

    let message = "The mentor could not respond. Please try again.";

    if (error instanceof Error) {
      message = error.message;
    }

    if (
      message.includes("API key") ||
      message.includes("API_KEY") ||
      message.includes("authentication")
    ) {
      message =
        "The Gemini API key is missing or invalid. Check GEMINI_API_KEY in your environment variables.";
    }

    if (
      message.includes("not found") ||
      message.includes("not available") ||
      message.includes("deprecated")
    ) {
      message =
        "The configured Gemini model is unavailable. The app is configured to use gemini-3.6-flash.";
    }

    if (
      message.includes("quota") ||
      message.includes("RESOURCE_EXHAUSTED")
    ) {
      message =
        "The Gemini API quota has been reached. Please check your Gemini API usage and quota.";
    }

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}
