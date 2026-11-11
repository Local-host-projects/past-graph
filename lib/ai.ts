/**
 * Gemini (Google Generative Language API) — server-side only.
 * This file must never be imported from a client component: the key lives server-side.
 *
 * Env (any one of): GEMINI_API_KEY | AI_API_KEY | GOOGLE_API_KEY
 * Optional:        GEMINI_MODEL (default "gemini-2.5-flash")
 */

export const AI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export function aiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.AI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    null
  );
}

export function aiReady(): boolean {
  return Boolean(aiKey());
}

export type GeminiPart = { text: string };

export type GeminiTurn = { role: "user" | "model"; parts: GeminiPart[] };

type GeminiPayload = {
  contents: GeminiTurn[];
  systemInstruction?: { parts: GeminiPart[] };
  generationConfig?: { temperature?: number; maxOutputTokens?: number };
};

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
};

/** Low-level generate call. Throws with a readable message on failure. */
export async function geminiGenerate(
  system: string,
  turns: GeminiTurn[],
  opts: { temperature?: number; maxOutputTokens?: number } = {}
): Promise<string> {
  const key = aiKey();
  if (!key) throw Object.assign(new Error("AI key is not configured"), { code: "no_key" });

  const payload: GeminiPayload = {
    contents: turns,
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxOutputTokens ?? 700,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    }
  );

  const data = (await res.json()) as GeminiResponse;
  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || `Gemini HTTP ${res.status}`), {
      code: res.status === 400 ? "bad_request" : "upstream",
    });
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  if (!text) throw Object.assign(new Error("Gemini returned no text"), { code: "empty" });
  return text;
}

/**
 * Naive fixed-window limiter (per process). Good enough for a single-region
 * Next.js deployment at student-app scale; swap for Upstash/Redis at scale.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(id: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(id) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(id, hits);
    return false;
  }
  hits.push(now);
  buckets.set(id, hits);
  return true;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "local";
}
