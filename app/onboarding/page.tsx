"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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
      <section className="w-full max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 text-center">
          Welcome to AglaKadam
        </p>

        <h1 className="font-display text-4xl sm:text-5xl text-center mt-4">
          What brings you here?
        </h1>

        <p className="text-ink/65 text-center mt-4 max-w-xl mx-auto">
          Choose how you want to use AglaKadam. You can start by seeking guidance
          or by sharing your experience with someone else.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mt-10">
          <button
            type="button"
            onClick={() => chooseRole("mentee")}
            disabled={loading !== null}
            className="text-left bg-white border border-ink/10 p-7 sm:p-9 hover:border-amber hover:shadow-sm transition disabled:opacity-60"
          >
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-board/60">
              I need guidance
            </span>
            <h2 className="font-display text-3xl mt-4">Find a mentor</h2>
            <p className="text-ink/65 mt-3 leading-7">
              Tell us where you are, what you are trying to figure out, and what
              kind of experience would actually help.
            </p>
            <span className="inline-block mt-7 font-semibold">
              {loading === "mentee" ? "Setting up…" : "Continue as a mentee →"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => chooseRole("mentor")}
            disabled={loading !== null}
            className="text-left bg-board text-white p-7 sm:p-9 hover:shadow-sm transition disabled:opacity-60"
          >
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-white/60">
              I want to help
            </span>
            <h2 className="font-display text-3xl mt-4">Become a mentor</h2>
            <p className="text-white/70 mt-3 leading-7">
              Share your experience, add your availability, and help someone take
              their next step with more clarity.
            </p>
            <span className="inline-block mt-7 font-semibold">
              {loading === "mentor" ? "Setting up…" : "Continue as a mentor →"}
            </span>
          </button>
        </div>

        {error && <p className="mt-6 text-center text-sm text-red-700">{error}</p>}
      </section>
    </main>
  );
}
