import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3, MessageCircle, Share2 } from "lucide-react";
import { notFound } from "next/navigation";
import { ARTICLES, getArticle } from "@/app/data/articles";

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found | AglaKadam" };
  return {
    title: `${article.title} | AglaKadam`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = ARTICLES.filter((item) => item.slug !== article.slug && item.category === article.category).slice(0, 2);
  const fallbackRelated = related.length < 2 ? ARTICLES.filter((item) => item.slug !== article.slug && !related.some((r) => r.slug === item.slug)).slice(0, 2 - related.length) : [];
  const recommendations = [...related, ...fallbackRelated].slice(0, 2);

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

      <article>
        <div className="mx-auto max-w-5xl px-5 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
          <Link href="/articles" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-board/70 hover:text-board">
            <ArrowLeft size={14} /> Back to articles
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-end lg:gap-14">
            <div>
              <p className="font-mono text-xs font-semibold tracking-[0.18em] text-board">{article.category}</p>
              <h1 className="mt-4 font-display text-4xl leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">{article.title}</h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-ink/65 sm:text-lg">{article.excerpt}</p>
              <div className="mt-7 flex flex-wrap items-center gap-4 text-xs text-ink/50">
                <span className="font-semibold text-ink">{article.author}</span>
                <span>{article.role}</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> {article.readTime}</span>
              </div>
            </div>
            <div className="overflow-hidden rounded-sm border border-ink/10 bg-white shadow-sm">
              <img src={article.image} alt="" className="aspect-[1.25/1] w-full object-cover" />
            </div>
          </div>
        </div>

        <div className="border-y border-ink/10 bg-white">
          <div className="mx-auto grid max-w-5xl gap-12 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_250px] lg:gap-16">
            <div className="min-w-0">
              <p className="font-display text-xl leading-8 text-ink/80 sm:text-2xl">{article.intro}</p>
              <div className="mt-12 space-y-12">
                {article.sections.map((section) => (
                  <section key={section.heading}>
                    <h2 className="font-display text-2xl leading-tight sm:text-3xl">{section.heading}</h2>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-ink/70 sm:text-base">
                      {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                    {section.bullets && (
                      <ul className="mt-5 space-y-2 rounded-sm border border-board/10 bg-paper p-5 text-sm leading-6 text-ink/70">
                        {section.bullets.map((bullet) => <li key={bullet} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />{bullet}</li>)}
                      </ul>
                    )}
                  </section>
                ))}
              </div>

              <div className="mt-12 rounded-sm border border-board/20 bg-board p-6 text-chalk sm:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sage">The AglaKadam takeaway</p>
                <p className="mt-4 font-display text-xl leading-relaxed sm:text-2xl">{article.takeaway}</p>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-sm border border-ink/10 bg-paper p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/65">Make the next step practical</p>
                <p className="mt-3 text-sm leading-6 text-ink/65">Have a question this article cannot answer? Talk to someone who has already navigated a similar decision.</p>
                <Link href="/find-mentor" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-amber px-4 py-3 text-sm font-semibold">Find a mentor <ArrowRight size={15} /></Link>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href="/find-mentor" className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm border border-ink/10 bg-white px-3 py-2.5 text-xs font-semibold"><MessageCircle size={14} /> Ask someone</Link>
                <button type="button" onClick={() => { if (typeof navigator !== "undefined" && navigator.share) navigator.share({ title: article.title, url: window.location.href }).catch(() => undefined); else navigator.clipboard?.writeText(window.location.href); }} className="inline-flex items-center justify-center rounded-sm border border-ink/10 bg-white px-3 py-2.5 text-xs font-semibold" aria-label="Share article"><Share2 size={14} /></button>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-18">
        <div className="flex items-end justify-between gap-5">
          <div><p className="font-mono text-xs uppercase tracking-[0.16em] text-board/60">Keep reading</p><h2 className="mt-2 font-display text-3xl">More useful perspectives</h2></div>
          <Link href="/articles" className="hidden items-center gap-1 text-sm font-semibold text-board sm:inline-flex">All articles <ArrowRight size={15} /></Link>
        </div>
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          {recommendations.map((item) => <Link key={item.slug} href={`/articles/${item.slug}`} className="group overflow-hidden rounded-sm border border-ink/10 bg-white transition hover:-translate-y-1 hover:shadow-lg"><img src={item.image} alt="" className="aspect-[1.7/1] w-full object-cover transition duration-500 group-hover:scale-[1.02]" /><div className="p-5"><p className="font-mono text-[10px] tracking-[0.16em] text-board">{item.category}</p><h3 className="mt-2 font-display text-xl leading-tight">{item.title}</h3><p className="mt-2 text-sm leading-6 text-ink/60">{item.excerpt}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-board">Read article <ArrowRight size={14} /></span></div></Link>)}
        </div>
      </section>

      <footer className="bg-ink text-chalk/70"><div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 sm:px-6 sm:flex-row sm:items-center sm:justify-between"><p className="font-display text-lg text-chalk">AglaKadam</p><Link href="/" className="text-sm hover:text-chalk">Back to home</Link></div></footer>
    </main>
  );
}
