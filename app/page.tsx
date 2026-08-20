import Link from "next/link";

const paths = [
  {
    icon: "01",
    title: "Leaving college",
    body: "Figure out what comes after a degree, a dropout, or a plan that no longer fits.",
  },
  {
    icon: "02",
    title: "Choosing a career",
    body: "Talk to someone who can help you understand a field before you commit to it.",
  },
  {
    icon: "03",
    title: "Switching careers",
    body: "Learn from people who have already made the jump and know what changed.",
  },
  {
    icon: "04",
    title: "Starting something new",
    body: "Explore freelancing, higher studies, entrepreneurship, or a completely different path.",
  },
];

const categories = [
  ["💻", "Technology", "Software, data, AI & product"],
  ["🎨", "Creative", "Design, content & media"],
  ["📈", "Business", "Marketing, finance & consulting"],
  ["🔬", "Science", "Research, medicine & academia"],
  ["🌍", "Higher studies", "Admissions & global education"],
  ["🚀", "Building", "Startups, freelance & entrepreneurship"],
];

const mentors = [
  {
    initials: "AS",
    name: "Aarav Singh",
    role: "Product Manager",
    path: "Engineering → Product",
    tags: ["Career switch", "Product", "Portfolio"],
  },
  {
    initials: "PM",
    name: "Priya Mehta",
    role: "UX Designer",
    path: "Architecture → Design",
    tags: ["Design", "Portfolio", "Career change"],
  },
  {
    initials: "RK",
    name: "Rohan Kapoor",
    role: "Software Engineer",
    path: "College → Tech",
    tags: ["Tech careers", "Interviews", "First job"],
  },
];

