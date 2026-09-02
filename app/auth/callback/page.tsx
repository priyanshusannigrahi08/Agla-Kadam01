"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage(){
 const [errorMessage,setErrorMessage]=useState("");
 useEffect(()=>{let cancelled=false;async function finish(){const url=new URL(window.location.href);const requested=url.searchParams.get("next")||"/dashboard";const next=requested.startsWith("/")&&!requested.startsWith("//")?requested:"/dashboard";const code=url.searchParams.get("code");if(code){const {error}=await supabase.auth.exchangeCodeForSession(code);if(error){if(!cancelled)setErrorMessage(error.message);return}}const {data:{user},error}=await supabase.auth.getUser();if(error||!user){if(!cancelled)setErrorMessage(error?.message||"No authentication session was returned. Please try signing in again.");return}
 const [{ data: mentorProfile, error: mentorError }, { data: menteeProfile, error: menteeError }] = await Promise.all([
   supabase.from("mentors").select("id").eq("user_id", user.id).maybeSingle(),
   supabase.from("mentees").select("id").eq("user_id", user.id).maybeSingle(),
 ]);
 if(mentorError||menteeError){if(!cancelled)setErrorMessage("We couldn't finish setting up your account. Please try signing in again.");return}
 if(!mentorProfile&&!menteeProfile){window.location.replace("/onboarding");return}
 window.location.replace(next);
 }finish();return()=>{cancelled=true}},[]);
 return <main className="min-h-screen bg-paper text-ink flex items-center justify-center px-6 py-16"><div className="w-full max-w-md bg-white border border-ink/10 shadow-sm p-7 sm:p-10 text-center">{errorMessage?<><h1 className="font-display text-3xl">Sign in failed</h1><p className="mt-4 text-sm text-ink/70">{errorMessage}</p><Link href="/auth" className="inline-flex mt-6 bg-amber px-5 py-3 font-semibold">Try again</Link></>:<><h1 className="font-display text-3xl">Signing you in…</h1><p className="mt-4 text-sm text-ink/70">Please wait while we securely complete your sign-in.</p></>}</div></main>;
}
