"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function completeSignIn() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const next = url.searchParams.get("next") || "/";

      // PKCE flow: Supabase returns an authorization code in the query string.
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          if (!cancelled) setErrorMessage(error.message);
          return;
        }

        window.location.replace(next.startsWith("/") ? next : "/");
        return;
      }

      // Implicit/hash flow: the Supabase client may already have consumed the
      // tokens from the URL hash before this component runs.
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        if (!cancelled) setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        window.location.replace(next.startsWith("/") ? next : "/");
        return;
      }

      if (!cancelled) {
        setErrorMessage(
          "No authentication session was returned. Please try signing in again."
        );
      }
    }

    completeSignIn();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white border border-ink/10 shadow-sm p-7 sm:p-10 text-center">
        {errorMessage ? (
          <>
            <h1 className="font-display text-3xl">Sign in failed</h1>
            <p className="mt-4 text-sm text-ink/70">{errorMessage}</p>
            <Link
              href="/auth"
              className="inline-flex mt-6 bg-amber px-5 py-3 font-semibold"
            >
              Try again
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl">Signing you in…</h1>
            <p className="mt-4 text-sm text-ink/70">
              Please wait while we securely complete your sign-in.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
