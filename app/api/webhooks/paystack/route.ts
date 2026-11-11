import { NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";
import { grantPremium } from "@/lib/premium";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Paystack webhook — MUST read the raw body (req.text()) for signature validity.
 * Handles charge.success for card AND bank-transfer channels (transfers have no
 * browser callback — this webhook is their primary premium flip path).
 * Configure the endpoint in Paystack Dashboard → Settings → Webhooks.
 */
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyPaystackSignature(raw, signature, secret)) {
    return NextResponse.json({ error: "bad_signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      metadata?: { user_id?: string } | string;
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  if (event.event !== "charge.success" || event.data?.status !== "success") {
    return NextResponse.json({ handled: false });
  }

  const reference = event.data.reference ?? "";
  const meta = event.data.metadata;
  const userId = typeof meta === "object" ? meta?.user_id : undefined;
  if (!reference || !userId) return NextResponse.json({ handled: false });

  const admin = createAdminClient();
  await admin
    .from("payments")
    .update({ status: "success", paid_at: new Date().toISOString() })
    .eq("reference", reference);

  const until = await grantPremium(userId, 6);
  return NextResponse.json({ handled: true, until });
}
