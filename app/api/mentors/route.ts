import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("mentors_public")
      .select("id, name, expertise, availability, linkedin_url, calendly_url")
      .order("name", { ascending: true });

    if (error) {
      console.error("Mentor loading error:", error);
      return NextResponse.json({ mentors: [] }, { status: 500 });
    }

    const mentors = (data ?? []).map((mentor) => ({
      id: mentor.id,
      name: mentor.name,
      headline: mentor.availability,
      company: null,
      role: null,
      experience: null,
      expertise: mentor.expertise,
      bio: null,
      linkedin: mentor.linkedin_url,
      calendly: mentor.calendly_url,
    }));

    return NextResponse.json({ mentors });
  } catch (error) {
    console.error("Mentor API error:", error);
    return NextResponse.json({ mentors: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const linkedinUrl = String(body.linkedinUrl ?? body.linkedin ?? "").trim();
    const expertise = String(body.expertise ?? "").trim();
    const availability = String(body.availability ?? "").trim();
    const calendlyUrl = String(body.calendlyUrl ?? body.calendly ?? "").trim();

    if (!name || !email || !linkedinUrl || !expertise || !availability || !calendlyUrl) {
      return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    }

    const { error } = await supabase.from("mentors").insert({
      name,
      email,
      linkedin_url: linkedinUrl,
      expertise,
      availability,
      calendly_url: calendlyUrl,
    });

    if (error) {
      console.error("Mentor submission error:", error);
      return NextResponse.json({ error: "Unable to save your application." }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Mentor API error:", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
