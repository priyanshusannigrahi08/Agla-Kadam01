"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, History, Send, Sparkles, Trash2 } from "lucide-react";
import { virtualMentors } from "@/app/data/virtualMentors";
import { supabase } from "@/lib/supabaseClient";

type Message = { id: number; role: "mentor" | "user"; content: string };
type StoredConversation = { id: string; mentorId: string; title: string; preview: string; messages: Message[]; updatedAt: string };

function storageKey(userId: string | null) { return `aglakadam-ai-history:${userId || "guest"}`; }
function readHistory(key: string): StoredConversation[] {
  try { const value = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; }
}
function saveConversation(key: string, conversation: StoredConversation) {
  const history = readHistory(key).filter((item) => item.id !== conversation.id);
  history.unshift(conversation);
  localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
}
function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return `Today, ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  return date.toLocaleDateString([], { day: "numeric", month: "short", year: date.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index} className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[0.9em]">{part.slice(1, -1)}</code>;
    return <span key={index}>{part}</span>;
  });
}
function ConversationText({ content }: { content: string }) {
  return <div className="space-y-3 text-sm leading-7 sm:text-[15px]">{content.replace(/\r\n/g, "\n").split("\n\n").map((block, index) => {
    const lines = block.split("\n");
    if (lines.every((line) => /^[-*]\s+/.test(line.trim()))) return <ul key={index} className="ml-5 list-disc space-y-1">{lines.map((line, i) => <li key={i}>{renderInline(line.trim().replace(/^[-*]\s+/, ""))}</li>)}</ul>;
    return <p key={index}>{renderInline(lines.join(" "))}</p>;
  })}</div>;
}

function AiMentorPageContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const mentorId = typeof params.id === "string" ? params.id : "";
  const requestedConversation = searchParams.get("conversation");
  const mentor = useMemo(() => virtualMentors.find((item) => item.id.toLowerCase() === mentorId.toLowerCase()), [mentorId]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(requestedConversation);
  const [historyOpen, setHistoryOpen] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (active) setUserId(data.user?.id || null); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!mentor) return;
    const existing = requestedConversation ? readHistory(storageKey(userId)).find((item) => item.id === requestedConversation && item.mentorId === mentor.id) : null;
    if (existing) { setMessages(existing.messages); setConversationId(existing.id); } else { setMessages([]); setConversationId(null); }
  }, [mentor, userId, requestedConversation]);

  if (!mentor) return <main className="min-h-screen bg-paper px-6 py-20 text-ink"><div className="mx-auto max-w-2xl"><Link href="/mentors" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">← Back to mentors</Link><h1 className="mt-8 font-display text-3xl">Mentor not found</h1></div></main>;

  const currentMentor = mentor;
  const displayedMessages: Message[] = messages.length ? messages : [{ id: 1, role: "mentor", content: `Hi, I'm ${currentMentor.name}. I'm here to help you with ${currentMentor.profession.toLowerCase()} and your career journey. What are you trying to figure out?` }];
  const history = typeof window !== "undefined" ? readHistory(storageKey(userId)).filter((item) => item.mentorId === currentMentor.id) : [];

  function startNewConversation() { setMessages([]); setConversationId(null); setError(""); setHistoryOpen(false); }
  function deleteCurrentConversation() {
    if (!conversationId) return;
    const key = storageKey(userId);
    localStorage.setItem(key, JSON.stringify(readHistory(key).filter((item) => item.id !== conversationId)));
    startNewConversation();
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    const trimmed = message.trim();
    if (!trimmed || trimmed.length > 4000) return;
    submittingRef.current = true; setIsLoading(true); setError("");
    const userMessage: Message = { id: Date.now(), role: "user", content: trimmed };
    const nextMessages = [...displayedMessages, userMessage];
    setMessages(nextMessages); setMessage("");
    try {
      const response = await fetch("/api/ai-mentor/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mentorId: currentMentor.id, messages: nextMessages.map((item) => ({ role: item.role === "mentor" ? "assistant" : "user", content: item.content })) }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "The AI mentor could not respond. Please try again.");
      if (!data?.reply || typeof data.reply !== "string") throw new Error("The mentor returned an empty response. Please try again.");
      const mentorReply: Message = { id: Date.now() + 1, role: "mentor", content: data.reply };
      const finalMessages = [...nextMessages, mentorReply];
      setMessages(finalMessages);
      const id = conversationId || `${currentMentor.id}-${Date.now()}`;
      setConversationId(id);
      const firstUser = finalMessages.find((item) => item.role === "user")?.content || "Conversation with AI mentor";
      saveConversation(storageKey(userId), { id, mentorId: currentMentor.id, title: firstUser.length > 70 ? `${firstUser.slice(0, 70)}…` : firstUser, preview: data.reply.length > 180 ? `${data.reply.slice(0, 180)}…` : data.reply, messages: finalMessages, updatedAt: new Date().toISOString() });
    } catch (submitError) {
      console.error("Mentor chat error:", submitError);
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.");
    } finally { setIsLoading(false); submittingRef.current = false; }
  }

  return <main className="min-h-screen bg-paper text-ink"><div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-8">
    <header className="flex items-center justify-between gap-4 border-b border-ink/10 pb-5">
      <Link href="/mentors" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 transition hover:text-board"><ArrowLeft size={14} /> Back to mentors</Link>
      <div className="flex items-center gap-2"><Link href="/ai-history" className="hidden items-center gap-2 rounded-sm border border-ink/10 bg-white px-3 py-2 text-xs font-medium transition hover:border-board/25 sm:inline-flex"><History size={14} /> All history</Link><button type="button" onClick={() => setHistoryOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-sm border border-ink/10 bg-white px-3 py-2 text-xs font-medium sm:hidden"><History size={14} /> History</button><button type="button" onClick={startNewConversation} className="inline-flex items-center gap-2 rounded-sm bg-amber px-3 py-2 text-xs font-semibold"><Sparkles size={14} /> New chat</button></div>
    </header>
    <div className="grid flex-1 gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-md border border-ink/10 bg-white">
        <div className="flex items-center gap-4 border-b border-ink/10 p-5 sm:p-6"><div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-ink/10 bg-board/10 sm:h-16 sm:w-16">{currentMentor.image ? <img src={currentMentor.image} alt={`${currentMentor.name} profile`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-display text-xl">{currentMentor.name.charAt(0)}</div>}</div><div className="min-w-0 flex-1"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-board/50">AI mentor</p><h1 className="font-display text-2xl sm:text-3xl">{currentMentor.name}</h1><p className="text-sm text-ink/50">{currentMentor.profession}</p></div>{conversationId && <button type="button" onClick={deleteCurrentConversation} title="Delete this conversation" aria-label="Delete this conversation" className="rounded-sm p-2 text-ink/25 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button>}</div>
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-8">{displayedMessages.map((item) => <div key={item.id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[90%] rounded-md px-4 py-3 sm:max-w-[78%] sm:px-5 ${item.role === "user" ? "bg-board text-paper" : "border border-ink/8 bg-paper"}`}>{item.role === "mentor" && <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-board/50">{currentMentor.name}</p>}<ConversationText content={item.content} /></div></div>)}{isLoading && <div className="flex justify-start"><div className="rounded-md border border-ink/8 bg-paper px-5 py-4 text-sm text-ink/45">{currentMentor.name} is thinking…</div></div>}{error && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</div>}</div>
        <form onSubmit={handleSubmit} className="border-t border-ink/10 p-4 sm:p-5"><div className="flex items-end gap-3 rounded-md border border-ink/15 bg-paper p-2 focus-within:border-board/35"><textarea value={message} onChange={(event) => setMessage(event.target.value)} disabled={isLoading} maxLength={4000} rows={2} placeholder={`Ask ${currentMentor.name} anything…`} className="min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-ink/35" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /><button type="submit" disabled={isLoading || !message.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-amber text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"><Send size={17} /></button></div><div className="mt-2 flex justify-between px-1 text-[10px] text-ink/35"><span>Enter to send · Shift + Enter for a new line</span><span>{message.length}/4000</span></div></form>
      </section>
      <aside className={`${historyOpen ? "block" : "hidden"} lg:block`}><div className="rounded-md border border-ink/10 bg-white p-5 lg:sticky lg:top-6"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-board/50">Saved chats</p><h2 className="mt-1 font-display text-xl">Your history</h2></div><Clock3 size={18} className="text-board/45" /></div>{history.length === 0 ? <p className="mt-5 text-sm leading-6 text-ink/50">Your conversations with this mentor will appear here after your first message.</p> : <div className="mt-5 space-y-2">{history.slice(0, 8).map((item) => <Link key={item.id} href={`/ai-mentor/${currentMentor.id}?conversation=${encodeURIComponent(item.id)}`} className={`group block rounded-sm border p-3 transition ${item.id === conversationId ? "border-board/25 bg-board/[0.035]" : "border-ink/8 hover:border-board/20"}`}><p className="line-clamp-2 text-xs font-medium leading-5">{item.title}</p><p className="mt-1 text-[10px] text-ink/40">{formatDate(item.updatedAt)} · {item.messages.length} messages</p></Link>)}<Link href="/ai-history" className="mt-2 flex items-center justify-center gap-2 rounded-sm border border-ink/10 py-2.5 text-xs font-medium text-board transition hover:border-board/25">View all history <ArrowRight size={13} /></Link></div>}</div></aside>
    </div>
  </div></main>;
}

export default function AiMentorPage() { return <Suspense fallback={<main className="min-h-screen bg-paper px-6 py-20 text-ink"><div className="mx-auto max-w-3xl font-mono text-xs uppercase tracking-[0.15em] text-board/50">Loading mentor…</div></main>}><AiMentorPageContent /></Suspense>; }
