import Link from "next/link";
import {
  Video,
  Users,
  Compass,
  BookOpen,
  Briefcase,
  Palette,
  LineChart,
  Landmark,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Clock3,
  MessageCircle,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import AuthButton from "@/components/AuthButton";
import FeaturedMentors from "@/components/FeaturedMentors";

const SITUATIONS = [
  { label: "Just left college", query: "left college" },
  { label: "Final-year student", query: "final year" },
  { label: "Switching careers", query: "career switch" },
  { label: "Confused about higher studies", query: "higher studies" },
  { label: "Unsure about your next job", query: "job search" },
  { label: "Starting out on your own", query: "entrepreneurship" },
];

const FIELDS = [
  { label: "Tech & Product", icon: Compass, query: "product" },
  { label: "Design", icon: Palette, query: "design" },
  { label: "Business & Marketing", icon: LineChart, query: "marketing" },
  { label: "Finance", icon: Landmark, query: "finance" },
  { label: "Government & Civil Services", icon: BookOpen, query: "civil services" },
  { label: "Academia & Research", icon: GraduationCap, query: "research" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="font-display text-xl tracking-tight">AglaKadam</Link>
          <nav className="hidden items-center gap-8 font-body text-sm text-ink/70 sm:flex">
            <Link href="/mentors" className="transition hover:text-ink">Find a mentor</Link>
            <Link href="/ai-mentor/arjun-mehta" className="transition hover:text-ink">AI mentor</Link>
            <Link href="/mentor" className="transition hover:text-ink">Become a mentor</Link>
          </nav>
          <div className="flex items-center gap-3">
            <AuthButton />
            <Link href="/mentee" className="inline-flex items-center justify-center rounded-sm bg-amber px-5 py-2.5 font-body text-sm font-semibold transition hover:brightness-95">Get started</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-board text-chalk">
        <div className="cork-texture absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-16 text-center sm:pb-24 sm:pt-24">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-sage">“Agla kadam” — Hindi for “next step”</p>
          <h1 className="font-display text-4xl leading-[1.05] sm:text-6xl">Find the right person for your next step.</h1>
          <p className="mx-auto mb-10 mt-5 max-w-2xl font-body text-base text-chalk/70 sm:text-lg">Search by field, role or problem — then learn from someone who has already been there.</p>
          <SearchBar />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {SITUATIONS.slice(0, 5).map((s) => (
              <Link key={s.query} href={`/mentors?q=${encodeURIComponent(s.query)}`} className="rounded-full border border-chalk/20 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.1em] text-chalk/60 transition hover:border-chalk/50 hover:text-chalk">{s.label}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-6 pb-16 sm:-mt-14">
        <div className="grid gap-4 sm:grid-cols-4">
          <ActionCard icon={Users} title="Find a mentor" body="Get matched to your situation" href="/mentee" />
          <ActionCard icon={Compass} title="Browse mentors" body="Search and compare profiles" href="/mentors" />
          <ActionCard icon={Video} title="Book a call" body="One honest 30-minute conversation" href="/mentors" />
          <ActionCard icon={Briefcase} title="Become a mentor" body="Share what you've learned" href="/mentor" />
        </div>
      </section>

      <FeaturedMentors />

      <section className="mx-auto max-w-6xl border-t border-ink/10 px-6 py-16 sm:py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-board/60">Get guidance for</p>
            <h2 className="max-w-xl font-display text-2xl sm:text-3xl">Wherever you’re stuck, someone’s already been there.</h2>
          </div>
          <Link href="/mentors" className="hidden items-center gap-1 font-mono text-xs uppercase tracking-[0.1em] text-board hover:text-board/70 sm:inline-flex">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SITUATIONS.map((s) => <Link key={s.query} href={`/mentors?q=${encodeURIComponent(s.query)}`} className="pin-shadow rounded-sm border border-ink/10 bg-white p-5 transition-transform hover:-translate-y-0.5"><p className="mb-1 font-display text-base">{s.label}</p><span className="font-mono text-[11px] uppercase tracking-[0.1em] text-board">Find a mentor →</span></Link>)}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-board/60">Why AglaKadam</p>
          <h2 className="mb-10 max-w-xl font-display text-2xl sm:text-3xl">Less guessing. More useful conversations.</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <TrustCard icon={ShieldCheck} title="Experience-led guidance" body="Learn from people who can share practical context from their own path." />
            <TrustCard icon={MessageCircle} title="Focused conversations" body="Bring the questions you actually need help thinking through." />
            <TrustCard icon={Clock3} title="Simple 30-minute calls" body="A clear format that makes it easy to start without a long commitment." />
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-ink/10">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-board/60">Explore mentors across</p>
          <h2 className="mb-10 max-w-lg font-display text-2xl sm:text-3xl">Every field, one conversation away.</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {FIELDS.map((f) => <Link key={f.query} href={`/mentors?q=${encodeURIComponent(f.query)}`} className="flex items-center gap-3 rounded-sm border border-ink/10 p-5 transition hover:border-board/40"><f.icon size={22} className="shrink-0 text-board" /><span className="font-body text-sm">{f.label}</span></Link>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-board/60">How it works</p>
        <h2 className="mb-12 max-w-lg font-display text-2xl sm:text-3xl">Three steps, one honest call.</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <NoteCard eyebrow="Step one" title="Tell us where you’re stuck" body="A short form about your background, what’s confusing you, and what you hope to figure out." />
          <NoteCard eyebrow="Step two" title="Find the right mentor" body="Explore profiles by field and experience, or use your situation to get started." />
          <NoteCard eyebrow="Step three" title="Book the call" body="Pick an available slot and use 30 minutes to get practical perspective on your next step." />
        </div>
      </section>

      <section className="border-y border-ink/10 bg-paper">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center sm:py-20">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-board/60">What people are saying</p>
          <p className="font-display text-xl italic leading-relaxed text-ink/45 sm:text-2xl">Real feedback from mentees and mentors will appear here as conversations happen.</p>
        </div>
      </section>

      <section className="bg-board text-chalk">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 sm:flex-row sm:items-end sm:justify-between sm:py-20">
          <h3 className="max-w-md font-display text-2xl italic sm:text-3xl">Know something worth passing on? Someone’s looking for exactly that.</h3>
          <Link href="/mentor" className="inline-flex items-center justify-center rounded-sm bg-amber px-7 py-3.5 font-body font-semibold text-ink transition hover:brightness-95">Sign up as a mentor</Link>
        </div>
      </section>

      <footer className="bg-ink text-chalk/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-4">
          <div><p className="mb-3 font-display text-lg text-chalk">AglaKadam</p><p className="font-body text-sm leading-relaxed">“Agla kadam” is Hindi for “next step.” That’s all this is.</p></div>
          <FooterColumn title="For mentees" links={[{ label: "Find a mentor", href: "/mentee" }, { label: "Browse mentors", href: "/mentors" }]} />
          <FooterColumn title="For mentors" links={[{ label: "Become a mentor", href: "/mentor" }]} />
          <FooterColumn title="More" links={[{ label: "Sign in", href: "/auth" }, { label: "View the source", href: "https://github.com/priyanshusannigrahi08/Agla-Kadam01" }]} />
        </div>
        <div className="border-t border-chalk/10"><p className="mx-auto max-w-6xl px-6 py-6 font-mono text-xs text-chalk/40">AglaKadam — built in the open.</p></div>
      </footer>
    </main>
  );
}

function ActionCard({ icon: Icon, title, body, href }: { icon: typeof Users; title: string; body: string; href: string }) {
  return <Link href={href} className="pin-shadow rounded-sm border border-ink/10 bg-white p-6 transition-transform hover:-translate-y-1"><Icon size={24} className="mb-4 text-board" /><p className="mb-1 font-display text-base">{title}</p><p className="font-body text-xs text-ink/60">{body}</p></Link>;
}

function TrustCard({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return <div className="rounded-sm border border-ink/10 bg-paper p-6"><Icon size={22} className="mb-4 text-board" /><h3 className="font-display text-lg">{title}</h3><p className="mt-2 text-sm leading-relaxed text-ink/65">{body}</p></div>;
}

function NoteCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <div className="pin-shadow rounded-sm border border-ink/10 bg-white p-6"><p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em] text-amber">{eyebrow}</p><h3 className="mb-2 font-display text-xl">{title}</h3><p className="font-body text-sm leading-relaxed text-ink/70">{body}</p></div>;
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return <div><p className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-chalk/40">{title}</p><ul className="space-y-2">{links.map((l) => <li key={l.href}><Link href={l.href} className="font-body text-sm hover:text-chalk">{l.label}</Link></li>)}</ul></div>;
}
