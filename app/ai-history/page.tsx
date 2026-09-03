"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, MessageSquare, Search, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { virtualMentors } from "@/app/data/virtualMentors";

type Message = { role: "mentor" | "user"; content: string };
type Conversation = { id: string; mentorId: string; title: string; preview: string; messages: Message[]; createdAt: string; updatedAt: string };
type Row = { id: string; mentor_id: string; title: string; preview: string; messages: unknown; created_at: string; updated_at: string };

function toConversation(row: Row): Conversation {
  return { id: row.id, mentorId: row.mentor_id, title: row.title, preview: row.preview || "", messages: Array.isArray(row.messages) ? row.messages as Message[] : [], createdAt: row.created_at, updatedAt: row.updated_at };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return `Today, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  return date.toLocaleDateString([], { day: "numeric", month: "short", year: date.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

export default function AiHistoryPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      const id = data.user?.id || null;
      setUserId(id);
      if (!id) { setLoading(false); return; }
      const { data: rows, error: fetchError } = await supabase.from("ai_conversations").select("id, mentor_id, title, preview, messages, created_at, updated_at").order("updated_at", { ascending: false });
      if (!active) return;
      if (fetchError) setError("Your conversation history could not be loaded. Please try again.");
      else setHistory(((rows || []) as Row[]).map(toConversation));
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history;
    return history.filter((conversation) => {
      const mentor = virtualMentors.find((item) => item.id === conversation.mentorId);
      return [conversation.title, conversation.preview, mentor?.name, mentor?.profession, ...(mentor?.expertise || [])].some((value) => value?.toLowerCase().includes(q));
    });
  }, [history, query]);

  async function deleteConversation(id: string) {
    const { error: deleteError } = await supabase.from("ai_conversations").delete().eq("id", id);
    if (deleteError) { setError("That conversation could not be deleted. Please try again."); return; }
    setHistory((items) => items.filter((item) => item.id !== id));
  }

  async function clearHistory() {
    if (!userId || history.length === 0) return;
    const { error: deleteError } = await supabase.from("ai_conversations").delete().eq("user_id", userId);
    if (deleteError) { setError("Your history could not be cleared. Please try again."); return; }
    setHistory([]);
  }

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-10"><div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-5"><Link href="/mentors" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">← Back to mentors</Link>{userId && history.length > 0 && <button type="button" onClick={() => void clearHistory()} className="text-xs font-medium text-ink/45 hover:text-red-600">Clear history</button>}</div>
    <header className="mt-10 flex flex-wrap items-end justify-between gap-6"><div><p className="font-mono text-xs uppercase tracking-[0.16em] text-board/55">Your AI workspace</p><h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Conversation history.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-ink/60">Everything you discuss with an AI mentor, synced to your account so you can pick it up on another device.</p></div>{userId && <label className="relative block w-full sm:w-80"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" className="input h-11 w-full pl-9 pr-3 text-sm" /></label>}</header>
    {error && <div className="mt-6 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}
    {!userId && !loading ? <section className="mt-10 rounded-md border border-ink/10 bg-white p-8 text-center sm:p-12"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-board/8 text-board"><MessageSquare size={21} /></div><h2 className="mt-5 font-display text-2xl">Sign in to sync your AI chats.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">Your conversations can be saved to your AglaKadam account and opened from any device you use.</p><Link href="/auth" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold">Sign in <ArrowRight size={16} /></Link></section> : loading ? <div className="mt-10 rounded-md border border-ink/10 bg-white p-8 text-sm text-ink/45">Loading your conversations…</div> : filtered.length === 0 ? <section className="mt-10 rounded-md border border-ink/10 bg-white p-8 text-center sm:p-12"><MessageSquare className="mx-auto text-board/45" size={28} /><h2 className="mt-5 font-display text-2xl">{query ? "No conversations found." : "No conversations yet."}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/55">{query ? "Try a different search term." : "Start a conversation with an AI mentor and it will appear here automatically."}</p><Link href="/mentors" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold">Explore AI mentors <ArrowRight size={16} /></Link></section> : <div className="mt-8 space-y-3">{filtered.map((conversation) => { const mentor = virtualMentors.find((item) => item.id === conversation.mentorId); return <div key={conversation.id} className="group flex items-stretch rounded-md border border-ink/10 bg-white transition hover:border-board/20"><Link href={`/ai-mentor/${conversation.mentorId}?conversation=${encodeURIComponent(conversation.id)}`} className="min-w-0 flex-1 p-5 sm:p-6"><div className="flex items-start gap-4"><div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-board/10">{mentor?.image ? <img src={mentor.image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-display">{mentor?.name.charAt(0) || "A"}</div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><h2 className="font-display text-xl">{conversation.title || "Conversation with AI mentor"}</h2><span className="text-xs text-ink/40">{mentor?.name || "AI mentor"}</span></div><p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/55">{conversation.preview}</p><p className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink/35"><Clock3 size={12} /> {formatDate(conversation.updatedAt)} · {conversation.messages.length} messages</p></div><ArrowRight className="mt-1 hidden shrink-0 text-board/40 sm:block" size={19} /></div></Link><button type="button" aria-label={`Delete ${mentor?.name || "AI mentor"} conversation`} onClick={() => void deleteConversation(conversation.id)} className="w-12 shrink-0 border-l border-ink/10 text-ink/25 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="mx-auto" size={17} /></button></div>; })}</div>}
    <p className="mt-8 text-center text-xs leading-5 text-ink/35">Your AI conversation history is private to your account.</p>
  </div></main>;
}
