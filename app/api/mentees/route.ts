import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const situation = String(body.situation ?? "").trim();
    const background = String(body.background ?? "").trim();
    const goal = String(body.goal ?? "").trim();
    const challenge = String(body.challenge ?? "").trim();

    if (!name || !email || !situation || !background || !goal || !challenge) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const stuckOn = [
      body.helpArea ? `Help needed: ${String(body.helpArea)}` : "",
      `Goal: ${goal}`,
      `Challenge: ${challenge}`,
      body.phone ? `Phone: ${String(body.phone)}` : "",
    ].filter(Boolean).join("\n\n");

    const { error } = await supabase.from("mentees").insert({
      name,
      email,
      situation,
      background,
      stuck_on: stuckOn,
    });

    if (error) {
      console.error("Mentee submission error:", error);
      return NextResponse.json({ error: "Unable to save your request." }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Mentee API error:", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
