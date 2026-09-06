"use client";

import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";

export default function JourneyLauncher() {
  return <div className="fixed bottom-4 right-4 z-40 hidden gap-2 sm:flex"><Link href="/journey" className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2.5 text-xs font-semibold text-ink shadow-lg hover:bg-paper"><Compass size={14} className="text-board"/> My journey</Link><Link href="/career-navigator" className="inline-flex items-center gap-2 rounded-full bg-amber px-4 py-2.5 text-xs font-semibold text-ink shadow-lg hover:brightness-95"><Sparkles size={14}/> Career Navigator</Link></div>;
}
