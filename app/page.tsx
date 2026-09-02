import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Compass,
  GraduationCap,
  Landmark,
  LineChart,
  MessageCircle,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import AuthButton from "@/components/AuthButton";
import FeaturedMentors from "@/components/FeaturedMentors";

const SITUATIONS = [
  { label: "Just left college", query: "left college", icon: GraduationCap },
  { label: "Final-year student", query: "final year", icon: BookOpen },
  { label: "Switching careers", query: "career switch", icon: Compass },
  { label: "Thinking about higher studies", query: "higher studies", icon: GraduationCap },
  { label: "Unsure about your next job", query: "job search", icon: Briefcase },
  { label: "Starting out on your own", query: "entrepreneurship", icon: Sparkles },
];

const FIELDS = [
  { label: "Tech & Product", icon: Compass, query: "product" },
  { label: "Design", icon: Palette, query: "design" },
  { label: "Business & Marketing", icon: LineChart, query: "marketing" },
  { label: "Finance", icon: Landmark, query: "finance" },
  { label: "Government & Civil Services", icon: BookOpen, query: "civil services" },
  { label: "Academia & Research", icon: GraduationCap, query: "research" },
];

const STEPS = [
  {
    number: "01",
    title: "Tell us where you’re stuck",
    body: "Answer three quick questions about your situation and what kind of experience would help.",
  },
  {
    number: "02",
    title: "Compare real mentors",
    body: "Look through profiles, experience, expertise, verification and published reviews.",
  },
  {
    number: "03",
    title: "Have the conversation",
    body: "Choose a calendar slot and use one focused 30-minute call to work through your next step.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="font-display text-xl tracking-tight" aria-label="AglaKadam home">AglaKadam</Link>
          <nav className="hidden items-center gap-7 font-body text-sm text-ink/65 md:flex" aria-label="Main navigation">
            <Link href="/mentors" className="transition hover:text-ink">Browse mentors</Link>
            <Link href="/find-mentor" className="transition hover:text-ink">Find a mentor</Link>
            <Link href="/ai-mentor/arjun-mehta" className="transition hover:text-ink">AI mentor</Link>
            <Link href="/mentor" className="transition hover:text-ink">Become a mentor</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <AuthButton />
            <Link href="/find-mentor" className="inline-flex items-center justify-center rounded-sm bg-amber px-4 py-2.5 font-body text-sm font-semibold transition hover:brightness-95 sm:px-5">Get started</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-board text-chalk">
        <div className="cork-texture absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:gap-16 lg:pt-24">
          <div>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-sage">“Agla kadam” — your next step</p>
            <h1 className="max-w-3xl font-display text-5xl leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">The right conversation can change what comes next.</h1>
            <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-chalk/70 sm:text-lg">Find someone who has already navigated the kind of decision you’re facing — then have one focused conversation with them.</p>
            <div className="mt-8 max-w-2xl">
              <SearchBar />
              <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-chalk/45"><Search size={12} /> Search by field, role, skill or problem</div>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {SITUATIONS.slice(0, 4).map((situation) => (
                <Link key={situation.query} href={`/mentors?q=${encodeURIComponent(situation.query)}`} className="rounded-full border border-chalk/20 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-chalk/60 transition hover:border-chalk/50 hover:text-chalk">{situation.label}</Link>
              ))}
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative ml-auto max-w-sm rotate-1 rounded-sm border border-chalk/15 bg-paper p-7 text-ink shadow-2xl">
              <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-amber shadow-md" />
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-board/55">A simple format</p>
              <div className="mt-7 space-y-6">
                <MiniPoint number="01" title="Find your person" body="Search or use the guided matching flow." />
                <MiniPoint number="02" title="See their experience" body="Understand what they can actually help with." />
                <MiniPoint number="03" title="Book one call" body="A focused 30-minute conversation." />
              </div>
              <div className="mt-7 border-t border-ink/10 pt-5"><p className="font-display text-lg italic text-ink/75">“You don’t need all the answers. Sometimes you need the right person to ask.”</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-7 max-w-7xl px-5 pb-14 sm:px-6 sm:-mt-9">
        <div className="grid gap-3 sm:grid-cols-3">
          <QuickCard icon={Users} title="Human experience" body="Learn from someone who has been through it." href="/mentors" />
          <QuickCard icon={Compass} title="Guided matching" body="Start with your situation, not a giant directory." href="/find-mentor" />
          <QuickCard icon={CalendarDays} title="One focused call" body="Choose a slot and keep the conversation practical." href="/mentors" />
        </div>
      </section>

      <FeaturedMentors />

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="mb-9 flex items-end justify-between gap-6">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-board/60">Start with your situation</p>
            <h2 className="max-w-2xl font-display text-3xl leading-tight sm:text-4xl">You don’t have to know exactly what you need yet.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/60">Pick the closest fit and explore people who can help you think through what comes next.</p>
          </div>
          <Link href="/find-mentor" className="hidden shrink-0 items-center gap-1 font-mono text-xs uppercase tracking-[0.1em] text-board hover:text-board/70 sm:inline-flex">Guided matching <ArrowRight size={14} /></Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SITUATIONS.map((situation) => {
            const Icon = situation.icon;
            return <Link key={situation.query} href={`/mentors?q=${encodeURIComponent(situation.query)}`} className="group flex min-h-32 flex-col justify-between rounded-sm border border-ink/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-board/30 hover:shadow-lg"><div className="flex items-start justify-between gap-4"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-board/10 text-board"><Icon size={18} /></span><ArrowRight size={16} className="text-ink/30 transition group-hover:translate-x-1 group-hover:text-board" /></div><p className="mt-7 font-display text-lg">{situation.label}</p></Link>;
          })}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-board/60">How it works</p>
              <h2 className="max-w-xl font-display text-3xl leading-tight sm:text-4xl">Less scrolling. More useful conversations.</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60">AglaKadam keeps the journey deliberately small: understand your situation, find a useful perspective, and talk.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {STEPS.map((step) => <div key={step.number} className="rounded-sm border border-ink/10 bg-paper p-5"><p className="font-mono text-xs text-amber">{step.number}</p><h3 className="mt-7 font-display text-xl leading-tight">{step.title}</h3><p className="mt-3 text-sm leading-relaxed text-ink/65">{step.body}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="mb-9 flex items-end justify-between gap-6">
          <div><p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-board/60">Explore by field</p><h2 className="font-display text-3xl sm:text-4xl">Find experience close to where you want to go.</h2></div>
          <Link href="/mentors" className="hidden items-center gap-1 font-mono text-xs uppercase tracking-[0.1em] text-board sm:inline-flex">All mentors <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {FIELDS.map((field) => { const Icon = field.icon; return <Link key={field.query} href={`/mentors?q=${encodeURIComponent(field.query)}`} className="group rounded-sm border border-ink/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-board/30"><Icon size={21} className="text-board" /><p className="mt-8 font-body text-sm font-medium leading-snug">{field.label}</p><ArrowRight size={14} className="mt-3 text-ink/25 transition group-hover:translate-x-1 group-hover:text-board" /></Link>; })}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-4 md:grid-cols-3">
            <TrustCard icon={ShieldCheck} title="See the context" body="Mentor profiles surface their role, experience, expertise and published reviews so you can make an informed choice." />
            <TrustCard icon={MessageCircle} title="Bring real questions" body="The goal isn’t a generic lecture. Use the conversation to pressure-test a decision, plan or next move." />
            <TrustCard icon={CheckCircle2} title="Keep it focused" body="A simple 30-minute format makes it easier to start with one useful conversation instead of a long programme." />
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-white"><div className="mx-auto max-w-2xl px-5 py-14 text-center sm:px-6 sm:py-16"><p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-board/60">A growing community</p><p className="font-display text-xl italic leading-relaxed text-ink/45 sm:text-2xl">Real feedback from mentees and mentors will appear here as conversations happen.</p></div></section>

      <section className="bg-board text-chalk">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-16 sm:px-6 sm:py-20 md:flex-row md:items-end md:justify-between">
          <div><p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-sage">For people with experience to share</p><h2 className="max-w-2xl font-display text-3xl leading-tight sm:text-4xl">Someone is trying to figure out what you already learned the hard way.</h2></div>
          <Link href="/mentor" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-amber px-6 py-3.5 font-body font-semibold text-ink transition hover:brightness-95">Become a mentor <ArrowRight size={16} /></Link>
        </div>
      </section>

      <footer className="bg-ink text-chalk/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 sm:grid-cols-4">
          <div><p className="mb-3 font-display text-lg text-chalk">AglaKadam</p><p className="max-w-xs font-body text-sm leading-relaxed">“Agla kadam” means “next step”. A place to find useful perspective when you’re between chapters.</p></div>
          <FooterColumn title="For mentees" links={[{ label: "Find a mentor", href: "/find-mentor" }, { label: "Browse mentors", href: "/mentors" }, { label: "Dashboard", href: "/dashboard" }]} />
          <FooterColumn title="For mentors" links={[{ label: "Become a mentor", href: "/mentor" }, { label: "Dashboard", href: "/dashboard" }]} />
          <FooterColumn title="More" links={[{ label: "Sign in", href: "/auth" }, { label: "View the source", href: "https://github.com/priyanshusannigrahi08/Agla-Kadam01" }]} />
        </div>
        <div className="border-t border-chalk/10"><p className="mx-auto max-w-7xl px-5 py-6 font-mono text-xs text-chalk/40 sm:px-6">AglaKadam — built in the open.</p></div>
      </footer>
    </main>
  );
}

