import Link from "next/link";
import { ArrowRight, BookOpen, Clock3 } from "lucide-react";

const ARTICLES = [
  {
    category: "CAREER GROWTH",
    title: "How to Build Skills That Make You Future-Ready",
    excerpt: "A practical guide to choosing high-value skills and turning them into a plan you can actually follow.",
    author: "AglaKadam Editorial",
    role: "Career & skills",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
    href: "/find-mentor?topic=skills",
  },
  {
    category: "CAREER GUIDANCE",
    title: "How to Choose the Right Career Path for You",
    excerpt: "A simple framework for comparing options, understanding your strengths and deciding what to explore next.",
    author: "AglaKadam Editorial",
    role: "Career guidance",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
    href: "/find-mentor?topic=career-guidance",
  },
];

export default function ArticlesSection() {
  return (
    <section id="career-insights" className="border-y border-ink/10 bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-14">
          <div className="lg:pr-4">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-board/70">Insights & guides</p>
            <div className="mb-6 h-px w-12 bg-board/60" />
            <h2 className="max-w-xl font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Read top articles from career experts
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink/60 sm:text-lg">
              Practical advice, career insights and mentorship guides to help you make confident decisions and grow in your journey.
            </p>
            <Link
              href="#career-insights"
              className="mt-8 inline-flex items-center gap-3 rounded-sm bg-board px-5 py-3.5 text-sm font-semibold text-chalk transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <BookOpen size={17} />
              Explore articles
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {ARTICLES.map((article) => (
              <article
                key={article.title}
                className="group overflow-hidden rounded-sm border border-ink/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href={article.href} className="block" aria-label={`Read ${article.title}`}>
                  <div className="relative aspect-[1.55/1] overflow-hidden bg-board/10">
                    <img
                      src={article.image}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-board">{article.category}</p>
                    <h3 className="mt-3 font-display text-2xl leading-tight tracking-tight">{article.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-ink/60">{article.excerpt}</p>
                    <div className="mt-6 flex items-end justify-between gap-4 border-t border-ink/10 pt-4">
                      <div>
                        <p className="text-sm font-semibold text-ink">{article.author}</p>
                        <p className="mt-0.5 text-xs text-ink/50">{article.role}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-ink/55">
                        <Clock3 size={14} /> {article.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-2" aria-hidden="true">
          <span className="h-2.5 w-7 rounded-full bg-board" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
        </div>
      </div>
    </section>
  );
}
