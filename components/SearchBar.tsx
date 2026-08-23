"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/mentors?q=${encodeURIComponent(q)}` : "/mentors");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto flex items-center bg-chalk rounded-sm overflow-hidden pin-shadow"
    >
      <Search size={18} className="ml-4 text-ink/40 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search e.g. “product management” or “career switch”"
        className="flex-1 bg-transparent text-ink px-3 py-3.5 font-body text-sm placeholder:text-ink/40 focus:outline-none"
        aria-label="Search mentors"
      />
      <button
        type="submit"
        className="bg-amber text-ink font-body font-semibold text-sm px-6 py-3.5 hover:brightness-95 transition"
      >
        Search
      </button>
    </form>
  );
}
