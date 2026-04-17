export function validatePhoto(file: File): string | null {
  const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024;
  if (!ALLOWED.includes(file.type)) return "Upload JPG, PNG, or WebP only";
  if (file.size > MAX_SIZE) return "Photo must be under 5MB";
  return null;
}
