import { Suspense, type ReactNode } from "react";

export default function MentorsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-paper text-ink" aria-busy="true">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-board/60">Mentor marketplace</p>
            <h1 className="mt-3 font-display text-3xl">Loading mentors…</h1>
          </div>
        </main>
      }
    >
      {children}
    </Suspense>
  );
}
