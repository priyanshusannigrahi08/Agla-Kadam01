import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!token) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const { data: goals, error } = await (admin.from("career_goals") as any)
      .select("id,goal_text,completed,created_at,completed_at")
      .eq("user_id", userData.user.id)
      .order("completed", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      console.error("Career context goals error", { message: error.message });
      return NextResponse.json({ goals: [] });
    }

    return NextResponse.json({
      goals: (goals || []).map((goal: any) => ({
        id: goal.id,
        text: goal.goal_text,
        completed: Boolean(goal.completed),
        createdAt: goal.created_at,
        completedAt: goal.completed_at,
      })),
    });
  } catch (error) {
    console.error("Career context route error", error);
    return NextResponse.json({ error: "Unable to load career context." }, { status: 500 });
  }
}
