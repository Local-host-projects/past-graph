import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client for privileged flips (payments, claims).
 * Only import from server code (API routes / webhooks) — never client components.
 * SUPABASE_SERVICE_ROLE_KEY bypasses RLS by design; keep it out of NEXT_PUBLIC_*.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw Object.assign(new Error("SUPABASE_SERVICE_ROLE_KEY is not configured"), { code: "no_admin_key" });
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}
