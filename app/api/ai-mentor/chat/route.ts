import { NextRequest, NextResponse } from "next/server";
import { virtualMentors } from "@/app/data/virtualMentors";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function normalizeMentorId(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

async function generateWithGemini(
  model: string,
  apiKey: string,
  systemInstruction: string,
  contents: unknown[]
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
      }),
    }
  );

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      console.error("Gemini API key is missing");
      return NextResponse.json(
        { error: "AI service is not configured. Please add GEMINI_API_KEY to Vercel." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const mentorId = normalizeMentorId(body?.mentorId);
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const mentor = virtualMentors.find(
      (item) => normalizeMentorId(item.id) === mentorId
    );

    if (!mentor) {
      console.error("AI mentor not found", {
        receivedMentorId: mentorId,
        availableMentorIds: virtualMentors.map((item) => item.id),
      });

      return NextResponse.json({ error: "Mentor not found." }, { status: 404 });
    }

    const conversation: ChatMessage[] = messages
      .filter((item: unknown): item is ChatMessage => {
        if (!item || typeof item !== "object") return false;
        const message = item as ChatMessage;
        return (
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim().length > 0
        );
      })
      .slice(-20);

    if (conversation.length === 0) {
      return NextResponse.json(
        { error: "Please send a message to the mentor." },
        { status: 400 }
      );
    }

    const systemInstruction = `You are ${mentor.name}, a virtual mentor on the Agla Kadam mentorship platform.
Your professional specialization is: ${mentor.profession}.
Your areas of expertise are: ${mentor.expertise.join(", ")}.
Your profile: ${mentor.bio}
Stay in character as this mentor. Give practical, specific, encouraging guidance. Ask useful follow-up questions when context is missing. Break complex plans into clear next steps. Do not pretend to have real-world personal experiences, employment, qualifications, or credentials beyond this fictional mentor profile. Never claim to be a human. If asked directly whether you are AI, answer honestly that you are an AI-powered virtual mentor.
For medical, legal, financial, mental-health, or other high-stakes topics, provide general educational guidance and encourage the user to consult an appropriately qualified professional when necessary. Do not diagnose or present your guidance as professional advice.
Keep answers concise unless the user asks for a detailed plan.`;

    const contents = conversation.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    // Try the current fast model first, then fall back to a widely available model.
    const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
    let lastError: unknown = null;

    for (const model of models) {
      const { response, data } = await generateWithGemini(
        model,
        apiKey,
        systemInstruction,
        contents
      );

      if (response.ok) {
        const reply =
          data?.candidates?.[0]?.content?.parts
            ?.map((part: { text?: string }) => part.text ?? "")
            .join("")
            .trim();

        if (reply) {
          return NextResponse.json({ reply });
        }

        lastError = { model, message: "Gemini returned an empty response" };
        continue;
      }

      lastError = { model, status: response.status, data };
      console.error("Gemini API error", lastError);

      // Authentication and quota errors will affect every model, so don't retry unnecessarily.
      if (response.status === 401 || response.status === 403 || response.status === 429) {
        break;
      }
    }

    const status =
      typeof lastError === "object" && lastError !== null && "status" in lastError
        ? Number((lastError as { status?: number }).status) || 502
        : 502;

    let error = "The mentor could not respond right now. Please try again.";

    if (status === 401 || status === 403) {
      error = "The AI service API key was rejected. Check GEMINI_API_KEY in Vercel.";
    } else if (status === 429) {
      error = "The AI service is temporarily rate-limited. Please try again shortly.";
    }

    return NextResponse.json({ error }, { status });
  } catch (error) {
    console.error("AI mentor route error:", error);
    return NextResponse.json(
      { error: "Something went wrong while contacting the mentor." },
      { status: 500 }
    );
  }
}
