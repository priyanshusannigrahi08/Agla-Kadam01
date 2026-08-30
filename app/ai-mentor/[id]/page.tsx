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

export default function AiMentorPage() {
  const params = useParams<{ id: string }>();

  const mentorId = typeof params.id === "string" ? params.id : "";

  const mentor = useMemo(
    () =>
      virtualMentors.find(
        (item) =>
          String(item.id).trim().toLowerCase() ===
          mentorId.trim().toLowerCase()
      ),
    [mentorId]
  );

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  /*
   * IMPORTANT:
   * TypeScript does not reliably preserve the `mentor` narrowing
   * inside nested functions such as handleSubmit.
   *
   * After the null check, create a guaranteed mentor reference.
   */
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

  // From this point onward TypeScript knows this is a real mentor.
  const currentMentor = mentor;

  const displayedMessages: Message[] =
    messages.length > 0
      ? messages
      : [
          {
            id: 1,
            role: "mentor",
            content: `Hi, I'm ${currentMentor.name}. I'm here to help you with ${currentMentor.profession.toLowerCase()} and your career journey. What are you trying to figure out?`,
          },
        ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

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
          mentorId: currentMentor.id,
          messages: updatedMessages.map((item) => ({
            role: item.role === "mentor" ? "assistant" : "user",
            content: item.content,
          })),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "The mentor could not respond."
        );
      }

      if (!data?.reply || typeof data.reply !== "string") {
        throw new Error(
          "The mentor returned an empty response. Please try again."
        );
      }

      const mentorReply: Message = {
        id: Date.now() + 1,
        role: "mentor",
        content: data.reply,
      };

      setMessages((current) => [...current, mentorReply]);
    } catch (error) {
      console.error("Mentor chat error:", error);

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
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-8 sm:py-12">

        {/* BACK */}
        <Link
          href="/mentors"
          className="mb-8 inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 transition hover:text-board"
        >
          ← Back to mentors
        </Link>

        {/* MENTOR HEADER */}
        <section className="mb-8 flex items-center gap-5 border-b border-ink/10 pb-8 sm:gap-7">

          {/* PROFILE IMAGE */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink/10 bg-board/10 sm:h-24 sm:w-24">
            {currentMentor.image ? (
              <img
                src={currentMentor.image}
                alt={`${currentMentor.name} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-2xl text-board">
                {currentMentor.name.charAt(0)}
              </span>
            )}
          </div>

          {/* MENTOR INFO */}
          <div className="min-w-0">
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">
              {currentMentor.name}
            </h1>

            <p className="mt-1 text-base text-ink/60 sm:text-lg">
              {currentMentor.profession}
            </p>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink/70 sm:text-base">
              {currentMentor.bio}
            </p>
          </div>
        </section>

        {/* CHAT */}
        <section className="flex flex-1 flex-col">

          {/* MESSAGES */}
          <div className="flex flex-1 flex-col gap-4 pb-8">

            {displayedMessages.map((item) => {
              const isUser = item.role === "user";

              return (
                <div
                  key={item.id}
                  className={
                    isUser
                      ? "ml-auto max-w-[90%] rounded-sm bg-board px-5 py-4 text-sm leading-relaxed text-white sm:max-w-[80%] sm:text-base"
                      : "mr-auto max-w-[95%] rounded-sm border border-ink/10 bg-white px-5 py-4 text-sm leading-relaxed text-ink sm:max-w-[90%] sm:text-base"
                  }
                >
                  <p className="whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              );
            })}

            {/* LOADING */}
            {isLoading && (
              <div className="mr-auto rounded-sm border border-ink/10 bg-white px-5 py-4 text-sm text-ink/60">
                <span>
                  {currentMentor.name.split(" ")[0]} is thinking...
                </span>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mr-auto max-w-[90%] rounded-sm border border-red-200 bg-red-50 px-5 py-4 text-sm leading-relaxed text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* INPUT */}
          <form
            onSubmit={handleSubmit}
            className="sticky bottom-0 border-t border-ink/10 bg-paper pt-5"
          >
            <div className="flex gap-3">

              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={isLoading}
                placeholder={`Ask ${currentMentor.name.split(" ")[0]} anything...`}
                autoComplete="off"
                className="input min-w-0 flex-1 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="shrink-0 rounded-sm bg-amber px-5 py-3 font-body text-sm font-semibold text-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
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
