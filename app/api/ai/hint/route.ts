import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { aiReady, geminiGenerate, rateLimit, clientIp } from "@/lib/ai";
import type { Question } from "@/lib/types";

/**
 * Post /api/ai/hint — one nudge toward the answer WITHOUT giving it away.
 * Free-flowing: paid premium not required, but rate-limited so it can't be
 * used as an answer machine. 503/no_key when no Gemini key is configured.
 */
export async function POST(req: Request) {
  if (!aiReady()) return NextResponse.json({ error: "no_key" }, { status: 503 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  if (!rateLimit(`hint:${clientIp(req)}`, 20, 10 * 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { question_id?: string } | null;
  const id = (body?.question_id ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "bad_id" }, { status: 400 });
  }

  const { data: q } = await supabase.from("questions").select("stem, options, answer, topic_slug, year").eq("id", id).single();
  if (!q) return NextResponse.json({ error: "no_question" }, { status: 404 });

  const question = q as Pick<Question, "stem" | "options" | "answer" | "topic_slug" | "year">;

  try {
    const hint = await geminiGenerate(
      "You tutor students practising Nigerian JAMB UTME past questions. Give ONE small hint about the NEXT meaningful step — never the final answer, never any option letter. At most 2 sentences, friendly, concrete. If the question is conceptual, hint at the rule or principle to recall. Plain text only.",
      [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                year: question.year,
                topic: question.topic_slug,
                stem: question.stem,
                options: (question.options as { label: string; text: string }[]).map((o) => o.text),
                correct_answer: question.answer,
              }),
            },
          ],
        },
      ],
      { temperature: 0.5, maxOutputTokens: 160 }
    );
    return NextResponse.json({ hint });
  } catch (err) {
    const code = (err as { code?: string }).code ?? "upstream";
    return NextResponse.json({ error: code }, { status: code === "no_key" ? 503 : 502 });
  }
}
