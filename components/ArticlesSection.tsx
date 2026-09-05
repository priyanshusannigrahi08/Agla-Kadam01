"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";
import { ARTICLES } from "@/app/data/articles";

export default function ArticlesSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  // Keep the homepage editorial and uncluttered: show two articles at a time.
  // The dots below act as compact navigation through the full article library.
  const slides = useMemo(() => {
    const result: (typeof ARTICLES)[] = [];
    for (let index = 0; index < ARTICLES.length; index += 2) {
      result.push(ARTICLES.slice(index, index + 2));
    }
    return result;
  }, []);

  const currentArticles = slides[activeSlide] ?? slides[0] ?? [];

  const goToSlide = (index: number) => {
    setActiveSlide(Math.max(0, Math.min(index, slides.length - 1)));
  };

  return (
    <section id="career-insights" className="border-y border-ink/10 bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-14">
          <div className="lg:pr-4">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-board/70">Insights & guides</p>
            <div className="mb-6 h-px w-12 bg-board/60" />
            <h2 className="max-w-xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Read useful ideas for your next step
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink/60 sm:text-lg">
              Practical advice on careers, skills, higher studies, job searches and mentorship — written to help you make clearer decisions.
            </p>
            <Link
              href="/articles"
              className="mt-8 inline-flex items-center gap-3 rounded-sm bg-board px-5 py-3.5 text-sm font-semibold text-chalk transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <BookOpen size={17} />
              Explore all articles
              <ArrowRight size={16} />
            </Link>
          </div>

          <div>
            <div className="grid gap-5 sm:grid-cols-2">
              {currentArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>

            {slides.length > 1 && (
              <div className="mt-7 flex items-center justify-center gap-3" aria-label="Article carousel navigation">
                <button
                  type="button"
                  onClick={() => goToSlide(activeSlide - 1)}
                  disabled={activeSlide === 0}
                  className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-ink/55 transition hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Previous articles"
                >
                  <ArrowLeft size={14} />
                </button>

                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={`rounded-full border transition-all duration-200 ${
                      index === activeSlide
                        ? "h-3 w-7 border-sage bg-sage"
                        : "h-3 w-3 border-ink/15 bg-paper hover:border-board/40 hover:bg-board/10"
                    }`}
                    aria-label={`Show article group ${index + 1}`}
                    aria-current={index === activeSlide ? "true" : undefined}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => goToSlide(activeSlide + 1)}
                  disabled={activeSlide === slides.length - 1}
                  className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-ink/55 transition hover:bg-white hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Next articles"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-ink/35">
              {Math.min(activeSlide * 2 + 1, ARTICLES.length)}–{Math.min(activeSlide * 2 + currentArticles.length, ARTICLES.length)} of {ARTICLES.length} articles
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ article }: { article: (typeof ARTICLES)[number] }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group overflow-hidden rounded-sm border border-ink/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[1.55/1] overflow-hidden bg-board/10">
        <img
          src={article.image}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
      </div>
      <div className="p-5 sm:p-6">
        <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-board">{article.category}</p>
        <h3 className="mt-3 font-display text-2xl leading-tight tracking-tight">{article.title}</h3>
        <p className="mt-3 text-sm leading-6 text-ink/60">{article.excerpt}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs text-ink/50">
          <span>{article.author}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> {article.readTime}</span>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-board">
          Read article <ArrowRight size={14} className="transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
