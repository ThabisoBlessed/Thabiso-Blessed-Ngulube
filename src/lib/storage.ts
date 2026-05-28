import { supabase } from "./supabase";

const BUCKET = "portfolio-files";

export type UploadType = "cv" | "cover-letter" | "certificate" | "image" | "video" | "avatar";

function sanitizeFilename(name: string): string {
  // Remove special chars, collapse spaces, prevent double extensions
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

export async function uploadFile(
  file: File,
  type: UploadType,
): Promise<{ url: string; path: string } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const maxSizes: Record<UploadType, number> = {
    cv: 10, "cover-letter": 10, certificate: 10,
    image: 5, video: 50, avatar: 2,
  };

  if (file.size > maxSizes[type] * 1024 * 1024) {
    throw new Error(`File too large. Max ${maxSizes[type]}MB.`);
  }

  const ext      = file.name.split(".").pop() || "";
  const base     = file.name.replace(`.${ext}`, "");
  const filename = `${sanitizeFilename(base)}.${ext}`;
  const path     = `${user.id}/${type}/${Date.now()}-${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: true });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: publicUrl, path };
}

export async function deleteFile(path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return !error;
}
