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

  const mentor = useMemo(() => {
    return virtualMentors.find((item) => item.id === params.id);
  }, [params.id]);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>(() => {
    if (!mentor) return [];

    return [
      {
        id: 1,
        role: "mentor",
        content: `Hi, I'm ${mentor.name}. I'm here to help you with ${mentor.profession.toLowerCase()} and your career journey. What are you trying to figure out?`,
      },
    ];
  });

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

  function generateResponse(userMessage: string) {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("career") ||
      lowerMessage.includes("job") ||
      lowerMessage.includes("future")
    ) {
      return `That's a good place to start. Tell me a little more about your current situation, your experience so far, and where you'd ideally like to go. Then we can break your next steps into something practical.`;
    }

    if (
      lowerMessage.includes("learn") ||
      lowerMessage.includes("skill") ||
      lowerMessage.includes("course")
    ) {
      return `Let's focus on the skills that will actually move you forward. Tell me what you already know and what role or goal you're aiming for, and I'll help you build a practical learning path.`;
    }

    if (
      lowerMessage.includes("college") ||
      lowerMessage.includes("student") ||
      lowerMessage.includes("study")
    ) {
      return `You don't need to have your entire future figured out right now. Tell me what you're studying, what options you're considering, and what's making the decision difficult.`;
    }

    return `I understand. Let's break this down properly. Can you tell me more about your current situation, what you've already tried, and what outcome you're hoping for?`;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedMessage,
    };

    const mentorMessage: Message = {
      id: Date.now() + 1,
      role: "mentor",
      content: generateResponse(trimmedMessage),
    };

    setMessages((current) => [
      ...current,
      userMessage,
      mentorMessage,
    ]);

    setMessage("");
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8 sm:py-12">
        {/* BACK */}

        <Link
          href="/mentors"
          className="mb-8 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board"
        >
          ← Back to mentors
        </Link>

        {/* MENTOR HEADER */}

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

        {/* CHAT */}

        <section className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 pb-8">
            {messages.map((item) => (
              <div
                key={item.id}
                className={
                  item.role === "user"
                    ? "ml-auto max-w-[85%] rounded-sm bg-board px-4 py-3 text-sm leading-relaxed text-white"
                    : "mr-auto max-w-[85%] rounded-sm border border-ink/10 bg-white px-4 py-3 text-sm leading-relaxed text-ink"
                }
              >
                {item.content}
              </div>
            ))}
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
                placeholder={`Ask ${mentor.name.split(" ")[0]} anything...`}
                className="input flex-1"
              />

              <button
                type="submit"
                className="rounded-sm bg-amber px-5 py-3 font-body text-sm font-semibold text-ink transition hover:brightness-95"
              >
                Send →
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
