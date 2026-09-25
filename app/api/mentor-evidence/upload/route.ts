import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 256 * 1024;
const DOCUMENT_TYPES = new Set(["resume", "certification"]);

function detectedMimeType(bytes: Uint8Array) {
  if (bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) return "application/pdf";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  return null;
}

function safeFileName(name: string, mimeType: string) {
  const extension = mimeType === "application/pdf" ? "pdf" : mimeType.split("/")[1];
  const stem = name.replace(/\.[^.]*$/, "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "evidence";
  return `${stem}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (!Number.isFinite(contentLength) || contentLength > MAX_REQUEST_BYTES) return NextResponse.json({ error: "File is too large. Files must be 8 MB or smaller." }, { status: 413 });

    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
    if (!token) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

    const admin = getSupabaseAdmin() as any;
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    const user = authData.user;
    if (authError || !user) return NextResponse.json({ error: "Your session is no longer valid." }, { status: 401 });

    const formData = await request.formData();
    const mentorId = String(formData.get("mentorId") || "");
    const documentType = String(formData.get("documentType") || "");
    const file = formData.get("file");
    if (!mentorId || !DOCUMENT_TYPES.has(documentType) || !(file instanceof File)) return NextResponse.json({ error: "A mentor profile and supported document are required." }, { status: 400 });
    if (file.size <= 0 || file.size > MAX_FILE_BYTES) return NextResponse.json({ error: "File is too large. Files must be 8 MB or smaller." }, { status: 413 });

    const { data: mentor, error: mentorError } = await admin.from("mentors").select("id").eq("id", mentorId).eq("user_id", user.id).maybeSingle();
    if (mentorError || !mentor) return NextResponse.json({ error: "Mentor profile not found." }, { status: 404 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const mimeType = detectedMimeType(bytes);
    if (!mimeType) return NextResponse.json({ error: "Use a valid PDF, JPG, PNG, or WebP file." }, { status: 400 });

    const fileName = safeFileName(file.name, mimeType);
    const storagePath = `${user.id}/${randomUUID()}-${fileName}`;
    const { error: uploadError } = await admin.storage.from("mentor-evidence").upload(storagePath, bytes, { contentType: mimeType, upsert: false });
    if (uploadError) {
      console.error("Mentor evidence upload failed", { message: uploadError.message });
      return NextResponse.json({ error: "The file could not be uploaded." }, { status: 500 });
    }

    const { data: document, error: insertError } = await admin
      .from("mentor_documents")
      .insert({ mentor_id: mentor.id, user_id: user.id, document_type: documentType, file_name: fileName, storage_path: storagePath, mime_type: mimeType, file_size: bytes.byteLength })
      .select("id,document_type,file_name,file_size,created_at")
      .single();
    if (insertError) {
      await admin.storage.from("mentor-evidence").remove([storagePath]);
      console.error("Mentor evidence record failed", { message: insertError.message });
      return NextResponse.json({ error: "The document record could not be saved." }, { status: 500 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Mentor evidence upload route error", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "The file could not be uploaded. Please try again." }, { status: 500 });
  }
}
