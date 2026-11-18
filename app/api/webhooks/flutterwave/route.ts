import { NextResponse } from "next/server";
import { verifyFlwHash } from "@/lib/flutterwave";
import { grantPremium } from "@/lib/premium";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Flutterwave webhook — MUST read the raw body. Authenticity: the verif-hash
 * header equals the secret hash configured in Dashboard → Settings → Webhooks
 * (constant-time compare). Handles charge.completed for card AND bank
 * transfer — transfers have no browser callback, so this is their primary
 * premium flip path. Endpoint to paste in the dashboard:
 *   https://<domain>/api/webhooks/flutterwave
 */
export async function POST(req: Request) {
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretHash) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const raw = await req.text();
  if (!verifyFlwHash(req.headers.get("verif-hash"), secretHash)) {
    return NextResponse.json({ error: "bad_signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: {
      tx_ref?: string;
      status?: string;
      amount?: number;
      currency?: string;
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  if (event.event !== "charge.completed" || event.data?.status !== "successful") {
    return NextResponse.json({ handled: false });
  }

  const reference = event.data.tx_ref ?? "";
  if (!reference.startsWith("pgflw-")) return NextResponse.json({ handled: false });
  if (event.data.currency !== "NGN" || Number(event.data.amount) < 750) {
    return NextResponse.json({ handled: false });
  }

  // The payments row owns user_id — minted server-side, never client-supplied.
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("payments")
    .select("user_id")
    .eq("reference", reference)
    .maybeSingle();
  if (!row) return NextResponse.json({ handled: false });

  await admin
    .from("payments")
    .update({ status: "success", paid_at: new Date().toISOString() })
    .eq("reference", reference);

  const until = await grantPremium(row.user_id, 6);
  return NextResponse.json({ handled: true, until });
}
