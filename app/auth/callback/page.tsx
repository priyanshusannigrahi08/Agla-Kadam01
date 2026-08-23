"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          if (!cancelled) setErrorMessage(error.message);
          return;
        }
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        if (!cancelled) {
          setErrorMessage(
            error?.message || "No authentication session was returned. Please try signing in again."
          );
        }
        return;
      }

      const role = user.user_metadata?.role;

      if (role === "mentor") {
        window.location.replace("/mentor");
        return;
      }

      if (role === "mentee") {
        window.location.replace("/mentee");
        return;
      }

      window.location.replace("/onboarding");
    }

    finish();

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
