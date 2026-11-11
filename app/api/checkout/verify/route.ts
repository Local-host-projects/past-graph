import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { grantPremium } from "@/lib/premium";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Verifies a Paystack reference (never trusts the client) and flips premium.
 * Called after inline-checkout success or bank-transfer completion.
 */
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json()) as { reference?: string };
  const reference = (body.reference ?? "").trim();
  if (!/^[-_\w.]{8,64}$/.test(reference) || reference.startsWith("claim_")) {
    return NextResponse.json({ error: "bad_reference" }, { status: 400 });
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(20_000),
  });

  const data = (await res.json()) as {
    status?: boolean;
    data?: { status?: string; amount?: number; metadata?: Record<string, unknown>; customer?: { email?: string } };
  };

  if (!res.ok || !data.status || !data.data) {
    return NextResponse.json({ error: "paystack_error" }, { status: 502 });
  }

  const trx = data.data;
  if (trx.status !== "success") {
    return NextResponse.json({ paid: false, status: trx.status ?? "unknown" });
  }

  // Ownership check: the transaction must belong to the signed-in user.
  const trxUserId =
    (trx.metadata as { user_id?: string } | undefined)?.user_id ??
    (typeof trx.metadata === "string" ? safeParse(trx.metadata)?.user_id : undefined);
  if (trxUserId && trxUserId !== auth.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Idempotent success bookkeeping.
  const admin = createAdminClient();
  await admin
    .from("payments")
    .update({ status: "success", paid_at: new Date().toISOString() })
    .eq("reference", reference);

  const until = await grantPremium(auth.user.id, 6);
  if (!until) return NextResponse.json({ error: "grant_failed" }, { status: 502 });

  return NextResponse.json({ paid: true, premium_until: until });
}

/** HMAC check the webhook uses; lives in lib/paystack.ts. */

function safeParse(s: string): Record<string, unknown> | undefined {
  try {
    return JSON.parse(s) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}
