import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { rateLimit, clientIp } from "@/lib/ai";

/**
 * Manual bank-transfer claim path for when dedicated virtual accounts aren't
 * enabled on the Paystack business: the user pays ₦750 into the app's account,
 * keeps the receipt reference, and submits it here for review.
 * Approval happens in the Supabase dashboard (service role) then grantPremium runs.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  if (!rateLimit(`claim:${auth.user.id}`, 3, 10 * 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as
    | { reference?: string; payer_name?: string; bank?: string; amount?: number }
    | null;

  const reference = (body?.reference ?? "").trim();
  const payerName = (body?.payer_name ?? "").trim();
  const bank = (body?.bank ?? "").trim();
  const amount = Math.round(Number(body?.amount ?? 750));

  // Business rules: a sane reference format, the exact price, bounded text.
  if (!/^[-_\w#/.+ ]{6,64}$/i.test(reference)) {
    return NextResponse.json({ error: "bad_reference" }, { status: 400 });
  }
  if (payerName.length < 3 || payerName.length > 60) {
    return NextResponse.json({ error: "bad_name" }, { status: 400 });
  }
  if (amount !== 750) {
    return NextResponse.json({ error: "bad_amount" }, { status: 400 });
  }

  const ip = clientIp(req);
  const { error } = await supabase.from("transfer_claims").insert({
    user_id: auth.user.id,
    reference,
    payer_name: payerName,
    bank: bank.slice(0, 40) || null,
    amount,
    status: "pending",
    claimed_ip: ip,
  });

  if (error) {
    const dup = error.code === "23505"; // unique reference already claimed
    return NextResponse.json({ error: dup ? "reference_already_claimed" : "db_error" }, { status: dup ? 409 : 500 });
  }

  return NextResponse.json({ submitted: true, note: "Claims are reviewed within 24 hours." });
}
