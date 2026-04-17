import { SupabaseClient } from "@supabase/supabase-js";

export async function getAuthenticatedUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

export async function getMembershipStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("membership")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data.status as string;
}

export async function getOnboardingStep(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_step")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return 0;
  return data.onboarding_step ?? 0;
}

export async function requireAuth(supabase: SupabaseClient) {
  const user = await getAuthenticatedUser(supabase);
  if (!user) throw new Error("Unauthenticated");
  return user;
}
