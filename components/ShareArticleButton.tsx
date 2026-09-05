"use client";

import { Share2 } from "lucide-react";

export default function ShareArticleButton({ title }: { title: string }) {
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled the share sheet.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  }

  return (
    <button type="button" onClick={share} className="inline-flex items-center justify-center rounded-sm border border-ink/10 bg-white px-3 py-2.5 text-xs font-semibold" aria-label="Share article">
      <Share2 size={14} />
    </button>
  );
}
