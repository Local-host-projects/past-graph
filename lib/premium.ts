import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Flip premium for a user, extending from the later of
 * (a) now, or (b) an existing premium_until — so gift/renewal stacking is fair.
 * Returns the new premium_until in ISO, or null on failure.
 */
export async function grantPremium(userId: string, months = 6): Promise<string | null> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("premium_until")
    .eq("id", userId)
    .single();

  const base =
    profile?.premium_until && new Date(profile.premium_until) > new Date()
      ? new Date(profile.premium_until)
      : new Date();
  base.setMonth(base.getMonth() + months);
  const until = base.toISOString();

  const { error } = await admin
    .from("profiles")
    .update({ is_premium: true, premium_until: until })
    .eq("id", userId);

  if (error) return null;
  return until;
}
