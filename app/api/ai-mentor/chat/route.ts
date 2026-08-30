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

/*
 * Models that are appropriate for normal text chat.
 *
 * IMPORTANT:
 * Do NOT put TTS, audio, image-generation, or Live models here.
 */
const CHAT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
];

async function getAvailableModels(apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
      apiKey
    )}`,
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
          if (!model.name) {
            return false;
          }

          const name = model.name.replace(/^models\//, "");

          /*
           * Only normal text-chat models.
           *
           * This deliberately excludes things like:
           * - TTS
           * - audio
           * - live
           * - image
           */
          const isAudioModel =
            name.includes("tts") ||
            name.includes("audio") ||
            name.includes("live");

          const isImageModel =
            name.includes("image") ||
            name.includes("imagen");

          const supportsGenerateContent =
            model.supportedGenerationMethods?.includes(
              "generateContent"
            ) ?? false;

          return (
            supportsGenerateContent &&
            !isAudioModel &&
            !isImageModel
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
    )}:generateContent?key=${encodeURIComponent(apiKey)}`,
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
          maxOutputTokens: 2048,
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
    /*
     * ---------------------------------------------------------
     * 1. API KEY
     * ---------------------------------------------------------
     */

    const apiKey = getApiKey();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "AI service is not configured. Add GEMINI_API_KEY to Vercel Environment Variables and redeploy.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. REQUEST BODY
     * ---------------------------------------------------------
     */

    const body = await request.json();

    const mentorId = normalizeMentorId(body?.mentorId);

    const messages = Array.isArray(body?.messages)
      ? body.messages
      : [];

    /*
     * ---------------------------------------------------------
     * 3. FIND MENTOR
     * ---------------------------------------------------------
     */

    const mentor = virtualMentors.find(
      (item) =>
        normalizeMentorId(item.id) === mentorId
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

    /*
     * ---------------------------------------------------------
     * 4. VALIDATE CONVERSATION
     * ---------------------------------------------------------
     */

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
          error:
            "Please send a message to the mentor.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. MENTOR SYSTEM INSTRUCTION
     * ---------------------------------------------------------
     */

    const systemInstruction = `
You are ${mentor.name}, a virtual mentor on the Agla Kadam mentorship platform.

Your professional specialization:
${mentor.profession}

Your areas of expertise:
${mentor.expertise.join(", ")}

Your profile:
${mentor.bio}

Your job is to act as a helpful AI-powered career mentor.

IMPORTANT BEHAVIOR:

1. Stay in character as this mentor.
2. Give practical and actionable career guidance.
3. Explain difficult concepts in simple language.
4. Break large goals into smaller steps.
5. Give examples whenever useful.
6. Avoid generic motivational filler.
7. If the user asks about a career path, give a realistic roadmap.
8. If the user is a beginner, do not assume prior knowledge.
9. If the user asks a technical question, explain the concept clearly and then give an example where appropriate.
10. Ask a useful follow-up question only when additional information is genuinely necessary.
11. Do not repeatedly ask unnecessary questions.
12. Keep normal answers concise but useful.
13. If the user requests a detailed roadmap, provide a detailed roadmap.
14. Never claim that you are a real human.
15. Never invent employment history, qualifications, companies, clients, or real-world experiences for the mentor.

AI DISCLOSURE:

If the user directly asks whether you are AI, answer honestly that you are an AI-powered virtual mentor.

HIGH-STAKES TOPICS:

For medical, legal, financial, mental-health, or other high-stakes matters, provide only general educational information and encourage the user to consult an appropriately qualified professional.

STYLE:

Be friendly, professional, encouraging, and direct.

Do not start every answer with phrases such as:
"That's a great question!"
"Absolutely!"
"Certainly!"

Get directly to the useful answer.

Use headings and numbered lists when they make the answer easier to understand.
`;

    /*
     * ---------------------------------------------------------
     * 6. CONVERT CHAT HISTORY TO GEMINI FORMAT
     * ---------------------------------------------------------
     *
     * Gemini REST generateContent supports multi-turn
     * conversations through the contents array.
     *
     * user      -> user
     * assistant -> model
     */

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

    /*
     * ---------------------------------------------------------
     * 7. GET AVAILABLE GEMINI MODELS
     * ---------------------------------------------------------
     */

    const available = await getAvailableModels(apiKey);

    if (!available.ok) {
      console.error(
        "Could not list Gemini models:",
        available.message
      );

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

    /*
     * ---------------------------------------------------------
     * 8. SELECT ONLY SAFE CHAT MODELS
     * ---------------------------------------------------------
     *
     * We NEVER blindly try every model returned by Google.
     *
     * This is the important fix for your current error.
     *
     * Previously your code could eventually reach:
     *
     * gemini-2.5-flash-preview-tts
     *
     * That model is for speech generation, not this
     * multi-turn text mentor chat.
     */

    const availableChatModels = CHAT_MODELS.filter(
      (model) =>
        available.models.includes(model)
    );

    /*
     * If the preferred models aren't returned by the API,
     * use other available non-audio/non-image models.
     */

    const fallbackModels = available.models.filter(
      (model) => {
        const lower = model.toLowerCase();

        return (
          !lower.includes("tts") &&
          !lower.includes("audio") &&
          !lower.includes("live") &&
          !lower.includes("image") &&
          !lower.includes("imagen") &&
          !availableChatModels.includes(model)
        );
      }
    );

    const modelsToTry = [
      ...availableChatModels,
      ...fallbackModels,
    ].slice(0, 6);

    /*
     * ---------------------------------------------------------
     * 9. SAFETY CHECK
     * ---------------------------------------------------------
     */

    if (modelsToTry.length === 0) {
      return NextResponse.json(
        {
          error:
            "No compatible Gemini text-chat model is available for this API key. Make sure the Google AI Studio API key belongs to a project with Gemini text models enabled.",
        },
        {
          status: 502,
        }
      );
    }

    console.log(
      "Gemini mentor models available:",
      modelsToTry
    );

    /*
     * ---------------------------------------------------------
     * 10. TRY MODELS
     * ---------------------------------------------------------
     */

    let lastStatus = 502;

    let lastMessage =
      "The AI service could not generate a response.";

    for (const model of modelsToTry) {
      /*
       * EXTRA SAFETY:
       *
       * Never call TTS/audio/live/image models even if they
       * somehow appear in the model list.
       */

      const lowerModel = model.toLowerCase();

      if (
        lowerModel.includes("tts") ||
        lowerModel.includes("audio") ||
        lowerModel.includes("live") ||
        lowerModel.includes("image") ||
        lowerModel.includes("imagen")
      ) {
        console.log(
          `Skipping incompatible Gemini model: ${model}`
        );

        continue;
      }

      console.log(
        `Trying Gemini mentor model: ${model}`
      );

      const {
        response,
        data,
      } = await generateWithGemini(
        model,
        apiKey,
        systemInstruction,
        contents
      );

      /*
       * -------------------------------------------------------
       * SUCCESS
       * -------------------------------------------------------
       */

      if (response.ok) {
        const reply =
          data?.candidates?.[0]?.content?.parts
            ?.map(
              (part: { text?: string }) =>
                part.text ?? ""
            )
            .join("")
            .trim();

        if (reply) {
          return NextResponse.json({
            reply,
            model,
          });
        }

        lastStatus = 502;

        lastMessage =
          "The AI service returned an empty response.";

        continue;
      }

      /*
       * -------------------------------------------------------
       * ERROR
       * -------------------------------------------------------
       */

      lastStatus = response.status;

      lastMessage =
        getGeminiErrorMessage(data);

      console.error(
        "Gemini API error:",
        {
          model,
          status: response.status,
          message: lastMessage,
        }
      );

      /*
       * Try another compatible model for temporary/model-specific
       * failures.
       */

      if (
        response.status === 429 ||
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503
      ) {
        continue;
      }

      /*
       * Authentication / permission / malformed request errors
       * usually won't be fixed by trying another model.
       */

      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403
      ) {
        break;
      }
    }

    /*
     * ---------------------------------------------------------
     * 11. FINAL ERROR
     * ---------------------------------------------------------
     */

    return NextResponse.json(
      {
        error:
          `The mentor could not respond: ${lastMessage}`,
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
    /*
     * ---------------------------------------------------------
     * 12. UNEXPECTED ERROR
     * ---------------------------------------------------------
     */

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
