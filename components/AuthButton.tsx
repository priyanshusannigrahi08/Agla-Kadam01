"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (active) {
        setUser(data.user ?? null);
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();

    if (error) {
      setSigningOut(false);
      return;
    }

    setUser(null);
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="inline-flex items-center justify-center rounded-sm border border-ink/20 bg-white px-4 py-2.5 text-sm font-medium">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        className="inline-flex items-center justify-center rounded-sm border border-ink/20 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-paper"
      >
        Sign in
      </Link>
    );
  }

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Account";

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        className="inline-flex max-w-[160px] items-center justify-center truncate rounded-sm border border-ink/20 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-paper"
        title={user.email ?? undefined}
      >
        {name}
      </Link>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="inline-flex items-center justify-center rounded-sm border border-ink/20 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
      >
        {signingOut ? "Signing out..." : "Log out"}
      </button>
    </div>
  );
}
