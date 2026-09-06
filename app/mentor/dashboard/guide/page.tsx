import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, ShieldCheck, Target } from "lucide-react";

const sections = [
  {
    title: "Before the call",
    icon: Target,
    items: [
      "Read the mentee's question and identify what you can genuinely help with.",
      "Think of one relevant experience or lesson you can share, rather than preparing a long lecture.",
      "Decide what is outside your expertise. It is completely fine to say so.",
    ],
  },
  {
    title: "During the call",
    icon: MessageCircle,
    items: [
      "Start by asking what outcome would make the conversation useful.",
      "Listen first. Ask a clarifying question before jumping into advice.",
      "Share practical context, trade-offs and lessons from experience instead of presenting one path as guaranteed.",
      "Leave the mentee with one realistic next step they can act on.",
    ],
  },
  {
    title: "Keep it responsible",
    icon: ShieldCheck,
    items: [
      "Protect the mentee's privacy and avoid asking for unnecessary personal information.",
      "Do not promise jobs, admissions, financial outcomes or other guaranteed results.",
      "For legal, medical, financial or other specialist matters, encourage the mentee to consult a qualified professional.",
      "If a question is outside your experience, be transparent and help the mentee find a better source.",
    ],
  },
];

export default function MentorGuidePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Link href="/mentor/dashboard" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">
          <ArrowLeft size={14} /> Mentor workspace
        </Link>

        <header className="mt-9 max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-board/60">CONVERSATION GUIDE</p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl">Help someone move one step forward.</h1>
          <p className="mt-4 text-base leading-7 text-ink/60">You do not need a perfect answer. A useful mentor conversation usually starts with listening, adds relevant experience, and ends with a practical next step.</p>
        </header>

        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {sections.map(({ title, icon: Icon, items }) => (
            <section key={title} className="rounded-sm border border-ink/10 bg-white p-6 pin-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-board/10 text-board"><Icon size={19} /></div>
              <h2 className="mt-5 font-display text-2xl">{title}</h2>
              <ul className="mt-5 space-y-4">
                {items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-ink/65"><CheckCircle2 size={15} className="mt-1 shrink-0 text-board" /><span>{item}</span></li>)}
              </ul>
            </section>
          ))}
        </div>

        <section className="mt-7 rounded-sm border border-ink/10 bg-board p-7 text-chalk pin-shadow sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-chalk/50">A SIMPLE CLOSE</p>
          <h2 className="mt-3 font-display text-2xl">End with clarity.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-chalk/70">Ask: “What is the one thing you want to do next?” If the mentee can answer that clearly, the conversation has probably done its job.</p>
        </section>
      </div>
    </main>
  );
}
