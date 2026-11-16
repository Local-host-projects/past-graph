/**
 * /api/watch-quiz — retrieval practice scheduled by the video's own structure.
 *
 * The user's mechanic: while you watch section k, you get quizzed on the
 * knowledge an EARLIER section laid down — because that's the moment it
 * becomes load-bearing again. Answer wrong and you're sent back to that
 * section's timestamp to rewatch.
 *
 * Binding: each annotation belongs to a topic (its sim/article topic when it
 * carries one, else the video's). The quiz for crossing into section k tests
 * section k-1's topic, with a question from the bank — preferring ones the
 * signed-in user hasn't mastered (unanswered or wrong). No question for a
 * topic → no quiz for that boundary, the video stays clean.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type Ann = { id: string; t_start: number; t_end: number; title: string; kind: string; sim_slug: string | null; article_slug: string | null };
type Q = { id: string; topic_slug: string; stem: string; options: { label: string; text: string }[] | null; answer: string | null; explanation: string | null; difficulty: number };

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get("video") ?? "";
  if (!videoId) return NextResponse.json({ quizzes: [] });

  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  const uid = auth?.user?.id ?? null;

  const { data: v } = await sb.from("videos").select("id,topic_slug,subject_slug").eq("id", videoId).maybeSingle();
  if (!v) return NextResponse.json({ quizzes: [] });
  const video = v as { id: string; topic_slug: string; subject_slug: string };

  const { data: anns } = await sb
    .from("video_annotations")
    .select("id,t_start,t_end,title,kind,sim_slug,article_slug")
    .eq("video_id", videoId)
    .order("t_start");
  const annotations = (anns as Ann[]) ?? [];
  if (annotations.length < 2) return NextResponse.json({ quizzes: [] });

  /* topic per annotation: the linked resource's topic wins, else the video's */
  const artSlugs = annotations.map((a) => a.article_slug).filter(Boolean) as string[];
  const simSlugs = annotations.map((a) => a.sim_slug).filter(Boolean) as string[];
  const [arts, sims] = await Promise.all([
    artSlugs.length ? sb.from("articles").select("slug,topic_slug").in("slug", artSlugs) : Promise.resolve({ data: [] as unknown[] }),
    simSlugs.length ? sb.from("sims").select("slug,topic_slug").in("slug", simSlugs) : Promise.resolve({ data: [] as unknown[] }),
  ]);
  const artTopic = new Map(((arts.data ?? []) as Array<{ slug: string; topic_slug: string }>).map((r) => [r.slug, r.topic_slug]));
  const simTopic = new Map(((sims.data ?? []) as Array<{ slug: string; topic_slug: string }>).map((r) => [r.slug, r.topic_slug]));

  const topicOf = (a: Ann) => (a.article_slug ? artTopic.get(a.article_slug) : undefined) ?? (a.sim_slug ? simTopic.get(a.sim_slug) : undefined) ?? video.topic_slug;

  /* candidate questions per needed topic */
  const prevTopics = [...new Set(annotations.slice(0, -1).map((a) => topicOf(a)))];
  const { data: qs } = await sb
    .from("questions")
    .select("id,topic_slug,stem,options,answer,explanation,difficulty")
    .in("topic_slug", prevTopics.length ? prevTopics : [video.topic_slug])
    .not("options", "is", null)
    .limit(60);
  const bank = (qs as Q[]) ?? [];
  if (!bank.length) return NextResponse.json({ quizzes: [] });

  /* mastery view: what the user already answered correctly gets skipped */
  const mastered = new Set<string>();
  if (uid) {
    const ids = bank.map((q) => q.id);
    const { data: atts } = await sb
      .from("attempts")
      .select("question_id,correct")
      .eq("user_id", uid)
      .in("question_id", ids);
    for (const a of (atts as Array<{ question_id: string; correct: boolean }>) ?? []) {
      if (a.correct) mastered.add(a.question_id);
    }
  }

  const byTopic = new Map<string, Q[]>();
  for (const q of bank) {
    if (mastered.has(q.id)) continue;
    const list = byTopic.get(q.topic_slug) ?? [];
    list.push(q);
    byTopic.set(q.topic_slug, list);
  }
  for (const list of byTopic.values()) list.sort((a, b) => a.difficulty - b.difficulty);

  /* the schedule: entering section k quizzes the section k-1 material */
  const quizzes = [];
  for (let k = 1; k < annotations.length; k++) {
    const back = annotations[k - 1];
    const pool = byTopic.get(topicOf(back));
    const q = pool?.shift();
    if (!q || !q.answer || !q.options) continue;
    quizzes.push({
      id: `qz-${back.id}`,
      when_t: annotations[k].t_start,
      back_t: back.t_start,
      back_title: back.title,
      question: {
        id: q.id,
        stem: q.stem,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
      },
    });
    if (quizzes.length >= 6) break;
  }

  return NextResponse.json({ quizzes });
}
