"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Compass, HandHelping, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Role = "mentor" | "mentee";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<Role | null>(null);
  const [error, setError] = useState("");

  async function chooseRole(role: Role) {
    setLoading(role);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/auth");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ preferred_role: role })
      .eq("id", user.id);

    if (profileError) {
      setError("We couldn't save your choice. Please try again.");
      setLoading(null);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { role },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(null);
      return;
    }

    router.replace(role === "mentor" ? "/mentor" : "/mentee");
  }

  return (
    <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-4xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-board/10 text-board">
            <Compass size={22} />
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.15em] text-board/60">
            STEP 2 · CHOOSE YOUR PATH
          </p>
          <h1 className="font-display text-4xl sm:text-5xl mt-3">
            What brings you to AglaKadam?
          </h1>
          <p className="text-ink/65 mt-4 leading-7 max-w-xl mx-auto">
            You have created your account. Now choose how you want to use the platform.
            You can change your direction later.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-10">
          <button
            type="button"
            onClick={() => chooseRole("mentee")}
            disabled={loading !== null}
            className="group text-left bg-white border border-ink/10 p-7 sm:p-9 rounded-sm hover:border-amber hover:shadow-sm transition disabled:opacity-60"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber/15 text-ink">
              <Compass size={20} />
            </span>
            <p className="mt-7 font-mono text-xs uppercase tracking-[0.15em] text-board/60">I need guidance</p>
            <h2 className="font-display text-3xl mt-3">Find a mentor</h2>
            <p className="text-ink/65 mt-3 leading-7">
              Tell us what you are figuring out and get matched with someone who has relevant experience.
            </p>
            <span className="inline-flex items-center gap-2 mt-7 font-semibold">
              {loading === "mentee" ? "Setting up…" : "Continue as a mentee"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => chooseRole("mentor")}
            disabled={loading !== null}
            className="group text-left bg-board text-white p-7 sm:p-9 rounded-sm hover:shadow-sm transition disabled:opacity-60"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
              <HandHelping size={20} />
            </span>
            <p className="mt-7 font-mono text-xs uppercase tracking-[0.15em] text-white/60">I want to help</p>
            <h2 className="font-display text-3xl mt-3">Become a mentor</h2>
            <p className="text-white/70 mt-3 leading-7">
              Share what you have learned, add your availability, and help someone take their next step.
            </p>
            <span className="inline-flex items-center gap-2 mt-7 font-semibold">
              {loading === "mentor" ? "Setting up…" : "Continue as a mentor"}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </button>
        </div>

        <div className="mt-7 mx-auto max-w-2xl flex items-start gap-3 rounded-sm border border-ink/10 bg-white/60 p-4 text-sm text-ink/60">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-board" />
          <p>Your basic account details stay with your account. You only share the information needed for your chosen role.</p>
        </div>

        {error && <p className="mt-6 text-center text-sm text-red-700" role="alert">{error}</p>}
      </section>
    </main>
  );
}
