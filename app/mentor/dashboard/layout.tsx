import Link from "next/link";
import { BookOpen, LayoutDashboard } from "lucide-react";

export default function MentorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/mentor/dashboard" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-board/70 hover:text-board">
            <LayoutDashboard size={14} /> Mentor workspace
          </Link>
          <Link href="/mentor/dashboard/guide" className="inline-flex items-center gap-2 rounded-sm border border-ink/15 px-3 py-2 text-xs font-semibold hover:bg-paper">
            <BookOpen size={14} /> Conversation guide
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
