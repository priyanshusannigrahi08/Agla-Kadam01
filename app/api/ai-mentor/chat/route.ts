import { NextRequest, NextResponse } from "next/server";
import { virtualMentors } from "@/app/data/virtualMentors";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type GeminiModel = {
  name?: string;
  supportedGenerationMethods?: string[];
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

function isChatModel(model: string) {
  const name = model.toLowerCase();

  const blockedTerms = [
    "tts",
    "audio",
    "image",
    "vision",
    "embedding",
    "live",
    "aqa",
    "robotics",
  ];

  return !blockedTerms.some((term) => name.includes(term));
}

async function getAvailableModels(apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      message: getGeminiErrorMessage(data),
      models: [] as string[],
    };
  }

  const models = Array.isArray(data?.models)
    ? (data.models as GeminiModel[])
        .filter((model) => {
          if (!model.name) return false;

          const supportsGenerateContent =
            model.supportedGenerationMethods?.includes(
              "generateContent"
            );

          const cleanName = model.name.replace(/^models\//, "");

          return (
            supportsGenerateContent &&
            cleanName.toLowerCase().includes("gemini") &&
            isChatModel(cleanName)
          );
        })
        .map((model) => model.name!.replace(/^models\//, ""))
    : [];

  return {
    ok: true as const,
    status: response.status,
    message: "",
    models,
  };
}

async function generateWithGemini(
  model: string,
  apiKey: string,
  systemInstruction: string,
  contents: unknown[]
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: systemInstruction,
            },
          ],
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

  return {
    response,
    data,
  };
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
        {
          status: 500,
        }
      );
    }

    const body = await request.json();

    const mentorId = normalizeMentorId(body?.mentorId);

    const messages = Array.isArray(body?.messages)
      ? body.messages
      : [];

    const mentor = virtualMentors.find(
      (item) => normalizeMentorId(item.id) === mentorId
    );

    if (!mentor) {
      return NextResponse.json(
        {
          error: "Mentor not found.",
        },
        {
          status: 404,
        }
      );
    }

    const conversation: ChatMessage[] = messages
      .filter((item: unknown): item is ChatMessage => {
        if (!item || typeof item !== "object") {
          return false;
        }

        const message = item as ChatMessage;

        return (
          (message.role === "user" ||
            message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim().length > 0
        );
      })
      .slice(-20);

    if (conversation.length === 0) {
      return NextResponse.json(
        {
          error: "Please send a message to the mentor.",
        },
        {
          status: 400,
        }
      );
    }

    const systemInstruction = `
You are ${mentor.name}, a virtual mentor on the Agla Kadam mentorship platform.

Your professional specialization is:
${mentor.profession}

Your areas of expertise are:
${mentor.expertise.join(", ")}

Your profile:
${mentor.bio}

Stay in character as this mentor.

Give practical, specific, encouraging career guidance.

Break complicated topics into clear and actionable steps.

When appropriate, provide:
- A step-by-step roadmap
- Skills to learn
- Practice recommendations
- Project ideas
- Career advice
- Interview preparation
- Common mistakes to avoid

Ask a useful follow-up question when important information is missing.

Do not pretend to be a real human.

Do not claim real-world employment, qualifications, or experiences beyond this fictional mentor profile.

If asked directly whether you are AI, answer honestly that you are an AI-powered virtual mentor.

For medical, legal, financial, mental-health, or other high-stakes topics, provide only general educational information and encourage the user to consult a qualified professional.

Keep answers concise unless the user asks for a detailed plan.

Format your response cleanly for a chat interface.

Rules:
- Keep paragraphs short.
- Put each numbered step on a new line.
- Never put headings such as "### Step 1" in the middle of a paragraph.
- If using headings, always put them on their own line.
- Use simple numbered lists for plans.
- Use bold formatting sparingly.
- Do not produce one giant block of text.
`;

    const contents = conversation.map((message) => ({
      role:
        message.role === "assistant"
          ? "model"
          : "user",
      parts: [
        {
          text: message.content,
        },
      ],
    }));

    const available = await getAvailableModels(apiKey);

    if (!available.ok) {
      return NextResponse.json(
        {
          error: `Gemini could not list models for this API key: ${available.message}`,
        },
        {
          status:
            available.status === 401 ||
            available.status === 403
              ? available.status
              : 502,
        }
      );
    }

    if (available.models.length === 0) {
      return NextResponse.json(
        {
          error:
            "No compatible Gemini chat models are available for this API key. Check your Google AI Studio API key and project.",
        },
        {
          status: 502,
        }
      );
    }

    const preferredNames = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ];

    const preferredModels = preferredNames.filter((name) =>
      available.models.includes(name)
    );

    const fallbackModels = available.models.filter(
      (model) =>
        !preferredModels.includes(model) &&
        isChatModel(model)
    );

    const modelsToTry = [
      ...preferredModels,
      ...fallbackModels,
    ].slice(0, 5);

    if (modelsToTry.length === 0) {
      return NextResponse.json(
        {
          error:
            "No compatible Gemini text chat model is available for this API key.",
        },
        {
          status: 502,
        }
      );
    }

    let lastStatus = 502;

    let lastMessage =
      "The AI service could not generate a response.";

    for (const model of modelsToTry) {
      console.log(
        `Trying Gemini model: ${model}`
      );

      const { response, data } =
        await generateWithGemini(
          model,
          apiKey,
          systemInstruction,
          contents
        );

      if (response.ok) {
        const reply = data?.candidates?.[0]?.content?.parts
          ?.map(
            (part: { text?: string }) =>
              part.text ?? ""
          )
          .join("")
          .trim();

        if (reply) {
          return NextResponse.json({
            reply,
          });
        }

        lastStatus = 502;

        lastMessage =
          "The AI service returned an empty response.";

        continue;
      }

      lastStatus = response.status;

      lastMessage =
        getGeminiErrorMessage(data);

      console.error(
        "Gemini API error",
        {
          model,
          status: response.status,
          message: lastMessage,
        }
      );

      if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 429
      ) {
        break;
      }
    }

    return NextResponse.json(
      {
        error: `The mentor could not respond: ${lastMessage}`,
      },
      {
        status:
          lastStatus >= 400 &&
          lastStatus < 500
            ? lastStatus
            : 502,
      }
    );
  } catch (error) {
    console.error(
      "AI mentor route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while contacting the mentor. Please check the Vercel function logs.",
      },
      {
        status: 500,
      }
    );
  }
}
