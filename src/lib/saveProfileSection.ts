import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/types/database";

export async function saveProfileSection(
  userId: string,
  columnOrData: string | Partial<Omit<Profile, "id" | "user_id" | "created_at" | "updated_at">>,
  sectionPayload?: Record<string, unknown>
): Promise<Profile> {
  let data: Record<string, unknown>;

  if (typeof columnOrData === "string" && sectionPayload !== undefined) {
    data = { [columnOrData]: sectionPayload };
  } else if (typeof columnOrData === "object") {
    data = columnOrData as Record<string, unknown>;
  } else {
    throw new Error("Invalid arguments passed to saveProfileSection");
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .upsert({ user_id: userId, ...data }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save profile: ${error.message} (code: ${error.code})`);
  }

  return updated as Profile;
}
