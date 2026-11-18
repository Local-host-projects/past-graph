import crypto from "node:crypto";

/**
 * Flutterwave helpers — the transfer-first payment provider.
 * Checkout uses the hosted /v3/payments page (card + bank_transfer channels);
 * trust arrives via the webhook (verif-hash header) or verify_by_reference.
 * No public key is needed — the hosted link is minted server-side.
 */

export function flwConfigured(): boolean {
  return Boolean(process.env.FLW_SECRET_KEY);
}

/**
 * Webhook authenticity: the verif-hash header must equal the secret hash
 * configured in Dashboard → Settings → Webhooks, compared constant-time.
 */
export function verifyFlwHash(header: string | null, secretHash: string | undefined): boolean {
  if (!header || !secretHash) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(secretHash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Calls the Flutterwave REST API with the secret key. */
export async function flutterwave<T = unknown>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown } = {}
): Promise<{ ok: boolean; status: number; data: T & { status?: string; message?: string } }> {
  const secret = process.env.FLW_SECRET_KEY;
  if (!secret) throw Object.assign(new Error("Flutterwave keys not configured"), { code: "not_configured" });

  const res = await fetch(`https://api.flutterwave.com/v3${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  const data = (await res.json()) as T & { status?: string; message?: string };
  return { ok: res.ok, status: res.status, data };
}
