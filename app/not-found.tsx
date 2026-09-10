import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-16 text-ink">
      <section className="w-full max-w-2xl rounded-sm border border-ink/10 bg-white p-8 text-center pin-shadow sm:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-board/60">AglaKadam</p>
        <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">This page doesn&apos;t exist.</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ink/60 sm:text-base">
          The page you&apos;re looking for may have moved, or the link may no longer be available.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex items-center justify-center rounded-sm bg-amber px-5 py-3 text-sm font-semibold text-ink transition hover:brightness-95">
            Back home
          </Link>
          <Link href="/mentors" className="inline-flex items-center justify-center rounded-sm border border-ink/15 bg-paper px-5 py-3 text-sm font-semibold transition hover:bg-ink/5">
            Browse mentors
          </Link>
        </div>
      </section>
    </main>
  );
}
