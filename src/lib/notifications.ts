import { SupabaseClient } from "@supabase/supabase-js";
import { Notification } from "@/types/database";

export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  type: Notification["type"],
  title: string,
  body: string,
  link?: string
): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    link: link ?? null,
  });

  if (error) {
    console.error("Failed to create notification:", error.message);
  }
}
