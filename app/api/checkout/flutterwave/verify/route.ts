import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { grantPremium } from "@/lib/premium";
import { createAdminClient } from "@/utils/supabase/admin";
import { flutterwave } from "@/lib/flutterwave";

/**
 * Verifies a Flutterwave tx_ref (never trusts the client) and flips premium.
 * Ownership comes from OUR payments row — the tx_ref was minted server-side at
 * checkout, so whoever owns the row owns the payment. Then verify_by_reference
 * confirms status/amount/currency with Flutterwave itself.
 */
export async function POST(req: Request) {
  if (!process.env.FLW_SECRET_KEY) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json()) as { reference?: string };
  const reference = (body.reference ?? "").trim();
  if (!/^pgflw-[\w-]{10,80}$/.test(reference)) {
    return NextResponse.json({ error: "bad_reference" }, { status: 400 });
  }

  // Ownership: the row we seeded at checkout time decides.
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("payments")
    .select("user_id")
    .eq("reference", reference)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: "bad_reference" }, { status: 400 });
  if (row.user_id !== auth.user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { ok, data } = await flutterwave<{
    data?: {
      tx_ref?: string;
      status?: string;
      amount?: number;
      currency?: string;
    };
  }>(`/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`);

  if (!ok || !data.data) {
    return NextResponse.json({ error: "flutterwave_error" }, { status: 502 });
  }

  const trx = data.data;
  if (trx.status !== "successful") {
    return NextResponse.json({ paid: false, status: trx.status ?? "unknown" });
  }
  if (trx.currency !== "NGN" || typeof trx.amount !== "number" || trx.amount < 750) {
    return NextResponse.json({ error: "amount_mismatch" }, { status: 400 });
  }

  // Idempotent success bookkeeping.
  await admin
    .from("payments")
    .update({ status: "success", paid_at: new Date().toISOString() })
    .eq("reference", reference);

  const until = await grantPremium(auth.user.id, 6);
  if (!until) return NextResponse.json({ error: "grant_failed" }, { status: 502 });

  return NextResponse.json({ paid: true, premium_until: until });
}
