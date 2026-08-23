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
} from "lucide-react";
import SearchBar from "@/components/SearchBar";

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
      <header className="border-b border-ink/10 bg-paper sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-tight">AglaKadam</Link>
          <nav className="hidden sm:flex items-center gap-8 font-body text-sm text-ink/70">
            <Link href="/mentors" className="hover:text-ink transition">Browse mentors</Link>
            <Link href="/mentor" className="hover:text-ink transition">Become a mentor</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="inline-flex items-center justify-center rounded-sm border border-ink/20 bg-white text-ink font-body font-medium text-sm px-4 py-2.5 hover:bg-paper transition">Sign in</Link>
            <Link href="/mentee" className="inline-flex items-center justify-center rounded-sm bg-amber text-ink font-body font-semibold text-sm px-5 py-2.5 hover:brightness-95 transition">Get started</Link>
          </div>
        </div>
      </header>

      <section className="relative bg-board text-chalk overflow-hidden"><div className="cork-texture absolute inset-0 opacity-40" /><div className="relative mx-auto max-w-4xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center"><p className="font-mono text-xs uppercase tracking-[0.2em] text-sage mb-6">&ldquo;Agla kadam&rdquo; — Hindi for &ldquo;next step&rdquo;</p><h1 className="font-display text-4xl sm:text-6xl leading-[1.05] mb-5">Find someone who&rsquo;s already<br className="hidden sm:block" /> made your next move.</h1><p className="font-body text-base sm:text-lg text-chalk/70 max-w-xl mx-auto mb-10">For college dropouts, final-year students, and career switchers — search mentors by field, or tell us your situation and get matched.</p><SearchBar /><div className="mt-8 flex flex-wrap items-center justify-center gap-3">{SITUATIONS.slice(0,4).map(s=><Link key={s.query} href={`/mentors?q=${encodeURIComponent(s.query)}`} className="font-mono text-xs uppercase tracking-[0.1em] text-chalk/60 border border-chalk/20 rounded-full px-4 py-1.5 hover:border-chalk/50 hover:text-chalk transition">{s.label}</Link>)}</div></div></section>

      <section className="mx-auto max-w-6xl px-6 -mt-10 sm:-mt-14 relative z-10 pb-20"><div className="grid sm:grid-cols-4 gap-4"><ActionCard icon={Users} title="Find a mentor" body="Get matched based on your situation" href="/mentee"/><ActionCard icon={Compass} title="Browse mentors" body="Search and book directly" href="/mentors"/><ActionCard icon={Video} title="Book a call" body="30 minutes, one honest conversation" href="/mentors"/><ActionCard icon={Briefcase} title="Offer to mentor" body="Share what you've learned" href="/mentor"/></div></section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20 border-t border-ink/10"><div className="flex items-end justify-between mb-10"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-board/60 mb-3">Get guidance for</p><h2 className="font-display text-2xl sm:text-3xl max-w-lg">Wherever you&rsquo;re stuck, someone&rsquo;s already been there.</h2></div><Link href="/mentors" className="hidden sm:inline-flex items-center gap-1 font-mono text-xs uppercase tracking-[0.1em] text-board hover:text-board/70">View all <ArrowRight size={14}/></Link></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{SITUATIONS.map(s=><Link key={s.query} href={`/mentors?q=${encodeURIComponent(s.query)}`} className="bg-white rounded-sm border border-ink/10 p-5 pin-shadow hover:-translate-y-0.5 transition-transform"><p className="font-display text-base mb-1">{s.label}</p><span className="font-mono text-[11px] uppercase tracking-[0.1em] text-board">Find a mentor →</span></Link>)}</div></section>

      <section className="bg-white border-t border-ink/10"><div className="mx-auto max-w-6xl px-6 py-16 sm:py-20"><p className="font-mono text-xs uppercase tracking-[0.2em] text-board/60 mb-3">Explore mentors across</p><h2 className="font-display text-2xl sm:text-3xl mb-10 max-w-lg">Every field, one call away.</h2><div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{FIELDS.map(f=><Link key={f.query} href={`/mentors?q=${encodeURIComponent(f.query)}`} className="flex items-center gap-3 rounded-sm border border-ink/10 p-5 hover:border-board/40 transition"><f.icon size={22} className="text-board shrink-0"/><span className="font-body text-sm">{f.label}</span></Link>)}</div></div></section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20"><p className="font-mono text-xs uppercase tracking-[0.2em] text-board/60 mb-3">How it works</p><h2 className="font-display text-2xl sm:text-3xl mb-12 max-w-lg">Three steps, one honest call.</h2><div className="grid sm:grid-cols-3 gap-6"><NoteCard eyebrow="Step one" title="Tell us where you’re stuck" body="A short form. Your background, what’s confusing you, what you’re hoping to figure out."/><NoteCard eyebrow="Step two" title="Get matched" body="You’re matched with the mentor best suited to where you want to go, based on what you shared."/><NoteCard eyebrow="Step three" title="Book the call" body="You get an email with a mentor's name and a booking link. Pick a slot. Show up. Thirty minutes, no strings."/></div></section>

      <section className="border-t border-y border-ink/10 bg-white"><div className="mx-auto max-w-2xl px-6 py-16 sm:py-20 text-center"><p className="font-mono text-xs uppercase tracking-[0.2em] text-board/60 mb-4">What people are saying</p><p className="font-display italic text-xl sm:text-2xl text-ink/50 leading-relaxed">This section is reserved for real feedback from mentees and mentors — it&rsquo;ll fill in as calls happen.</p></div></section>
      <section className="bg-board text-chalk"><div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8"><h3 className="font-display italic text-2xl sm:text-3xl max-w-md">Know something worth passing on? Someone&rsquo;s looking for exactly that.</h3><Link href="/mentor" className="inline-flex items-center justify-center rounded-sm bg-amber text-ink font-body font-semibold px-7 py-3.5 hover:brightness-95 transition whitespace-nowrap">Sign up as a mentor</Link></div></section>
      <footer className="bg-ink text-chalk/70"><div className="mx-auto max-w-6xl px-6 py-14 grid sm:grid-cols-4 gap-10"><div><p className="font-display text-lg text-chalk mb-3">AglaKadam</p><p className="font-body text-sm leading-relaxed">&ldquo;Agla kadam&rdquo; is Hindi for &ldquo;next step.&rdquo; That&rsquo;s all this is.</p></div><FooterColumn title="For mentees" links={[{label:"Find a mentor",href:"/mentee"},{label:"Browse mentors",href:"/mentors"}]}/><FooterColumn title="For mentors" links={[{label:"Become a mentor",href:"/mentor"}]}/><FooterColumn title="More" links={[{label:"Sign in",href:"/auth"},{label:"View the source",href:"https://github.com/"}]}/></div><div className="border-t border-chalk/10"><p className="mx-auto max-w-6xl px-6 py-6 font-mono text-xs text-chalk/40">AglaKadam — built in the open.</p></div></footer>
    </main>
  );
}
function ActionCard({icon:Icon,title,body,href}:{icon:typeof Users;title:string;body:string;href:string}){return <Link href={href} className="bg-white rounded-sm border border-ink/10 p-6 pin-shadow hover:-translate-y-0.5 transition-transform"><Icon size={24} className="text-board mb-4"/><p className="font-display text-base mb-1">{title}</p><p className="font-body text-xs text-ink/60">{body}</p></Link>}
function NoteCard({eyebrow,title,body}:{eyebrow:string;title:string;body:string}){return <div className="bg-white rounded-sm border border-ink/10 p-6 pin-shadow"><p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber mb-3">{eyebrow}</p><h3 className="font-display text-xl mb-2">{title}</h3><p className="font-body text-sm text-ink/70 leading-relaxed">{body}</p></div>}
function FooterColumn({title,links}:{title:string;links:{label:string;href:string}[]}){return <div><p className="font-mono text-xs uppercase tracking-[0.15em] text-chalk/40 mb-4">{title}</p><ul className="space-y-2">{links.map(l=><li key={l.href}><Link href={l.href} className="font-body text-sm hover:text-chalk transition">{l.label}</Link></li>)}</ul></div>}
