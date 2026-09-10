import Link from "next/link";
import AuthButton from "@/components/AuthButton";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link href="/" className="font-display text-xl tracking-tight" aria-label="AglaKadam home">AglaKadam</Link>
        <nav className="hidden items-center gap-7 font-body text-sm text-ink/65 md:flex" aria-label="Main navigation">
          <Link href="/mentors" className="transition hover:text-ink">Browse mentors</Link>
          <Link href="/find-mentor" className="transition hover:text-ink">Find a mentor</Link>
          <Link href="/articles" className="transition hover:text-ink">Articles</Link>
          <Link href="/ai-mentor" className="transition hover:text-ink">AI mentor</Link>
          <Link href="/mentor" className="transition hover:text-ink">Become a mentor</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <AuthButton />
          <Link href="/find-mentor" className="inline-flex items-center justify-center rounded-sm bg-amber px-4 py-2.5 font-body text-sm font-semibold transition hover:brightness-95 sm:px-5">Get started</Link>
        </div>
      </div>
    </header>
  );
}
