"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { virtualMentors } from "@/app/data/virtualMentors";

type Message = {
  id: number;
  role: "mentor" | "user";
  content: string;
};

function MentorResponse({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-3">
      {lines.map((line, index) => {
        const text = line.trim();

        if (!text) return null;

        // Markdown headings
        if (text.startsWith("### ")) {
          return (
            <h3
              key={index}
              className="font-display text-lg font-semibold text-ink"
            >
              <InlineMarkdown text={text.replace(/^###\s*/, "")} />
            </h3>
          );
        }

        if (text.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="font-display text-xl font-semibold text-ink"
            >
              <InlineMarkdown text={text.replace(/^##\s*/, "")} />
            </h2>
          );
        }

        if (text.startsWith("# ")) {
          return (
            <h2
              key={index}
              className="font-display text-xl font-semibold text-ink"
            >
              <InlineMarkdown text={text.replace(/^#\s*/, "")} />
            </h2>
          );
        }

        // Bullet points
        if (
          text.startsWith("- ") ||
          text.startsWith("* ")
        ) {
          return (
            <div
              key={index}
              className="flex gap-2 leading-relaxed"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-board" />

              <div className="flex-1">
                <InlineMarkdown
                  text={text.replace(/^[-*]\s*/, "")}
                />
              </div>
            </div>
          );
        }

        // Numbered lists
        const numberedMatch = text.match(
          /^(\d+)\.\s+(.*)$/
        );

        if (numberedMatch) {
          return (
            <div
              key={index}
              className="flex gap-3 leading-relaxed"
            >
              <span className="font-semibold text-board">
                {numberedMatch[1]}.
              </span>

              <div className="flex-1">
                <InlineMarkdown
                  text={numberedMatch[2]}
                />
              </div>
            </div>
          );
        }

        return (
          <p
            key={index}
            className="leading-relaxed text-ink/90"
          >
            <InlineMarkdown text={text} />
          </p>
        );
      })}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (
          part.startsWith("**") &&
          part.endsWith("**")
        ) {
          return (
            <strong
              key={index}
              className="font-semibold text-ink"
            >
              {part.slice(2, -2)}
            </strong>
          );
        }

        return part;
      })}
    </>
  );
}

export default function AiMentorPage() {
  const params = useParams<{ id: string }>();

  const mentorId =
    typeof params.id === "string"
      ? params.id
      : "";

  const mentor = useMemo(
    () =>
      virtualMentors.find(
        (item) => item.id === mentorId
      ),
    [mentorId]
  );

  const [message, setMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  if (!mentor) {
    return (
      <main className="min-h-screen bg-paper px-6 py-20 text-ink">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/mentors"
            className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"
          >
            ← Back to mentors
          </Link>

          <h1 className="font-display mt-8 text-3xl">
            Mentor not found
          </h1>

          <p className="mt-3 text-ink/60">
            This mentor profile doesn't exist.
          </p>
        </div>
      </main>
    );
  }

  const displayedMessages =
    messages.length > 0
      ? messages
      : [
          {
            id: 1,
            role: "mentor" as const,
            content: `Hi, I'm ${mentor.name}. I'm here to help you with ${mentor.profession.toLowerCase()} and your career journey. What are you trying to figure out?`,
          },
        ];

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      isLoading
    ) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedMessage,
    };

    const updatedMessages = [
      ...displayedMessages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/ai-mentor/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            mentorId: mentor.id,

            messages:
              updatedMessages.map(
                (item) => ({
                  role:
                    item.role === "mentor"
                      ? "assistant"
                      : "user",

                  content:
                    item.content,
                })
              ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "The mentor could not respond."
        );
      }

      if (!data.reply) {
        throw new Error(
          "The mentor returned an empty response."
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "mentor",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error(
        "Mentor chat error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<
      HTMLTextAreaElement
    >
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      const form =
        event.currentTarget.form;

      if (form) {
        form.requestSubmit();
      }
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink">

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:py-12">

        {/* Back button */}

        <Link
          href="/mentors"
          className="mb-8 font-mono text-xs uppercase tracking-[0.15em] text-board/60 transition hover:text-board"
        >
          ← Back to mentors
        </Link>

        {/* Mentor profile */}

        <section className="mb-8 flex items-center gap-5 border-b border-ink/10 pb-8">

          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink/10 bg-board/10">

            <img
              src={mentor.image}
              alt={`${mentor.name} profile`}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />

            <span className="absolute text-xl font-semibold text-board">
              {mentor.name.charAt(0)}
            </span>

          </div>

          <div>

            <h1 className="font-display text-2xl sm:text-3xl">
              {mentor.name}
            </h1>

            <p className="mt-1 text-sm text-ink/60">
              {mentor.profession}
            </p>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
              {mentor.bio}
            </p>

          </div>

        </section>

        {/* Chat */}

        <section className="flex flex-1 flex-col">

          <div className="flex flex-1 flex-col gap-5 pb-10">

            {displayedMessages.map(
              (item) => (

                <div
                  key={item.id}
                  className={
                    item.role === "user"
                      ? "ml-auto max-w-[85%] rounded-lg bg-board px-5 py-4 text-sm leading-relaxed text-white shadow-sm"
                      : "mr-auto max-w-[90%] rounded-lg border border-ink/10 bg-white px-5 py-4 text-sm shadow-sm"
                  }
                >

                  {item.role === "mentor" ? (
                    <MentorResponse
                      content={item.content}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">
                      {item.content}
                    </p>
                  )}

                </div>

              )
            )}

            {isLoading && (

              <div className="mr-auto flex items-center gap-3 rounded-lg border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60 shadow-sm">

                <div className="flex gap-1">

                  <span className="h-2 w-2 animate-bounce rounded-full bg-board" />

                  <span className="h-2 w-2 animate-bounce rounded-full bg-board [animation-delay:150ms]" />

                  <span className="h-2 w-2 animate-bounce rounded-full bg-board [animation-delay:300ms]" />

                </div>

                <span>
                  {mentor.name.split(" ")[0]} is thinking...
                </span>

              </div>

            )}

            <div ref={bottomRef} />

          </div>

          {/* Input */}

          <form
            onSubmit={handleSubmit}
            className="sticky bottom-0 border-t border-ink/10 bg-paper pt-5"
          >

            {error && (

              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                {error}

              </div>

            )}

            <div className="flex items-end gap-3">

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
                placeholder={`Ask ${
                  mentor.name.split(" ")[0]
                } anything...`}
                className="input min-h-[52px] flex-1 resize-none py-3 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !message.trim()
                }
                className="rounded-sm bg-amber px-6 py-4 font-body text-sm font-semibold text-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? "Thinking..."
                  : "Send →"}
              </button>

            </div>

            <div className="mt-3 flex justify-between gap-4 text-xs text-ink/40">

              <p>
                Press Enter to send
              </p>

              <p>
                Shift + Enter for a new line
              </p>

            </div>

            <p className="mt-2 text-center text-xs text-ink/40">

              This is an AI-powered virtual mentor.
              Guidance is for informational and
              career support purposes.

            </p>

          </form>

        </section>

      </div>

    </main>
  );
}
