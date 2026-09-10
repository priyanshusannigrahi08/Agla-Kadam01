"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-16 text-ink">
      <section className="w-full max-w-2xl rounded-sm border border-ink/10 bg-white p-8 text-center pin-shadow sm:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-board/60">AglaKadam</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Something went wrong.</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ink/60 sm:text-base">
          We couldn&apos;t load this page right now. Try again, or head back home and continue from there.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="inline-flex items-center justify-center rounded-sm bg-amber px-5 py-3 text-sm font-semibold text-ink transition hover:brightness-95">
            Try again
          </button>
          <Link href="/" className="inline-flex items-center justify-center rounded-sm border border-ink/15 bg-paper px-5 py-3 text-sm font-semibold transition hover:bg-ink/5">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
