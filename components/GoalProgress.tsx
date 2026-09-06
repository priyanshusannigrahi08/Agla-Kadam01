"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Goal = { id: string; text: string; completed: boolean; created_at: string };

export default function GoalProgress() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("career_goals")
        .select("id,text,completed,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setGoals((data || []) as Goal[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading || goals.length === 0) return null;

  const completed = goals.filter(g => g.completed).length;
  const progress = Math.round((completed / goals.length) * 100);

  return (
    <section className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-board/60">Direction</p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl">Your goals, in motion.</h2>
          <p className="mt-2 text-sm text-ink/55">A simple view of what you are working toward.</p>
        </div>
        <Link href="/goals" className="inline-flex items-center gap-1.5 text-xs font-semibold text-board">Manage goals <ArrowRight size={13}/></Link>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper">
          <div className="h-full rounded-full bg-board transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="font-mono text-xs text-ink/50">{completed}/{goals.length}</span>
      </div>

      <div className="mt-6 space-y-2">
        {goals.map(goal => (
          <Link key={goal.id} href="/goals" className="flex items-start gap-3 rounded-sm border border-ink/10 bg-paper p-3.5 hover:border-board/20">
            {goal.completed ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-board"/> : <Circle size={17} className="mt-0.5 shrink-0 text-ink/35"/>}
            <span className={`text-sm leading-5 ${goal.completed ? "text-ink/45 line-through" : "font-medium"}`}>{goal.text}</span>
          </Link>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-ink/45">
        <Target size={14}/>
        <span>Goals are yours to define. AglaKadam only helps turn them into next steps.</span>
      </div>
    </section>
  );
}
