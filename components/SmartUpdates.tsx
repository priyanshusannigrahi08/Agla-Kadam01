"use client";

import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, Clock3, MessageCircle, Sparkles, UserRound } from "lucide-react";

type Update = { id: string; icon: "clock" | "action" | "feedback" | "profile" | "mentor"; title: string; body: string; href: string; cta: string };

export default function SmartUpdates({ upcoming = 0, unfinishedActions = 0, completedConversations = 0, profileComplete = true, hasMentorContext = false }: { upcoming?: number; unfinishedActions?: number; completedConversations?: number; profileComplete?: boolean; hasMentorContext?: boolean }) {
  const updates: Update[] = [];
  if (upcoming > 0) updates.push({ id: "upcoming", icon: "clock", title: "Your next conversation is waiting.", body: upcoming === 1 ? "Take a minute to decide what you want from the call." : `${upcoming} conversations are coming up. Prepare one useful question for each.`, href: "/dashboard", cta: "View conversation" });
  if (unfinishedActions > 0) updates.push({ id: "actions", icon: "action", title: `${unfinishedActions} action${unfinishedActions === 1 ? "" : "s"} still open.`, body: "A good conversation matters more when it leads to something you actually try.", href: "/dashboard", cta: "Review your actions" });
  if (completedConversations > 0) updates.push({ id: "feedback", icon: "feedback", title: "Capture what you learned.", body: "Your completed conversation can become a useful next step—and feedback helps mentors improve.", href: "/review", cta: "Leave feedback" });
  if (!profileComplete) updates.push({ id: "profile", icon: "profile", title: "Your profile could work harder for you.", body: "A little more context helps AglaKadam make better discovery suggestions.", href: "/profile-setup", cta: "Complete profile" });
  if (!hasMentorContext && upcoming === 0) updates.push({ id: "mentor", icon: "mentor", title: "Ready for your next step?", body: "Tell us what you're working through and discover mentors who may have relevant experience.", href: "/find-mentor", cta: "Find a mentor" });
  const visible = updates.slice(0, 3);
  if (!visible.length) return null;
  const icons = { clock: Clock3, action: CheckCircle2, feedback: MessageCircle, profile: UserRound, mentor: Sparkles };
  return <section className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-7"><div className="flex items-end justify-between gap-4"><div><p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-board/60"><Bell size={12}/> Updates</p><h2 className="mt-2 font-display text-2xl">A few useful things.</h2></div><span className="font-mono text-[10px] uppercase tracking-wide text-ink/40">{visible.length} now</span></div><div className="mt-5 divide-y divide-ink/10">{visible.map(item => { const Icon = icons[item.icon]; return <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0"><div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-board/10 text-board"><Icon size={16}/></div><div className="min-w-0 flex-1"><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm leading-6 text-ink/55">{item.body}</p><Link href={item.href} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-board">{item.cta}<ArrowRight size={13}/></Link></div></div>})}</div></section>;
}
