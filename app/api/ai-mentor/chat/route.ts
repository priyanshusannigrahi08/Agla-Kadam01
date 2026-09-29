import { NextRequest, NextResponse } from "next/server";
import { virtualMentors } from "@/app/data/virtualMentors";
import { getMentorPersona } from "@/lib/ai-mentor/mentorPersonas";
import { AGLAKADAM_MASTER_SYSTEM_PROMPT } from "@/lib/ai-mentor/systemPrompt";
import {
  sanitizeUserContext,
  sanitizeConversationSummary,
  buildSlidingWindowConversation,
  formatUserContextBlock,
} from "@/lib/ai-mentor/contextManager";
import {
  classifyUserIntent,
  getIntentStrategyInstruction,
} from "@/lib/ai-mentor/intentClassifier";
import { checkRateLimit } from "@/lib/ai-mentor/rateLimiter";
import { validateAndSanitizeResponse } from "@/lib/ai-mentor/qualityChecker";
import { ChatMessage, ChatRequestBody } from "@/lib/ai-mentor/types";

export const runtime = "nodejs";

type GeminiModel = {
  name?: string;
  supportedGenerationMethods?: string[];
};

function normalizeMentorId(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function getApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function getConfiguredModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "";
}

function getGeminiErrorMessage(data: unknown): string {
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

function isChatModel(model: string): boolean {
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
            model.supportedGenerationMethods?.includes("generateContent");
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
          temperature: 0.6,
          maxOutputTokens: 1536,
          topP: 0.9,
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
    // 1. IP & Rate limiting check
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous-client";

    const rateLimit = checkRateLimit(clientIp, 40, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. Please wait ${rateLimit.retryAfterSeconds ?? 10} seconds before sending another message.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds ?? 10),
          },
        }
      );
    }

    // 2. Check API Key
    const apiKey = getApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "AI service is not configured. Add GEMINI_API_KEY to your environment variables and redeploy.",
        },
        {
          status: 500,
        }
      );
    }

    // 3. Parse and Validate Request Payload
    let body: ChatRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const mentorId = normalizeMentorId(body?.mentorId);
    const rawMessages = Array.isArray(body?.messages) ? body.messages : [];

    // Find mentor in virtualMentors list & rich persona
    const baseMentor = virtualMentors.find(
      (item) => normalizeMentorId(item.id) === mentorId
    );

    if (!baseMentor) {
      return NextResponse.json(
        { error: "Mentor not found." },
        { status: 404 }
      );
    }

    const persona = getMentorPersona(mentorId);

    // Validate and sanitize messages
    const validMessages: ChatMessage[] = rawMessages
      .filter((item: unknown): item is ChatMessage => {
        if (!item || typeof item !== "object") return false;
        const msg = item as ChatMessage;
        return (
          (msg.role === "user" || msg.role === "assistant") &&
          typeof msg.content === "string" &&
          msg.content.trim().length > 0
        );
      })
      .map((msg) => ({
        role: msg.role,
        // Guard against oversized inputs (> 3000 chars per message)
        content: msg.content.trim().slice(0, 3000),
      }));

    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: "Please send a valid message to the mentor." },
        { status: 400 }
      );
    }

    // 4. Extract Sanitized User Context & Conversation Summary
    const sanitizedContext = sanitizeUserContext(body.userContext);
    const sanitizedSummary = sanitizeConversationSummary(body.conversationSummary);

    // 5. Build conversation history with sliding window & compact memory
    const { recentMessages, compactHistoryNotes } =
      buildSlidingWindowConversation(validMessages, 12);

    const latestUserMessage =
      [...validMessages].reverse().find((m) => m.role === "user")?.content || "";

    // 6. Classify Intent and get Strategy
    const detectedIntent = classifyUserIntent(latestUserMessage);
    const intentStrategy = getIntentStrategyInstruction(detectedIntent);

    // 7. Assemble Layered System Instruction
    const mentorSection = persona
      ? `
=== ACTIVE MENTOR PROFILE ===
Name: ${persona.name}
Title: ${persona.headline}
Specialization: ${persona.profession}
Expertise: ${persona.expertise.join(", ")}
Background: ${persona.bio}

--- MENTOR METHODOLOGY & APPROACH ---
Mentoring Philosophy: ${persona.methodology.approach}
Communication Style: ${persona.methodology.communicationStyle}
Common Problem Types Handled:
${persona.methodology.problemTypes.map((pt) => `• ${pt}`).join("\n")}

Questioning Style:
${persona.methodology.questioningStyle}

Mistakes To Avoid:
${persona.methodology.mistakesToAvoid.map((m) => `• ${m}`).join("\n")}

When to Recommend Human Mentor on AglaKadam:
${persona.methodology.whenToSuggestHumanMentor}
`
      : `
=== ACTIVE MENTOR PROFILE ===
Name: ${baseMentor.name}
Profession: ${baseMentor.profession}
Expertise: ${baseMentor.expertise.join(", ")}
Bio: ${baseMentor.bio}
`;

    const contextBlock = formatUserContextBlock(sanitizedContext, sanitizedSummary);

    const completeSystemInstruction = [
      AGLAKADAM_MASTER_SYSTEM_PROMPT,
      mentorSection,
      contextBlock ? `\n${contextBlock}` : "",
      compactHistoryNotes ? `\n${compactHistoryNotes}` : "",
      `\n=== RESPONSE STRATEGY FOR THIS TURN ===\n${intentStrategy}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    // 8. Construct Gemini Contents Payload
    const contents = recentMessages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: message.content,
        },
      ],
    }));

    // 9. Model Cascade & Fallback Execution
    const preferredNames = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ];

    const available = await getAvailableModels(apiKey).catch(() => null);
    const discoveredModels = available?.ok ? available.models : [];

    const fallbackModels = discoveredModels.filter(
      (model) => !preferredNames.includes(model) && isChatModel(model)
    );

    const modelsToTry = Array.from(
      new Set(
        [
          getConfiguredModel(),
          ...preferredNames,
          ...fallbackModels,
        ].filter(Boolean)
      )
    ).slice(0, 6);

    if (modelsToTry.length === 0) {
      return NextResponse.json(
        {
          error:
            "No Gemini text model is configured. Set GEMINI_MODEL to an available Gemini text model.",
        },
        { status: 502 }
      );
    }

    let lastStatus = 502;
    let lastMessage = "The AI service could not generate a response.";

    for (const model of modelsToTry) {
      const { response, data } = await generateWithGemini(
        model,
        apiKey,
        completeSystemInstruction,
        contents
      );

      if (response.ok) {
        const rawReply = data?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? "")
          .join("")
          .trim();

        if (rawReply) {
          // 10. Quality Validation & Post-Sanitization
          const qualityReport = validateAndSanitizeResponse(rawReply);

          return NextResponse.json({
            reply: qualityReport.sanitizedReply,
            mentorId: baseMentor.id,
            mentorName: baseMentor.name,
          });
        }

        lastStatus = 502;
        lastMessage = "The AI service returned an empty response.";
        continue;
      }

      lastStatus = response.status;
      lastMessage = getGeminiErrorMessage(data);

      console.error("Gemini API error:", {
        model,
        status: response.status,
        message: lastMessage,
      });

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
        status: lastStatus >= 400 && lastStatus < 500 ? lastStatus : 502,
      }
    );
  } catch (error) {
    console.error("AI mentor route error:", error);

    return NextResponse.json(
      {
        error:
          "Something went wrong while contacting the mentor. Please try again in a moment.",
      },
      {
        status: 500,
      }
    );
  }
}
