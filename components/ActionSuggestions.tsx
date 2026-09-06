"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";

const SUGGESTIONS = [
  "Write down the decision I need to make and the 2–3 options I’m considering",
  "Message one person who works in this field and ask for a short perspective",
  "Spend 30 minutes exploring one role, course, or career path I discussed",
  "Update one part of my CV, portfolio, or LinkedIn based on what I learned",
  "Try one small experiment this week before making a bigger decision",
  "Schedule a follow-up conversation with someone who can help me go one step further",
];

type Props = {
  onSelect: (text: string) => void;
  disabled?: boolean;
};

export default function ActionSuggestions({ onSelect, disabled }: Props) {
  return (
    <section className="mt-6 rounded-sm border border-board/15 bg-board/[0.035] p-6">
      <div className="flex items-start gap-3">
        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-board" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-board/70">ACTION STARTERS</p>
          <h3 className="mt-2 font-display text-xl">Not sure what to write?</h3>
          <p className="mt-2 text-sm leading-6 text-ink/55">Pick a starting point. You can edit it before adding it to your plan.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(suggestion)}
            className="group flex items-start justify-between gap-3 rounded-sm border border-ink/10 bg-white p-4 text-left text-sm leading-5 text-ink/70 transition hover:border-board/25 hover:text-ink disabled:opacity-50"
          >
            <span>{suggestion}</span>
            <ArrowRight size={14} className="mt-0.5 shrink-0 text-board opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </section>
  );
}
