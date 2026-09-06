"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Row = Record<string, any>;
type Item = { kind: "goal" | "action" | "conversation"; text: string; detail: string; href: string };

export default function DashboardNextStep() {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [goalResult, actionResult, bookingResult] = await Promise.all([
        supabase.from("career_goals").select("id,text,completed,created_at").eq("user_id", user.id).eq("completed", false).order("created_at", { ascending: false }).limit(1),
        supabase.from("conversation_actions").select("id,action_text,completed,created_at,booking_id").eq("user_id", user.id).eq("completed", false).order("created_at", { ascending: false }).limit(1),
        supabase.from("bookings").select("id,mentor_id,status,scheduled_for").eq("mentee_user_id", user.id).in("status", ["requested", "confirmed"]).order("scheduled_for", { ascending: true, nullsFirst: false }).limit(1),
      ]);

      const goal = (goalResult.data || [])[0] as Row | undefined;
      if (goal) {
        setItem({ kind: "goal", text: goal.text, detail: "Your active career goal. Turn it into one small action today.", href: "/goals" });
        setLoading(false);
        return;
      }

      const action = (actionResult.data || [])[0] as Row | undefined;
      if (action) {
        setItem({ kind: "action", text: action.action_text || "Finish an action from your mentoring conversation", detail: "An unfinished action from a mentoring conversation.", href: action.booking_id ? `/conversation/${action.booking_id}` : "/progress" });
        setLoading(false);
        return;
      }

      const booking = (bookingResult.data || [])[0] as Row | undefined;
      if (booking) {
        const date = booking.scheduled_for ? new Date(booking.scheduled_for) : null;
        const detail = date && !Number.isNaN(date.getTime())
          ? `Your next conversation is ${new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(date)}.`
          : "Your mentor conversation is active. Bring one decision and one question.";
        setItem({ kind: "conversation", text: "Prepare for your next mentor conversation", detail, href: `/book/${booking.mentor_id}` });
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return null;

  const icon = item?.kind === "goal" ? <Target size={20} /> : item?.kind === "action" ? <CheckCircle2 size={20} /> : <CalendarDays size={20} />;

  return <section className="rounded-sm border border-board/15 bg-board p-6 text-chalk pin-shadow sm:p-8">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-chalk/10 text-amber">{item ? icon : <Zap size={20} />}</div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber">Today’s next step</p>
          {item ? <><p className="mt-2 font-mono text-[9px] uppercase tracking-wide text-chalk/45">{item.kind === "goal" ? "Active goal" : item.kind === "action" ? "Unfinished action" : "Upcoming conversation"}</p><h2 className="mt-1 max-w-2xl font-display text-2xl">{item.text}</h2><p className="mt-2 text-sm leading-6 text-chalk/65">{item.detail}</p></> : <><h2 className="mt-2 font-display text-2xl">Start with one small experiment.</h2><p className="mt-2 text-sm leading-6 text-chalk/65">Set a goal or find a mentor. You don’t need to map everything before taking the next step.</p></>}
        </div>
      </div>
      <Link href={item?.href || "/goals"} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-semibold text-ink">{item ? "Do this next" : "Set a goal"} <ArrowRight size={15} /></Link>
    </div>
    <div className="mt-5 border-t border-chalk/10 pt-4"><Link href="/next-step" className="text-xs font-semibold text-chalk/55 hover:text-chalk">Open your full next-step view →</Link></div>
  </section>;
}
