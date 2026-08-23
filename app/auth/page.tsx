"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = mode === "email"
      ? await supabase.auth.signInWithOtp({
          email: value,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
      : await supabase.auth.signInWithOtp({ phone: value });

    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    setSent(true);
    setMessage(`A verification code has been sent to your ${mode}.`);
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const result = mode === "email"
      ? await supabase.auth.verifyOtp({ email: value, token: otp, type: "email" })
      : await supabase.auth.verifyOtp({ phone: value, token: otp, type: "sms" });

    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    window.location.replace("/");
  }

  async function google() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md bg-white border border-ink/10 shadow-sm p-7 sm:p-10">
        <Link href="/" className="font-mono text-xs uppercase tracking-[0.15em] text-board/60 hover:text-board">
          ← Back to AglaKadam
        </Link>

        <h1 className="font-display text-3xl mt-6">Welcome back.</h1>
        <p className="text-ink/65 mt-2 mb-7">
          Sign in with Google, email OTP, or a phone verification code.
        </p>

        {!sent ? (
          <>
            <button
              type="button"
              onClick={google}
              disabled={loading}
              className="w-full border border-ink/20 py-3 font-semibold hover:bg-paper disabled:opacity-60"
            >
              {loading ? "Connecting to Google…" : "Continue with Google"}
            </button>

            <div className="flex gap-2 mt-6 mb-4 text-sm">
              <button type="button" onClick={() => { setMode("email"); setMessage(""); }} className={`flex-1 py-2 border ${mode === "email" ? "border-amber bg-paper" : "border-ink/15"}`}>
                Email OTP
              </button>
              <button type="button" onClick={() => { setMode("phone"); setMessage(""); }} className={`flex-1 py-2 border ${mode === "phone" ? "border-amber bg-paper" : "border-ink/15"}`}>
                Phone OTP
              </button>
            </div>

            <form onSubmit={sendCode} className="space-y-4">
              <input required type={mode === "email" ? "email" : "tel"} value={value} onChange={(e) => setValue(e.target.value)} className="input" placeholder={mode === "email" ? "you@example.com" : "+919876543210"} />
              <button disabled={loading} className="w-full bg-amber py-3 font-semibold disabled:opacity-60">
                {loading ? "Sending…" : "Send verification code"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={verifyCode} className="space-y-4">
            <input required inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value)} className="input" placeholder="Enter verification code" />
            <button disabled={loading} className="w-full bg-amber py-3 font-semibold disabled:opacity-60">
              {loading ? "Verifying…" : "Verify and sign in"}
            </button>
            <button type="button" onClick={() => { setSent(false); setOtp(""); }} className="w-full text-sm underline">
              Use a different method
            </button>
          </form>
        )}

        {message && <p className="mt-5 text-sm text-ink/70">{message}</p>}
      </div>
    </main>
  );
}
