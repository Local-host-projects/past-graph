/**
 * /api/attempt — record a single answer, server-side.
 *
 * The browser used to write straight into `attempts` with whatever session
 * the JS client could see; the session lives in httpOnly cookies now, so
 * clients stopped persisting. This route reads the server session instead,
 * computes `correct` from the question row (the server owns the answer, the
 * client never asserts it), and inserts. Anonymous users get ok:false, local
 * state stays.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) return NextResponse.json({ ok: false, reason: "anon" });

  let questionId = "";
  let picked = "";
  try {
    const body = (await req.json()) as { question_id?: string; picked?: string };
    questionId = String(body?.question_id ?? "").trim();
    picked = String(body?.picked ?? "").trim().toUpperCase().slice(0, 1);
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-body" });
  }
  if (!questionId || !/^[A-D]$/.test(picked)) return NextResponse.json({ ok: false, reason: "bad-body" });

  const { data: q } = await sb
    .from("questions")
    .select("answer")
    .eq("id", questionId)
    .maybeSingle();
  if (!q?.answer) return NextResponse.json({ ok: false, reason: "no-question" });

  const correct = String(q.answer).trim().toUpperCase() === picked;
  const { error } = await sb
    .from("attempts")
    .insert({ user_id: auth.user.id, question_id: questionId, picked, correct });
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 200 });

  return NextResponse.json({ ok: true, correct });
}
