"use client";

/**
 * Premium checkout:
 *  - "Card" opens the Paystack inline popup (card, transfer, USSD…).
 *  - "Bank transfer" opens the same popup with only the transfer channel —
 *    Paystack displays the account number to pay into.
 *  - No bank keys? A manual claim form captures the transfer reference for review.
 * Premium flips server-side (verify route / webhook), never from the client.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Phase = "idle" | "starting" | "popup" | "verifying" | "paid" | "error";

const PAYSTACK_INLINE = "https://js.paystack.co/v2/inline.js";

interface PaystackWindow extends Window {
  PaystackPop?: {
    init: (opts: { key: string }) => { resumeTransaction: (accessCode: string, cb: OnResult) => void };
  };
}
type OnResult = (res: { status?: string; reference?: string; message?: string }) => void;

/** Reads display bank details; env-driven so the operator changes them in one place. */
function bankDetails() {
  return {
    name: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME,
    number: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER,
    bank: process.env.NEXT_PUBLIC_BANK_NAME,
  };
}

export default function CheckoutSection() {
  const supabase = useMemo(() => createClient(), []);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const refRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setSignedIn(Boolean(data?.user));
    })();
  }, [supabase]);

  const loadInline = useCallback((): Promise<PaystackWindow["PaystackPop"] | null> => {
    return new Promise((resolve) => {
      const w = window as PaystackWindow;
      if (w.PaystackPop) return resolve(w.PaystackPop);
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${PAYSTACK_INLINE}"]`);
      const s = existing ?? document.createElement("script");
      if (existing && existing.dataset.loaded === "1") return resolve(w.PaystackPop ?? null);
      s.src = PAYSTACK_INLINE;
      s.onload = () => {
        s.dataset.loaded = "1";
        resolve(w.PaystackPop ?? null);
      };
      s.onerror = () => resolve(null);
      if (!existing) document.head.appendChild(s);
    });
  }, []);

  async function verify(reference: string) {
    setPhase("verifying");
    const res = await fetch("/api/checkout/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });
    const data = (await res.json()) as { paid?: boolean; premium_until?: string; error?: string; status?: string };
    if (data.paid) {
      setPhase("paid");
      setMessage("Premium is on for the next six months. See you inside the archive.");
      window.setTimeout(() => window.location.reload(), 1500);
    } else if (data.error === "not_configured") {
      setPhase("error");
      setMessage("Payments are not wired yet — add the Paystack keys.");
    } else {
      setPhase("error");
      setMessage(data.status ? `Payment shows ${data.status}. If you paid by transfer, it can take a minute — we'll confirm it.` : "We couldn't confirm that payment. Try verify again or pay by manual transfer below.");
    }
  }

  async function pay(method: "card" | "transfer") {
    setMessage(null);
    if (!signedIn) {
      setPhase("error");
      setMessage("Sign in first — premium is tied to your account.");
      return;
    }
    setPhase("starting");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      if (res.status === 503) {
        setPhase("error");
        setMessage("Live payments are off. Use the manual transfer route below — it lands the same premium.");
        return;
      }
      const data = (await res.json()) as { reference?: string; access_code?: string; authorization_url?: string; error?: string };
      if (!data.access_code) {
        setPhase("error");
        setMessage(data.error === "unauthenticated" ? "Sign in first." : "Payment couldn't start. Try again.");
        return;
      }
      const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        setPhase("error");
        setMessage("Server is live but the public key is missing (NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY).");
        return;
      }
      refRef.current = data.reference ?? null;
      const pop = await loadInline();
      if (!pop) {
        setPhase("error");
        setMessage("Couldn't reach Paystack. Manual transfer below works just as well.");
        return;
      }
      setPhase("popup");
      const trx = pop.init({ key: publicKey });
      trx.resumeTransaction(data.access_code, (result) => {
        const reference = result.reference ?? refRef.current;
        if (result.status === "success" && reference) {
          verify(reference);
        } else if (result.status === "success") {
          // Paid but with no reference surfaced — the webhook will flip premium; ask the user to refresh.
          setPhase("paid");
          setMessage("Payment received! Premium activates automatically — refresh in a moment.");
        } else {
          setPhase("idle");
          setMessage("Checkout closed — nothing was charged.");
        }
      });
    } catch {
      setPhase("error");
      setMessage("Network hiccup starting payment. Try again.");
    }
  }

  const details = bankDetails();
  const [claim, setClaim] = useState({ reference: "", payer_name: "", bank: "" });
  const [claimState, setClaimState] = useState<string | null>(null);

  async function submitClaim(e: React.FormEvent) {
    e.preventDefault();
    setClaimState(null);
    const res = await fetch("/api/claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...claim, amount: 750 }),
    });
    const data = (await res.json()) as { submitted?: boolean; error?: string };
    if (data.submitted) {
      setClaimState("Submitted — claims are reviewed within 24 hours.");
      setClaim({ reference: "", payer_name: "", bank: "" });
    } else {
      setClaimState(
        data.error === "unauthenticated"
          ? "Sign in first."
          : data.error === "reference_already_claimed"
            ? "That reference was already claimed."
            : data.error === "bad_amount"
              ? "The premium is ₦750 — claims only cover it."
              : "That reference doesn't look valid — copy it from your bank receipt."
      );
    }
  }

  const busy = phase === "starting" || phase === "verifying";

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-2 mt-6">
        <button className="btn btn-primary w-full" disabled={busy} onClick={() => pay("card")}>
          {phase === "verifying" ? "Verifying…" : busy ? "Starting…" : "Pay with card"}
        </button>
        <button className="btn btn-secondary w-full" disabled={busy} onClick={() => pay("transfer")}>
          Bank transfer — pay to account number
        </button>
      </div>
      {!signedIn && signedIn !== null && (
        <p className="text-[12px] muted mt-2">
          You&apos;ll be asked to <a className="link-muted" href="/login">sign in</a> — premium attaches to your account, not your device.
        </p>
      )}
      {message && <p className="text-[13px] mt-3" style={{ color: phase === "paid" ? "var(--green)" : "var(--red)" }}>{message}</p>}

      {/* Manual route: when transfer accounts aren't enabled on the business */}
      {details.number && (
        <div className="card-flat p-5 mt-6">
          <p className="text-[13px] font-semibold">Manual transfer (reviewed within 24 h)</p>
          <p className="text-[13px] muted mt-1 leading-relaxed">
            Transfer ₦750 to <strong className="text-[var(--ink)]">{details.number}</strong> ({details.bank} — {details.name}).
            Keep the receipt reference, then claim here:
          </p>
          <form className="mt-3 grid sm:grid-cols-[1fr_1fr_auto] gap-2" onSubmit={submitClaim}>
            <input className="input" placeholder="Receipt reference" value={claim.reference} required minLength={6} maxLength={64}
              onChange={(e) => setClaim({ ...claim, reference: e.target.value })} />
            <input className="input" placeholder="Name on the paying account" value={claim.payer_name} required minLength={3} maxLength={60}
              onChange={(e) => setClaim({ ...claim, payer_name: e.target.value })} />
            <button className="btn btn-primary" type="submit">Submit claim</button>
          </form>
          {claimState && <p className="text-[12.5px] muted mt-2">{claimState}</p>}
        </div>
      )}
      <p className="text-[12px] muted mt-3 leading-relaxed">
        Bank transfer shows your dedicated account number in the Paystack window when the business is enabled for
        dynamic accounts. Premium flips only after our server verifies with Paystack — never from this page.
      </p>
      <style jsx>{`
        .input {
          border: 1px solid var(--hairline);
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 13.5px;
          background: #fff;
          min-width: 0;
        }
      `}</style>
    </div>
  );
}
