import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { aiReady, geminiGenerate, rateLimit, clientIp, type GeminiTurn } from "@/lib/ai";

/**
 * Pathfinder AI advisor — turns the student's dream course into a concrete
 * JAMB plan. Public 401 to signed-in users only; premium not required.
 * Returns 503/no_key when GEMINI_API_KEY (or AI_API_KEY) is absent.
 */
export async function POST(req: Request) {
  if (!aiReady()) {
    return NextResponse.json({ error: "no_key" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  if (!rateLimit(`chat:${clientIp(req)}`, 12, 10 * 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as
    | { message?: string; dream?: string; history?: { role: "user" | "model"; text: string }[] }
    | null;

  const message = (body?.message ?? "").trim();
  const dream = (body?.dream ?? "").trim().slice(0, 80);
  const history = Array.isArray(body?.history) ? body.history.slice(-6) : [];

  if (!message || message.length > 800) {
    return NextResponse.json({ error: "bad_message" }, { status: 400 });
  }

  const system = [
    "You are Pathfinder, a Nigerian UTME/JAMB admission advisor inside the Past Graph app.",
    "Answer for a Nigerian student preparing for the Unified Tertiary Matriculation Examination.",
    "Rules:",
    "1) Always name the correct JAMB UTME subject combination (Use of English is compulsory; plus three subjects). Nigerian combination rules use O'Level + JAMB subjects — be specific, e.g. Medicine: English, Biology, Chemistry, Physics.",
    "2) Recommend 2–4 alternative courses with their combinations in case scores fall short.",
    "3) Give a short study plan ordering the highest-yield topics per subject; mention which Past Graph year band to drill (2000–2010 fundamentals, 2011–2020 transition, 2021–2025 current format).",
    "4) Be honest about competitiveness (some universities rank Medicine > 280).",
    "5) Keep it under 220 words, warm and practical, markdown-lite (short bold labels, dashes).",
    dream ? `The student's dream course: ${dream}.` : "The student has not named a dream course yet — help them decide.",
  ].join("\n");

  const turns: GeminiTurn[] = [
    ...history.map((h) => ({ role: h.role, parts: [{ text: h.text }] })),
    { role: "user", parts: [{ text: message }] },
  ];

  try {
    const answer = await geminiGenerate(system, turns, { temperature: 0.6, maxOutputTokens: 700 });
    return NextResponse.json({ answer });
  } catch (err) {
    const code = (err as { code?: string }).code ?? "upstream";
    return NextResponse.json({ error: code }, { status: code === "no_key" ? 503 : 502 });
  }
}
