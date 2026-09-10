import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { ARTICLES } from "@/app/data/articles";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Career Insights & Guides",
  description: "Practical career, mentorship, skills, higher studies and job-search guidance from AglaKadam.",
  openGraph: {
    title: "Career Insights & Guides | AglaKadam",
    description: "Practical career, mentorship, skills, higher studies and job-search guidance from AglaKadam.",
    url: "https://agla-kadam.vercel.app/articles",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Career Insights & Guides | AglaKadam",
    description: "Practical career, mentorship, skills, higher studies and job-search guidance from AglaKadam.",
  },
};

export default function ArticlesPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <SiteHeader />

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
              <div className="relative aspect-[1.6/1] overflow-hidden bg-board/10"><Image src={article.image} alt={article.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /></div>
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

      <SiteFooter />
    </main>
  );
}
