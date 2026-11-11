import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieStore = {
  getAll: () => { name: string; value: string }[];
  set: (name: string, value: string, options?: CookieOptions) => void;
  setAll: (cookies: { name: string; value: string; options?: CookieOptions }[]) => void;
};

/**
 * Server client bound to Next.js cookies.
 * Callers may await this and pass their own cookie store (route handlers),
 * or call it with no argument (server components).
 */
export async function createClient(passed?: CookieStore) {
  const cookieStore = passed ?? await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — can be ignored when middleware
            // refreshes sessions.
          }
        },
      },
    }
  );
}
