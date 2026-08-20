import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* HERO — a pinned note on a chalkboard */}
      <section className="relative bg-board text-chalk overflow-hidden">
        <div className="cork-texture absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-5xl px-6 pt-16 pb-28 sm:pt-20 sm:pb-36">
          <h1 className="font-display text-6xl sm:text-8xl leading-none mb-4 tracking-tight">
            AglaKadam
          </h1>
          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-sage mb-16">
            Guidance for people between chapters
          </p>

          <div className="relative inline-block max-w-2xl">
            <div className="pin-dot relative bg-chalk text-ink rounded-sm px-8 py-9 pin-shadow -rotate-1">
              <h2 className="font-display italic text-3xl sm:text-5xl leading-[1.1] mb-4">
                Left college. Finishing your degree. Switching lanes.
                <br />
                Talk to someone who&rsquo;s already made the jump.
              </h2>
              <p className="font-body text-base sm:text-lg text-ink/70 max-w-xl">
                Tell us where you&rsquo;re stuck. Get matched with a mentor.
                You book one 30-minute call. That&rsquo;s the whole thing.
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Link
              href="/mentee"
              className="inline-flex items-center justify-center rounded-sm bg-amber text-ink font-body font-semibold px-7 py-3.5 hover:brightness-95 transition"
            >
              Find a mentor
            </Link>
            <Link
              href="/mentor"
              className="inline-flex items-center justify-center rounded-sm border border-chalk/30 text-chalk font-body font-medium px-7 py-3.5 hover:bg-chalk/10 transition"
            >
              Offer to mentor someone
            </Link>
          </div>

          <Link
            href="/mentors"
            className="inline-block mt-6 font-mono text-xs uppercase tracking-[0.15em] text-sage hover:text-chalk underline underline-offset-4"
          >
            Or browse mentors directly →
          </Link>
        </div>
      </section>

      {/* ABOUT — what the name means */}
      <section className="border-b border-ink/10">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-board/60 mb-3">
            About the name
          </p>
          <p className="font-display italic text-2xl sm:text-3xl max-w-2xl leading-snug">
            &ldquo;Agla kadam&rdquo; is Hindi for &ldquo;next step.&rdquo; That&rsquo;s all this is.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS — three note cards, not numbered steps for their own sake:
          this genuinely is a sequence, so ordering earns its keep here */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-board/60 mb-3">
          How it works
        </p>
        <h2 className="font-display text-2xl sm:text-3xl mb-12 max-w-lg">
          Three steps, one honest call.
        </h2>

        <div className="grid sm:grid-cols-3 gap-6">
          <NoteCard
            eyebrow="Step one"
            title="Tell us where you’re stuck"
            body="A short form. Your background, what’s confusing you, what you’re hoping to figure out."
          />
          <NoteCard
            eyebrow="Step two"
            title="Get matched"
            body="You’re matched with the mentor best suited to where you want to go, based on what you shared."
          />
          <NoteCard
            eyebrow="Step three"
            title="Book the call"
            body="You get an email with a mentor's name and a booking link. Pick a slot. Show up. Thirty minutes, no strings."
          />
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="bg-board text-chalk">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <h3 className="font-display italic text-2xl sm:text-3xl max-w-md">
            Know something worth passing on? Someone’s looking for exactly that.
          </h3>
          <Link
            href="/mentor"
            className="inline-flex items-center justify-center rounded-sm bg-amber text-ink font-body font-semibold px-7 py-3.5 hover:brightness-95 transition whitespace-nowrap"
          >
            Sign up as a mentor
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-8">
        <p className="font-mono text-xs text-ink/40">
          AglaKadam — built in the open.{" "}
          <a
            href="https://github.com/"
            className="underline hover:text-ink/70"
          >
            View the source
          </a>
        </p>
      </footer>
    </main>
  );
}

function NoteCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white rounded-sm border border-ink/10 p-6 pin-shadow">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-amber mb-3">
        {eyebrow}
      </p>
      <h3 className="font-display text-xl mb-2">{title}</h3>
      <p className="font-body text-sm text-ink/70 leading-relaxed">{body}</p>
    </div>
  );
}

