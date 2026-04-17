import { supabase } from "@/lib/supabaseClient";
import { Profile } from "@/types/database";

export async function saveProfileSection(
  userId: string,
  data: Partial<Omit<Profile, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<Profile> {
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
