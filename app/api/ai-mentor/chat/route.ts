import { NextRequest, NextResponse } from "next/server";
import { virtualMentors } from "@/app/data/virtualMentors";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type GeminiError = {
  error?: {
    message?: string;
    status?: string;
    code?: number;
  };
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

function getGeminiErrorMessage(data: unknown) {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    data.error &&
    typeof data.error === "object" &&
    "message" in data.error &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  return "Unknown Gemini API error";
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
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
      return NextResponse.json(
        {
          error:
            "AI service is not configured. Add GEMINI_API_KEY to Vercel and redeploy.",
        },
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
      return NextResponse.json(
        { error: "Mentor not found." },
        { status: 404 }
      );
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

Stay in character as this mentor. Give practical, specific, encouraging career guidance. Break complex plans into clear next steps. Ask a useful follow-up question when important context is missing.

Do not pretend to be a real human or claim real-world employment, qualifications, or experiences beyond this fictional mentor profile. If asked directly whether you are AI, answer honestly that you are an AI-powered virtual mentor.

For medical, legal, financial, mental-health, or other high-stakes topics, provide only general educational guidance and encourage the user to consult an appropriately qualified professional when necessary.

Keep answers concise unless the user asks for a detailed plan.`;

    const contents = conversation.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    // Try several Gemini models because availability can differ by API project and region.
    const models = [
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
    ];

    let lastStatus = 502;
    let lastMessage = "The AI service could not generate a response.";

    for (const model of models) {
      const { response, data } = await generateWithGemini(
        model,
        apiKey,
        systemInstruction,
        contents
      );

      if (response.ok) {
        const reply = data?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? "")
          .join("")
          .trim();

        if (reply) {
          return NextResponse.json({ reply });
        }

        lastStatus = 502;
        lastMessage = "The AI service returned an empty response. Please try again.";
        continue;
      }

      lastStatus = response.status;
      lastMessage = getGeminiErrorMessage(data);

      console.error("Gemini API error", {
        model,
        status: response.status,
        message: lastMessage,
      });

      // These errors are not model-specific, so trying another model will not help.
      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403 ||
        response.status === 429
      ) {
        break;
      }
    }

    if (lastStatus === 401 || lastStatus === 403) {
      return NextResponse.json(
        {
          error:
            "The Gemini API key was rejected or does not have access to the Gemini API. Check GEMINI_API_KEY in Vercel.",
        },
        { status: lastStatus }
      );
    }

    if (lastStatus === 429) {
      return NextResponse.json(
        {
          error:
            "The AI service has reached its rate limit. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    if (lastStatus === 400) {
      return NextResponse.json(
        {
          error: `The Gemini request was rejected: ${lastMessage}`,
        },
        { status: 400 }
      );
    }

    if (lastStatus === 404) {
      return NextResponse.json(
        {
          error:
            "No configured Gemini model is available for this API key. Check the Google AI project and API key permissions.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: `The mentor could not respond: ${lastMessage}`,
      },
      { status: 502 }
    );
  } catch (error) {
    console.error("AI mentor route error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while contacting the mentor. Please check the Vercel function logs.",
      },
      { status: 500 }
    );
  }
}
