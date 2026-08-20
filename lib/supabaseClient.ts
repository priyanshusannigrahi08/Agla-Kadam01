import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fails loudly in development instead of silently returning a broken client.
  console.warn(
    "Missing Supabase env vars. Copy .env.example to .env.local and fill in your project's URL and anon key."
  );
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