const articles = [
  {
    type: "CAREER CHANGE",
    title: "How do you know it is actually time to switch careers?",
    copy: "A practical way to separate a temporary bad phase from a path that genuinely no longer fits.",
  },
  {
    type: "COLLEGE → CAREER",
    title: "Five questions worth asking before you choose your next step",
    copy: "You do not need the perfect answer. You need better questions and more useful information.",
  },
  {
    type: "MENTOR STORIES",
    title: "What people wish they knew before making a big career move",
    copy: "Honest lessons from people who changed direction, started again, and figured it out as they went.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfcfe] text-slate-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-[#183153]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#2f80ed] text-sm text-white">
              →
            </span>
            Agla<span className="text-[#2f80ed]">Kadam</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
            <a href="#paths" className="transition hover:text-[#2f80ed]">
              Explore paths
            </a>

            <a href="#mentors" className="transition hover:text-[#2f80ed]">
              Find a mentor
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-[#2f80ed]"
            >
              How it works
            </a>

            <a href="#resources" className="transition hover:text-[#2f80ed]">
              Resources
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/mentor"
              className="hidden text-sm font-medium text-slate-600 sm:block"
            >
              Become a mentor
            </Link>

            <Link
              href="/mentee"
              className="rounded-lg bg-[#2f80ed] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176bd2]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-[#eef6ff] to-white">
        <div className="pointer-events-none absolute inset-0 agla-grid opacity-40" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
          <div className="max-w-4xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2f80ed] shadow-sm">
              Guidance for people between chapters
            </p>

            <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.03] tracking-[-0.04em] text-[#183153] sm:text-6xl lg:text-8xl">
              You do not have to figure out your{" "}
              <span className="text-[#2f80ed]">next step</span> alone.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Talk to someone who has already been where you are trying to go.
              Tell us what feels uncertain, and we will help connect you with a
              relevant mentor for one honest conversation.
            </p>
          </div>

          {/* SEARCH / DISCOVERY BOX */}
          <div className="mt-10 max-w-5xl rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_60px_-25px_rgba(25,70,120,.35)]">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
              <Link
                href="/mentee"
                className="group rounded-xl border border-slate-200 px-5 py-4 transition hover:border-blue-300 hover:bg-blue-50/50"
              >
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Where are you right now?
                </span>

                <span className="mt-1.5 flex items-center justify-between text-base font-semibold text-slate-800">
                  Choose your situation{" "}
                  <b className="text-[#2f80ed]">⌄</b>
                </span>
              </Link>

              <Link
                href="/mentee"
                className="group rounded-xl border border-slate-200 px-5 py-4 transition hover:border-blue-300 hover:bg-blue-50/50"
              >
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  What do you need help with?
                </span>

                <span className="mt-1.5 flex items-center justify-between text-base font-semibold text-slate-800">
                  Career, studies, switching…{" "}
                  <b className="text-[#2f80ed]">⌄</b>
                </span>
              </Link>

              <Link
                href="/mentee"
                className="flex items-center justify-center rounded-xl bg-[#2f80ed] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#176bd2]"
              >
                Find my mentor <span className="ml-2 text-lg">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-500">
            <span className="mr-1 py-2 font-medium">Popular:</span>

            {[
              "Final-year student",
              "Career switch",
              "Higher studies",
              "First job",
            ].map((item) => (
              <Link
                key={item}
                href="/mentee"
                className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200 transition hover:text-[#2f80ed] hover:ring-blue-200"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* START WHERE YOU ARE */}
      <section
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
        id="paths"
      >
        <SectionHead
          eyebrow="Start where you are"
          title="What are you trying to figure out?"
          body="You do not need to know the exact answer yet. Start with the chapter you are currently in."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {paths.map((path) => (
            <Link
              href="/mentee"
              key={path.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf3ff] text-sm font-bold text-[#2f80ed]">
                {path.icon}
              </div>

              <h3 className="text-xl font-bold tracking-tight text-[#183153]">
                {path.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {path.body}
              </p>

              <span className="mt-6 inline-flex text-sm font-semibold text-[#2f80ed]">
                Explore this path{" "}
                <b className="ml-2 transition group-hover:translate-x-1">
                  →
                </b>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* EXPLORE BY DIRECTION */}
      <section
        className="border-y border-slate-200 bg-[#f7faff]"
        id="categories"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHead
              eyebrow="Explore by direction"
              title="Find someone who understands your path"
            />

            <Link
              href="/mentee"
              className="text-sm font-semibold text-[#2f80ed]"
            >
              View all paths →
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map(([emoji, title, desc]) => (
              <Link
                href="/mentee"
                key={title}
                className="group text-center"
              >
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white text-3xl shadow-sm ring-1 ring-slate-100 transition group-hover:-translate-y-1 group-hover:ring-blue-200">
                  {emoji}
                </div>

                <h3 className="mt-4 text-sm font-bold text-[#183153]">
                  {title}
                </h3>

                <p className="mx-auto mt-1 max-w-[160px] text-xs leading-5 text-slate-500">
                  {desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED MENTORS */}
      <section
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
        id="mentors"
      >
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <SectionHead
            eyebrow="People you can talk to"
            title="Learn from someone who's already made the jump"
            body="These profiles show the kind of experience AglaKadam is built around. Matching remains focused on your specific situation."
          />

          <Link
            href="/mentee"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#2f80ed] px-5 text-sm font-semibold text-[#2f80ed] transition hover:bg-blue-50"
          >
            Browse mentors
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {mentors.map((mentor, index) => (
            <article
              key={mentor.name}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div
                className={`h-2 ${
                  index === 0
                    ? "bg-[#2f80ed]"
                    : index === 1
                    ? "bg-[#8b6df6]"
                    : "bg-[#16a085]"
                }`}
              />

              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-[#edf5ff] text-sm font-bold text-[#2f80ed]">
                    {mentor.initials}
                  </div>

                  <div>
                    <h3 className="font-bold text-[#183153]">
                      {mentor.name}
                    </h3>

                    <p className="text-sm text-slate-500">{mentor.role}</p>
                  </div>
                </div>

                <div className="my-6 rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-400">
                    Their path
                  </p>

                  <p className="mt-1 font-semibold text-slate-700">
                    {mentor.path}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mentor.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-[#286ac2]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href="/mentee"
                  className="mt-6 block border-t border-slate-100 pt-5 text-sm font-semibold text-[#2f80ed]"
                >
                  Ask to be matched →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        className="border-y border-slate-200 bg-white"
        id="how-it-works"
      >
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="text-center">
            <SectionHead
              eyebrow="How it works"
              title="Three steps. One honest conversation."
              body="No courses to buy. No endless chat. Just a relevant person and a useful 30-minute call."
              centered
            />
          </div>

          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            {[
              [
                "01",
                "Tell us where you are",
                "Share your background, what feels unclear, and the direction you are considering.",
              ],
              [
                "02",
                "Get thoughtfully matched",
                "We look for a mentor whose experience is genuinely relevant to your situation.",
              ],
              [
                "03",
                "Book your conversation",
                "Receive the introduction, choose a time, and have the conversation that helps you move forward.",
              ],
            ].map(([n, t, b], i) => (
              <div
                key={n}
                className="relative rounded-2xl border border-slate-200 p-7"
              >
                <div className="mb-7 text-5xl font-bold tracking-tighter text-[#d9eaff]">
                  {n}
                </div>

                <h3 className="text-xl font-bold text-[#183153]">{t}</h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">{b}</p>

                {i < 2 && (
                  <span className="absolute -right-6 top-1/2 hidden text-2xl text-blue-300 lg:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESOURCES */}
      <section
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
        id="resources"
      >
        <div className="grid gap-10 lg:grid-cols-[.9fr_2.1fr]">
          <div>
            <SectionHead
              eyebrow="Resources"
              title="A little clarity before your next conversation"
              body="Practical stories, questions, and lessons for people navigating change."
            />

            <Link
              href="#resources"
              className="mt-7 inline-flex rounded-lg bg-[#183153] px-5 py-3 text-sm font-semibold text-white"
            >
              See all resources
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {articles.map((a, i) => (
              <article
                key={a.title}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div
                  className={`h-36 ${
                    [
                      "bg-gradient-to-br from-blue-100 to-blue-200",
                      "bg-gradient-to-br from-violet-100 to-indigo-200",
                      "bg-gradient-to-br from-amber-100 to-orange-200",
                    ][i]
                  } p-6`}
                >
                  <span className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold tracking-[.1em] text-slate-600">
                    {a.type}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold leading-6 text-[#183153] transition group-hover:text-[#2f80ed]">
                    {a.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {a.copy}
                  </p>

                  <span className="mt-5 block text-sm font-semibold text-[#2f80ed]">
                    Read more →
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE / SOCIAL PROOF */}
      <section className="border-y border-slate-200 bg-[#f7faff]">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#2f80ed]">
            What this should feel like
          </p>

          <blockquote className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight text-[#183153] sm:text-5xl">
            “Sometimes you do not need another article telling you what to do.
            You need one person who has actually been there.”
          </blockquote>

          <div className="mt-8">
            <p className="font-semibold text-slate-700">The AglaKadam idea</p>

            <p className="mt-1 text-sm text-slate-500">
              Built around honest, relevant conversations.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-[#183153] text-white">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#2f80ed] opacity-30 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-200">
              Your next step can start small
            </p>

            <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-6xl">
              You do not have to have everything figured out.
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-8 text-blue-100/80">
              Tell us where you are. We will start from there.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/mentee"
              className="rounded-xl bg-white px-6 py-4 text-center text-sm font-bold text-[#183153] transition hover:bg-blue-50"
            >
              Find a mentor →
            </Link>

            <Link
              href="/mentor"
              className="rounded-xl border border-white/30 px-6 py-4 text-center text-sm font-bold text-white transition hover:bg-white/10"
            >
              Become a mentor
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#10243d] text-slate-300">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link
                href="/"
                className="font-display text-2xl font-bold text-white"
              >
                Agla<span className="text-[#62a6ff]">Kadam</span>
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                A simple way to find someone who has already navigated the
                chapter you are entering.
              </p>
            </div>

            {[
              [
                "Explore",
                ["Find a mentor", "Explore paths", "How it works"],
              ],
              [
                "For mentors",
                ["Become a mentor", "Mentor guidelines", "Why mentor?"],
              ],
              [
                "More",
                ["Resources", "About AglaKadam", "Contact"],
              ],
            ].map(([head, links]) => (
              <div key={head as string}>
                <h3 className="text-sm font-bold text-white">
                  {head as string}
                </h3>

                <ul className="mt-4 space-y-3 text-sm text-slate-400">
                  {(links as string[]).map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-white">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} AglaKadam. One conversation can be a
              beginning.
            </p>

            <div className="flex gap-5">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHead({
  eyebrow,
  title,
  body,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-2xl" : "max-w-2xl"}>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#2f80ed]">
        {eyebrow}
      </p>

      <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#183153] sm:text-4xl">
        {title}
      </h2>

      {body && (
        <p className="mt-3 text-base leading-7 text-slate-600">{body}</p>
      )}
    </div>
  );
}
