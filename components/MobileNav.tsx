"use client";

import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import AuthButton from "@/components/AuthButton";

const LINKS = [
  { label: "Browse mentors", href: "/mentors" },
  { label: "Find a mentor", href: "/find-mentor" },
  { label: "AI mentor", href: "/ai-mentor/arjun-mehta" },
  { label: "Become a mentor", href: "/mentor" },
  { label: "Articles & guides", href: "/articles" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-ink/15 bg-white text-ink transition hover:bg-paper"
      >
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>

      {open && (
        <>
          <button aria-label="Close menu overlay" className="fixed inset-0 top-16 z-30 cursor-default bg-ink/10 backdrop-blur-[1px]" onClick={close} />
          <div className="absolute left-0 right-0 top-16 z-40 border-b border-ink/10 bg-paper shadow-xl">
            <nav className="mx-auto max-w-7xl px-5 py-4 sm:px-6" aria-label="Mobile navigation">
              <div className="grid gap-1">
                {LINKS.map((link) => (
                  <Link key={link.href} href={link.href} onClick={close} className="flex items-center justify-between rounded-sm px-3 py-3.5 font-body text-sm font-medium text-ink transition hover:bg-white">
                    {link.label}
                    <ArrowRight size={15} className="text-ink/30" />
                  </Link>
                ))}
              </div>
              <div className="my-3 border-t border-ink/10" />
              <div className="flex flex-wrap items-center gap-2 px-3 pb-1">
                <AuthButton />
                <Link href="/find-mentor" onClick={close} className="inline-flex items-center justify-center rounded-sm bg-amber px-4 py-2.5 text-sm font-semibold">
                  Get started
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
