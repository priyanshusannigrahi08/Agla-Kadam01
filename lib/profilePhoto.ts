import { supabase } from "@/lib/supabaseClient";

export async function uploadProfilePhoto(file: File, folder: "mentors" | "mentees") {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be smaller than 5 MB.");

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("profile-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;

  return supabase.storage.from("profile-photos").getPublicUrl(path).data.publicUrl;
}
