import { NextRequest, NextResponse } from "next/server";
import { virtualMentors } from "@/app/data/virtualMentors";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "AI service is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const mentorId = String(body.mentorId || "");
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const mentor = virtualMentors.find((item) => item.id === mentorId);

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found." }, { status: 404 });
    }

    const conversation: ChatMessage[] = messages
      .filter(
        (item: unknown): item is ChatMessage => {
          if (!item || typeof item !== "object") return false;
          const message = item as ChatMessage;
          return (
            (message.role === "user" || message.role === "assistant") &&
            typeof message.content === "string"
          );
        })
      )
      .slice(-20);

    const instructions = `You are ${mentor.name}, a virtual mentor on the Agla Kadam mentorship platform.

Your professional specialization is: ${mentor.profession}.
Your areas of expertise are: ${mentor.expertise.join(", ")}.
Your profile: ${mentor.bio}

Stay in character as this mentor. Give practical, specific, encouraging guidance. Ask useful follow-up questions when context is missing. Break complex plans into clear next steps. Do not pretend to have real-world personal experiences, employment, qualifications, or credentials beyond this fictional mentor profile. Never claim to be a human. If asked directly whether you are AI, answer honestly that you are an AI-powered virtual mentor.

For medical, legal, financial, mental-health, or other high-stakes topics, provide general educational guidance and encourage the user to consult an appropriately qualified professional when necessary. Do not diagnose or present your guidance as professional advice.

Keep answers concise unless the user asks for a detailed plan.`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        instructions,
        input: conversation.map((message) => ({
          role: message.role,
          content: [
            {
              type: "input_text",
              text: message.content,
            },
          ],
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return NextResponse.json(
        { error: "The mentor could not respond right now." },
        { status: response.status }
      );
    }

    const reply =
      typeof data.output_text === "string" && data.output_text.trim()
        ? data.output_text.trim()
        : "I’m sorry, I couldn’t generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI mentor route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while contacting the mentor." },
      { status: 500 }
    );
  }
}
