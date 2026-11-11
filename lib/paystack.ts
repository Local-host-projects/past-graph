import crypto from "node:crypto";

/**
 * Paystack webhook signature check: HMAC-SHA512 of the raw body with the secret key,
 * compared constant-time. Reach it from POST /api/webhooks/paystack.
 */
export function verifyPaystackSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Calls the Paystack REST API with the secret key. */
export async function paystack<T = unknown>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown } = {}
): Promise<{ ok: boolean; status: number; data: T & { status?: boolean; message?: string } }> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw Object.assign(new Error("Paystack keys not configured"), { code: "not_configured" });

  const res = await fetch(`https://api.paystack.co${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  const data = (await res.json()) as T & { status?: boolean; message?: string };
  return { ok: res.ok, status: res.status, data };
}
