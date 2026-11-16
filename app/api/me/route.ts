/**
 * /api/me — who's asking, as the server sees it.
 *
 * The session lives in httpOnly cookies the browser JS client can't read,
 * so every page that needs to know "is this person premium?" asks here
 * instead of the browser supabase client.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) return NextResponse.json({ signedIn: false, premium: false });
  const { data: p } = await sb.from("profiles").select("is_premium").eq("id", auth.user.id).maybeSingle();
  return NextResponse.json({ signedIn: true, userId: auth.user.id, premium: Boolean(p?.is_premium) });
}
