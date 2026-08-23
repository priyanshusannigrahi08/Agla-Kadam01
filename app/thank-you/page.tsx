"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ThankYouContent() {
  const params = useSearchParams();
  const as = params.get("as");

  const isMentee = as === "mentee";

  return (
    <main className="min-h-screen bg-board text-chalk flex items-center">
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-sage mb-6">
          AglaKadam
        </p>
        <h1 className="font-display italic text-3xl sm:text-4xl mb-4">
          {isMentee ? "Got it. Sit tight." : "Thanks for offering your time."}
        </h1>
        <p className="text-chalk/75 leading-relaxed mb-10">
          {isMentee
            ? "You'll be matched with a mentor whose path is close to yours. You'll get an email with their name and a link to book a call — usually within a few days."
            : "We review every mentor sign-up before matching starts. Once approved, you'll start getting intro emails when someone's situation fits your background."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-sm bg-amber text-ink font-body font-semibold px-7 py-3.5 hover:brightness-95 transition"
        >
          Back to AglaKadam
        </Link>
      </div>
    </main>
  );
}

export default function ThankYou() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}
