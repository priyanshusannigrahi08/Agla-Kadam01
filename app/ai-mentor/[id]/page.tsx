"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { virtualMentors } from "@/app/data/virtualMentors";

type Message = {
  id: number;
  role: "mentor" | "user";
  content: string;
};

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**") &&
      part.length > 4
    ) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (
      part.startsWith("`") &&
      part.endsWith("`") &&
      part.length > 2
    ) {
      return (
        <code
          key={index}
          className="rounded bg-ink/10 px-1.5 py-0.5 font-mono text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (
      part.startsWith("*") &&
      part.endsWith("*") &&
      !part.startsWith("**") &&
      part.length > 2
    ) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");

  const elements: React.ReactNode[] = [];
  let bulletItems: string[] = [];
  let numberedItems: string[] = [];
  let codeLines: string[] = [];
  let inCodeBlock = false;

  const flushBullets = () => {
    if (bulletItems.length > 0) {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="my-2 list-disc space-y-1 pl-5"
        >
          {bulletItems.map((item, index) => (
            <li key={index}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );

      bulletItems = [];
    }
  };

  const flushNumbers = () => {
    if (numberedItems.length > 0) {
      elements.push(
        <ol
          key={`ol-${elements.length}`}
          className="my-2 list-decimal space-y-1 pl-5"
        >
          {numberedItems.map((item, index) => (
            <li key={index}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      );

      numberedItems = [];
    }
  };

  const flushCode = () => {
    if (codeLines.length > 0) {
      elements.push(
        <pre
          key={`code-${elements.length}`}
          className="my-3 overflow-x-auto rounded-sm bg-ink px-4 py-3 text-xs leading-relaxed text-white"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );

      codeLines = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushBullets();
        flushNumbers();
        inCodeBlock = true;
      }

      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    const numberMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);

    if (bulletMatch) {
      flushNumbers();
      bulletItems.push(bulletMatch[1]);
      return;
    }

    if (numberMatch) {
      flushBullets();
      numberedItems.push(numberMatch[1]);
      return;
    }

    flushBullets();
    flushNumbers();

    if (!trimmed) {
      return;
    }

    elements.push(
      <p
        key={`p-${index}`}
        className={elements.length > 0 ? "mt-2" : ""}
      >
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  flushBullets();
  flushNumbers();

  if (inCodeBlock) {
    flushCode();
  }

  return <>{elements}</>;
}

export default function AiMentorPage() {
  const params = useParams<{ id: string }>();
  const mentorId = typeof params.id === "string" ? params.id : "";

  const mentor = useMemo(
    () => virtualMentors.find((item) => item.id === mentorId),
    [mentorId]
  );

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedMessage,
    };

    const updatedMessages = [...displayedMessages, userMessage];

    setMessages(updatedMessages);
    setMessage("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-mentor/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          mentorId: mentor.id,

          messages: updatedMessages.map((item) => ({
            role: item.role === "mentor" ? "assistant" : "user",
            content: item.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "The mentor could not respond."
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
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8 sm:py-12">

        <Link
          href="/mentors"
          className="mb-8 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"
        >
          ← Back to mentors
        </Link>

        <section className="mb-8 flex items-center gap-5 border-b border-ink/10 pb-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink/10 bg-board/10">
            <img
              src={mentor.image}
              alt={`${mentor.name} profile`}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h1 className="font-display text-2xl sm:text-3xl">
              {mentor.name}
            </h1>

            <p className="mt-1 text-sm text-ink/60">
              {mentor.profession}
            </p>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
              {mentor.bio}
            </p>
          </div>
        </section>

        <section className="flex flex-1 flex-col">

          <div className="flex flex-1 flex-col gap-4 pb-8">

            {displayedMessages.map((item) => (
              <div
                key={item.id}
                className={
                  item.role === "user"
                    ? "ml-auto max-w-[85%] rounded-sm bg-board px-4 py-3 text-sm leading-relaxed text-white"
                    : "mr-auto max-w-[85%] rounded-sm border border-ink/10 bg-white px-4 py-3 text-sm leading-relaxed text-ink"
                }
              >
                {item.role === "mentor" ? (
                  <MarkdownMessage content={item.content} />
                ) : (
                  item.content
                )}
              </div>
            ))}

            {isLoading && (
              <div className="mr-auto rounded-sm border border-ink/10 bg-white px-4 py-3 text-sm text-ink/60">
                {mentor.name.split(" ")[0]} is thinking...
              </div>
            )}

          </div>

          <form
            onSubmit={handleSubmit}
            className="sticky bottom-0 border-t border-ink/10 bg-paper pt-5"
          >

            {error && (
              <p className="mb-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex gap-3">

              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={isLoading}
                placeholder={`Ask ${mentor.name.split(" ")[0]} anything...`}
                className="input flex-1 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="rounded-sm bg-amber px-5 py-3 font-body text-sm font-semibold text-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Thinking..." : "Send →"}
              </button>

            </div>

            <p className="mt-3 text-center text-xs text-ink/40">
              This is an AI-powered virtual mentor. Guidance is for
              informational and career support purposes.
            </p>

          </form>
        </section>
      </div>
    </main>
  );
}
