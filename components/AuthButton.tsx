"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="inline-flex items-center justify-center rounded-sm border border-ink/20 bg-white text-ink font-body font-medium text-sm px-4 py-2.5">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/auth"
        className="inline-flex items-center justify-center rounded-sm border border-ink/20 bg-white text-ink font-body font-medium text-sm px-4 py-2.5 hover:bg-paper transition"
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
    <Link
      href="/auth"
      className="inline-flex items-center justify-center rounded-sm border border-ink/20 bg-white text-ink font-body font-medium text-sm px-4 py-2.5 hover:bg-paper transition"
      title={user.email ?? undefined}
    >
      {name}
    </Link>
  );
}
