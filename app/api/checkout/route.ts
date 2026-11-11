import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Creates a Paystack transaction for ₦750 premium.
 * Channels: card + bank transfer. The bank-transfer channel is what shows the
 * customer a real account number to pay into (test mode supports it).
 */
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user?.email) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { method?: "card" | "transfer" };
    const wantsTransfer = body.method === "transfer";

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: auth.user.email,
        amount: 75_000, // kobo → ₦750
        channels: wantsTransfer ? ["bank_transfer"] : ["card", "bank_transfer"],
        metadata: { user_id: auth.user.id, product: "past-graph-premium-6mo" },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin}/pricing/success`,
      }),
      signal: AbortSignal.timeout(20_000),
    });

    const data = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: { reference: string; access_code: string; authorization_url: string };
    };

    if (!res.ok || !data.status || !data.data?.access_code) {
      return NextResponse.json({ error: "paystack_error", detail: data.message ?? null }, { status: 502 });
    }

    // Seed the pending payment row (server-side ownership, not client-supplied).
    const admin = createAdminClient();
    await admin.from("payments").insert({
      user_id: auth.user.id,
      reference: data.data.reference,
      method: wantsTransfer ? "transfer" : "card_or_transfer",
      amount: 750,
      status: "pending",
    });

    return NextResponse.json({
      reference: data.data.reference,
      access_code: data.data.access_code,
      authorization_url: data.data.authorization_url,
    });
  } catch {
    return NextResponse.json({ error: "network_error" }, { status: 502 });
  }
}
