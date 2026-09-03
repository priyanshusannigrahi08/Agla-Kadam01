"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, MessageSquare, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { virtualMentors } from "@/app/data/virtualMentors";

type HistoryMessage = { role: "mentor" | "user"; content: string };
type Conversation = {
  id: string;
  mentorId: string;
  title: string;
  preview: string;
  messages: HistoryMessage[];
  updatedAt: string;
};

const GUEST_KEY = "aglakadam-ai-history:guest";

function storageKey(userId: string | null) {
  return `aglakadam-ai-history:${userId || "guest"}`;
}

function readHistory(key: string): Conversation[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AiHistoryPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const id = data.user?.id || null;
      setUserId(id);
      setHistory(readHistory(storageKey(id)));
    }

    load();
    return () => { mounted = false; };
  }, []);

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [history]
  );

  function deleteConversation(id: string) {
    const next = history.filter((item) => item.id !== id);
    setHistory(next);
    localStorage.setItem(storageKey(userId), JSON.stringify(next));
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(storageKey(userId));
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/mentors" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 transition hover:text-board">
            ← Back to mentors
          </Link>
          {sortedHistory.length > 0 && (
            <button type="button" onClick={clearHistory} className="text-xs font-medium text-ink/45 transition hover:text-red-600">
              Clear history
            </button>
          )}
        </div>

        <header className="mt-10 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-board/55">Your AI conversations</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Conversation history.</h1>
          <p className="mt-4 text-base leading-7 text-ink/60 sm:text-lg">
            Pick up an earlier conversation with an AI mentor, or start fresh when you need a different perspective.
          </p>
        </header>

        {sortedHistory.length === 0 ? (
          <section className="mt-10 rounded-md border border-ink/10 bg-white p-8 text-center sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-board/8 text-board">
              <MessageSquare size={21} />
            </div>
            <h2 className="mt-5 font-display text-2xl">No conversations yet.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">
              Start a conversation with one of the AI mentors and it will appear here automatically.
            </p>
            <Link href="/mentors" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold">
              Explore AI mentors <ArrowRight size={16} />
            </Link>
          </section>
        ) : (
          <div className="mt-10 space-y-3">
            {sortedHistory.map((conversation) => {
              const mentor = virtualMentors.find((item) => item.id === conversation.mentorId);
              return (
                <div key={conversation.id} className="group flex items-stretch gap-2 rounded-md border border-ink/10 bg-white transition hover:border-board/20 hover:shadow-[0_12px_30px_-25px_rgba(23,34,28,0.8)]">
                  <Link href={`/ai-mentor/${conversation.mentorId}?conversation=${encodeURIComponent(conversation.id)}`} className="min-w-0 flex-1 p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-board/10">
                        {mentor?.image ? <img src={mentor.image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-display text-lg">{mentor?.name.charAt(0) || "A"}</div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h2 className="font-display text-xl">{conversation.title || mentor?.name || "AI mentor"}</h2>
                          {mentor && <span className="text-xs text-ink/40">{mentor.profession}</span>}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/55">{conversation.preview}</p>
                        <p className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink/35">
                          <Clock3 size={12} /> {formatDate(conversation.updatedAt)} · {conversation.messages.length} messages
                        </p>
                      </div>
                      <ArrowRight className="mt-1 hidden shrink-0 text-board/40 transition group-hover:translate-x-0.5 group-hover:text-board sm:block" size={19} />
                    </div>
                  </Link>
                  <button type="button" aria-label={`Delete conversation with ${mentor?.name || "AI mentor"}`} onClick={() => deleteConversation(conversation.id)} className="flex w-12 shrink-0 items-center justify-center border-l border-ink/10 text-ink/25 transition hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={17} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-8 text-center text-xs leading-5 text-ink/35">
          Your AI conversation history is stored locally in this browser. It is not used as a public mentor profile.
        </p>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return `Today, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  return date.toLocaleDateString([], { day: "numeric", month: "short", year: date.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}
