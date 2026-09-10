"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AuthButton from "@/components/AuthButton";

const links = [
  { label: "Browse mentors", href: "/mentors" },
  { label: "Find a mentor", href: "/find-mentor" },
  { label: "Articles", href: "/articles" },
  { label: "AI mentor", href: "/ai-mentor" },
  { label: "Become a mentor", href: "/mentor" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
        <Link href="/" className="font-display text-xl tracking-tight" aria-label="AglaKadam home">AglaKadam</Link>

        <nav className="hidden items-center gap-7 font-body text-sm text-ink/65 md:flex" aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href} className="transition hover:text-ink">{link.label}</Link>)}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block"><AuthButton /></div>
          <Link href="/find-mentor" className="inline-flex items-center justify-center rounded-sm bg-amber px-4 py-2.5 font-body text-sm font-semibold transition hover:brightness-95 sm:px-5">Get started</Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-ink/10 bg-white text-ink transition hover:bg-paper focus:outline-none focus:ring-2 focus:ring-board/40 md:hidden"
            aria-expanded={open}
            aria-label="Toggle menu"
            aria-controls="mobile-site-navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-site-navigation" className="border-t border-ink/10 bg-paper md:hidden">
          <nav className="mx-auto max-w-7xl px-5 py-4 sm:px-6" aria-label="Mobile navigation">
            <div className="grid gap-1">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-sm px-3 py-3 font-body text-sm font-medium text-ink/75 transition hover:bg-white hover:text-ink focus:outline-none focus:ring-2 focus:ring-board/40">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-3 border-t border-ink/10 pt-3">
              <AuthButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
