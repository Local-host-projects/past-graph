"use client";

import { useEffect, useState } from "react";

/**
 * Paystack callback target: /pricing/success?reference=...
 * Server verifies the reference against Paystack before premium flips.
 */
export default function PricingSuccess() {
  const [state, setState] = useState<"working" | "paid" | "pending" | "error">("working");
  const [detail, setDetail] = useState<string>("Making sure with Paystack…");

  useEffect(() => {
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (!reference) {
      setState("pending");
      setDetail("No reference in the link — if you paid by transfer, hold on for the webhook; otherwise return to pricing.");
      return;
    }
    (async () => {
      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = (await res.json()) as { paid?: boolean; status?: string; premium_until?: string };
      if (data.paid) {
        setState("paid");
        setDetail("Premium is live until " + new Date(data.premium_until ?? "").toLocaleDateString());
      } else if (data.status && data.status !== "success") {
        setState("pending");
        setDetail(`Paystack reports this payment as ${data.status}. Transfers can take a couple of minutes.`);
      } else {
        setState("error");
        setDetail("We couldn't confirm that payment yet. Give the webhook a minute, or contact support.");
      }
    })();
  }, []);

  return (
    <div className="max-w-lg mx-auto px-6 py-24 text-center">
      <p className="chip" style={{ margin: "0 auto" }}>
        {state === "working" ? "Verifying" : state === "paid" ? "You're in" : "Almost there"}
      </p>
      <h1 className="display text-[34px] mt-4">
        {state === "paid" ? "The archive is yours." : state === "error" ? "Not confirmed yet" : "One moment…"}
      </h1>
      <p className="muted text-[15px] mt-3 leading-relaxed">{detail}</p>
      <div className="mt-8 flex gap-2 justify-center">
        <a className="btn btn-primary" href="/practice">Enter the archive</a>
        <a className="btn btn-secondary" href="/pricing">Back to pricing</a>
      </div>
      {state === "pending" && (
        <button className="link-muted text-[13px] mt-6" onClick={() => window.location.reload()}>
          Try again
        </button>
      )}
    </div>
  );
}
