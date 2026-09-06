"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Target, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProgressSnapshot() {
  const [stats, setStats] = useState({ goals: 0, actions: 0, conversations: 0 });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [goals, actions, bookings] = await Promise.all([
        supabase.from("career_goals").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", false),
        supabase.from("conversation_actions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", true),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("mentee_user_id", user.id).eq("status", "completed"),
      ]);

      setStats({ goals: goals.count || 0, actions: actions.count || 0, conversations: bookings.count || 0 });
    }
    load();
  }, []);

  return (
    <section className="border border-ink/10 bg-white p-5 sm:p-6 pin-shadow">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-board/60">Momentum</p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl">Small steps add up.</h2>
        </div>
        <Link href="/progress" className="inline-flex items-center gap-1.5 text-xs font-semibold text-board hover:underline">View progress <ArrowRight size={13} /></Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-sm border border-ink/10 bg-paper p-4">
          <Target size={17} className="text-board" />
          <p className="mt-3 font-display text-2xl">{stats.goals}</p>
          <p className="mt-1 text-xs text-ink/50">active goals</p>
        </div>
        <div className="rounded-sm border border-ink/10 bg-paper p-4">
          <CheckCircle2 size={17} className="text-board" />
          <p className="mt-3 font-display text-2xl">{stats.actions}</p>
          <p className="mt-1 text-xs text-ink/50">actions completed</p>
        </div>
        <div className="rounded-sm border border-ink/10 bg-paper p-4">
          <Users size={17} className="text-board" />
          <p className="mt-3 font-display text-2xl">{stats.conversations}</p>
          <p className="mt-1 text-xs text-ink/50">mentor conversations</p>
        </div>
      </div>

      <div className="mt-6 rounded-sm border border-ink/10 bg-board p-4 text-chalk sm:p-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-amber">The AglaKadam loop</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <span className="rounded-full border border-chalk/15 px-3 py-1.5">Problem</span>
          <span className="text-chalk/35">→</span>
          <span className="rounded-full border border-chalk/15 px-3 py-1.5">Mentor</span>
          <span className="text-chalk/35">→</span>
          <span className="rounded-full border border-chalk/15 px-3 py-1.5">Conversation</span>
          <span className="text-chalk/35">→</span>
          <span className="rounded-full border border-chalk/15 px-3 py-1.5">Action</span>
          <span className="text-chalk/35">→</span>
          <span className="rounded-full border border-amber/40 px-3 py-1.5 text-amber">Next step</span>
        </div>
        <p className="mt-4 max-w-2xl text-xs leading-5 text-chalk/55">You do not need the whole path figured out. One useful conversation can create the next experiment.</p>
      </div>

      <p className="mt-5 text-xs leading-5 text-ink/45">Progress is a record of what you have done, not a score of where you should be.</p>
    </section>
  );
}
