import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { ARTICLES } from "@/app/data/articles";

export const metadata: Metadata = {
  title: "Career Insights & Guides | AglaKadam",
  description: "Practical career, mentorship, skills, higher studies and job-search guidance from AglaKadam.",
};

export default function ArticlesPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="font-display text-xl tracking-tight">AglaKadam</Link>
          <nav className="hidden items-center gap-7 text-sm text-ink/65 md:flex">
            <Link href="/mentors" className="hover:text-ink">Browse mentors</Link>
            <Link href="/find-mentor" className="hover:text-ink">Find a mentor</Link>
            <Link href="/articles" className="text-ink">Articles</Link>
            <Link href="/mentor" className="hover:text-ink">Become a mentor</Link>
          </nav>
          <Link href="/find-mentor" className="rounded-sm bg-amber px-4 py-2.5 text-sm font-semibold">Find a mentor</Link>
        </div>
      </header>

      <section className="border-b border-ink/10 bg-board text-chalk">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-sage">Insights & guides</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">Useful ideas for whatever comes next.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-chalk/70 sm:text-lg">Career decisions, skills, higher studies, job searches and mentorship — written to help you turn uncertainty into a practical next step.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ARTICLES.map((article) => (
            <Link key={article.slug} href={`/articles/${article.slug}`} className="group overflow-hidden rounded-sm border border-ink/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="overflow-hidden bg-board/10"><img src={article.image} alt="" className="aspect-[1.6/1] w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" /></div>
              <div className="p-5 sm:p-6">
                <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-board">{article.category}</p>
                <h2 className="mt-3 font-display text-2xl leading-tight">{article.title}</h2>
                <p className="mt-3 text-sm leading-6 text-ink/60">{article.excerpt}</p>
                <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4 text-xs text-ink/50"><span>{article.author}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{article.readTime}</span></div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-board">Read article <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
