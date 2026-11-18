import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { flutterwave } from "@/lib/flutterwave";

/**
 * Creates a Flutterwave hosted checkout for ₦750 premium.
 * transfer → payment_options "bank_transfer": Flutterwave shows the customer
 * a dedicated account number on the hosted page. card → card + bank_transfer.
 * Returns the hosted link; premium flips only via verify / webhook, never here.
 */
export async function POST(req: Request) {
  if (!process.env.FLW_SECRET_KEY) {
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

    const txRef = `pgflw-${randomUUID()}`;

    const { ok, data } = await flutterwave<{ data?: { link?: string } }>("/payments", {
      method: "POST",
      body: {
        tx_ref: txRef,
        amount: 750, // naira — Flutterwave takes the major unit (Paystack wanted kobo)
        currency: "NGN",
        payment_options: wantsTransfer ? "bank_transfer" : "card,bank_transfer",
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin}/pricing/success`,
        customer: {
          email: auth.user.email,
          name: (auth.user.user_metadata?.full_name as string | undefined) || "Past Graph student",
        },
        customizations: {
          title: "Past Graph Premium",
          description: "Six months of the full archive — every question, video, article and sim.",
        },
        meta: { user_id: auth.user.id, product: "past-graph-premium-6mo" },
      },
    });

    if (!ok || data.status !== "success" || !data.data?.link) {
      return NextResponse.json({ error: "flutterwave_error", detail: data.message ?? null }, { status: 502 });
    }

    // Seed the pending payment row (server-side ownership, not client-supplied).
    const admin = createAdminClient();
    await admin.from("payments").insert({
      user_id: auth.user.id,
      reference: txRef,
      method: wantsTransfer ? "transfer" : "card_or_transfer",
      amount: 750,
      status: "pending",
    });

    return NextResponse.json({ reference: txRef, link: data.data.link });
  } catch {
    return NextResponse.json({ error: "network_error" }, { status: 502 });
  }
}
