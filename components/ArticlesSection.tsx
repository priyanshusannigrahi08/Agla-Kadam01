import Link from "next/link";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";
import { ARTICLES } from "@/app/data/articles";

export default function ArticlesSection() {
  const featured = ARTICLES.slice(0, 2);
  const remaining = ARTICLES.slice(2);

  return (
    <section id="career-insights" className="border-y border-ink/10 bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-14">
          <div className="lg:pr-4">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-board/70">Insights & guides</p>
            <div className="mb-6 h-px w-12 bg-board/60" />
            <h2 className="max-w-xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">Read useful ideas for your next step</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink/60 sm:text-lg">Practical advice on careers, skills, higher studies, job searches and mentorship — written to help you make clearer decisions.</p>
            <Link href="/articles" className="mt-8 inline-flex items-center gap-3 rounded-sm bg-board px-5 py-3.5 text-sm font-semibold text-chalk transition hover:-translate-y-0.5 hover:shadow-lg"><BookOpen size={17} /> Explore all 10 articles <ArrowRight size={16} /></Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {featured.map((article) => <ArticleCard key={article.slug} article={article} featured />)}
          </div>
        </div>

        <div className="mt-10 border-t border-ink/10 pt-10">
          <div className="mb-6 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-board/60">More to explore</p><h3 className="mt-2 font-display text-2xl sm:text-3xl">Keep moving, one useful idea at a time.</h3></div><Link href="/articles" className="hidden items-center gap-1 text-sm font-semibold text-board sm:inline-flex">View all <ArrowRight size={14} /></Link></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {remaining.map((article) => <ArticleCard key={article.slug} article={article} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ article, featured = false }: { article: (typeof ARTICLES)[number]; featured?: boolean }) {
  return (
    <Link href={`/articles/${article.slug}`} className={`group overflow-hidden rounded-sm border border-ink/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${featured ? "" : "flex flex-col"}`}>
      <div className={`relative overflow-hidden bg-board/10 ${featured ? "aspect-[1.55/1]" : "aspect-[1.65/1]"}`}>
        <img src={article.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
      </div>
      <div className={`p-5 ${featured ? "sm:p-6" : "flex flex-1 flex-col"}`}>
        <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-board">{article.category}</p>
        <h3 className={`${featured ? "text-2xl" : "text-xl"} mt-3 font-display leading-tight tracking-tight`}>{article.title}</h3>
        <p className="mt-3 text-sm leading-6 text-ink/60">{article.excerpt}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs text-ink/50"><span>{article.author}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> {article.readTime}</span></div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-board">Read article <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}