function QuickCard({ icon: Icon, title, body, href }: { icon: typeof Users; title: string; body: string; href: string }) {
  return <Link href={href} className="group pin-shadow rounded-sm border border-ink/10 bg-white p-5 transition hover:-translate-y-1"><div className="flex items-start justify-between gap-4"><Icon size={22} className="text-board" /><ArrowRight size={15} className="text-ink/25 transition group-hover:translate-x-1 group-hover:text-board" /></div><p className="mt-6 font-display text-lg">{title}</p><p className="mt-1 text-xs leading-relaxed text-ink/60">{body}</p></Link>;
}

function MiniPoint({ number, title, body }: { number: string; title: string; body: string }) {
  return <div className="flex gap-4"><span className="font-mono text-xs text-amber">{number}</span><div><p className="font-display text-lg">{title}</p><p className="mt-1 text-sm leading-relaxed text-ink/60">{body}</p></div></div>;
}

function TrustCard({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return <div className="rounded-sm border border-ink/10 bg-paper p-6"><Icon size={22} className="text-board" /><h3 className="mt-6 font-display text-xl">{title}</h3><p className="mt-2 text-sm leading-relaxed text-ink/65">{body}</p></div>;
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return <div><p className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-chalk/40">{title}</p><ul className="space-y-2">{links.map((link) => <li key={link.href}><Link href={link.href} className="font-body text-sm hover:text-chalk">{link.label}</Link></li>)}</ul></div>;
}
