import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-chalk/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-6 sm:grid-cols-4">
        <div>
          <p className="mb-3 font-display text-lg text-chalk">AglaKadam</p>
          <p className="max-w-xs font-body text-sm leading-relaxed">“Agla kadam” means “next step”. A place to find useful perspective when you’re between chapters.</p>
        </div>
        <FooterColumn title="For mentees" links={[
          { label: "Find a mentor", href: "/find-mentor" },
          { label: "Browse mentors", href: "/mentors" },
          { label: "AI mentor", href: "/ai-mentor" },
          { label: "Articles", href: "/articles" },
          { label: "Dashboard", href: "/dashboard" },
        ]} />
        <FooterColumn title="For mentors" links={[
          { label: "Become a mentor", href: "/mentor" },
          { label: "Dashboard", href: "/dashboard" },
        ]} />
        <FooterColumn title="More" links={[
          { label: "Sign in", href: "/auth" },
          { label: "View the source", href: "https://github.com/priyanshusannigrahi08/Agla-Kadam01" },
        ]} />
      </div>
      <div className="border-t border-chalk/10"><p className="mx-auto max-w-7xl px-5 py-6 font-mono text-xs text-chalk/40 sm:px-6">AglaKadam — built in the open.</p></div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return <div><p className="mb-4 font-mono text-xs uppercase tracking-[0.15em] text-chalk/40">{title}</p><ul className="space-y-2">{links.map((link) => <li key={link.href}><Link href={link.href} className="font-body text-sm hover:text-chalk">{link.label}</Link></li>)}</ul></div>;
}
