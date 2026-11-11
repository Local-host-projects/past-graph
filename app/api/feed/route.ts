/**
 * /api/feed — the graph-feed ranker.
 *
 * A small LEV-style scorer: mastery gap (from `attempts`), year freshness,
 * difficulty fit, constructiveness, and a light premium penalty for the
 * archive — blended, then merged with diversity rules (no topic twice in a
 * row, the same type can't pile up). Explains itself per item via `reason`.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

type QuestionRow = {
  id: string; subject_slug: string; topic_slug: string; year: number; qnum: number;
  stem: string; kind: string; is_free: boolean; difficulty: number;
  options: { label: string; text: string }[] | null;
  answer: string | null;
  explanation: string | null;
  steps: unknown[] | null;
};
type VideoRow = { id: string; youtube_id: string; title: string; channel: string; blurb: string; subject_slug: string; topic_slug: string };
type ArticleRow = { slug: string; title: string; summary: string; read_min: number; subject_slug: string; topic_slug: string };
type SimRow = { slug: string; title: string; kind: string; blurb: string | null; subject_slug: string; topic_slug: string };

type TopicStat = { n: number; correct: number };

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

export async function POST(req: NextRequest) {
  const sb = await createClient();

  let uid: string | null = null;
  let premium = false;
  {
    const { data: auth } = await sb.auth.getUser();
    if (auth?.user) {
      uid = auth.user.id;
      const { data: p } = await sb.from("profiles").select("is_premium").eq("id", uid).maybeSingle();
      premium = Boolean(p?.is_premium);
    }
  }

  let seen: string[] = [];
  try {
    const body = (await req.json()) as { seen?: string[] };
    if (Array.isArray(body?.seen)) seen = body.seen.slice(0, 60);
  } catch {
    /* anonymous首轮 may send nothing */
  }
  const seenSet = new Set(seen);

  /* ---- mastery state per topic ----------------------------------- */
  const topicStats = new Map<string, TopicStat>();
  let attemptedIds = new Set<string>();
  let attemptedMap: Record<string, { picked: string; correct: boolean }> = {};
  if (uid) {
    const { data: atts } = await sb
      .from("attempts")
      .select("question_id,correct,picked")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(300);
    const rows = (atts as Array<{ question_id: string; correct: boolean }>) ?? [];
    attemptedIds = new Set(rows.map((r) => r.question_id));
    /* prefill for the feed: rows come newest-first, so the first sighting wins */
    attemptedMap = {};
    for (const r of rows) {
      if (!attemptedMap[r.question_id]) {
        attemptedMap[r.question_id] = { picked: (r as { picked?: string }).picked ?? "", correct: Boolean(r.correct) };
      }
    }
    if (rows.length) {
      const ids = [...new Set(rows.map((r) => r.question_id))];
      const { data: qs } = await sb.from("questions").select("topic_slug").in("id", ids);
      const topicOf = new Map<string, string>();
      for (const q of (qs as Array<{ id: string; topic_slug: string }>) ?? []) topicOf.set(q.id, q.topic_slug);
      for (const a of rows) {
        const t = topicOf.get(a.question_id);
        if (!t) continue;
        const s = topicStats.get(t) ?? { n: 0, correct: 0 };
        s.n += 1;
        if (a.correct) s.correct += 1;
        topicStats.set(t, s);
      }
    }
  }

  /* ---- pools ------------------------------------------------------ */
  const [{ data: qData }, { data: vData }, { data: aData }, { data: sData }, { data: annData }] = await Promise.all([
    sb.from("questions").select("id,subject_slug,topic_slug,year,qnum,stem,kind,is_free,difficulty,options,answer,explanation,steps").gte("year", 2014),
    sb.from("videos").select("id,youtube_id,title,channel,blurb,subject_slug,topic_slug"),
    sb.from("articles").select("slug,title,summary,read_min,subject_slug,topic_slug"),
    sb.from("sims").select("slug,title,kind,blurb,subject_slug,topic_slug"),
    sb.from("video_annotations").select("video_id,t_start,title,kind,sim_slug,article_slug"),
  ]);
  const questions = (qData as QuestionRow[]) ?? [];
  const videos = (vData as VideoRow[]) ?? [];
  const articles = (aData as ArticleRow[]) ?? [];
  const sims = (sData as SimRow[]) ?? [];
  type ClipRow = { video_id: string; t_start: number; title: string; kind: string; sim_slug: string | null; article_slug: string | null };
  const annCount = new Map<string, number>();
  const clipsByVideo = new Map<string, ClipRow[]>();
  for (const a of ((annData as ClipRow[]) ?? [])) {
    annCount.set(a.video_id, (annCount.get(a.video_id) ?? 0) + 1);
    const list = clipsByVideo.get(a.video_id) ?? [];
    if (list.length < 6) list.push(a);
    clipsByVideo.set(a.video_id, list);
  }

  const gapOf = (topic: string) => {
    const s = topicStats.get(topic);
    if (!s || s.n < 2) return 0.62;
    const acc = clamp(s.correct / Math.max(2, s.n), 0, 1);
    return clamp(1 - acc);
  };

  /* ---- scored candidates ------------------------------------------ */
  type Scored = { score: number; reason: string; item: Record<string, unknown> };
  const out: Scored[] = [];

  for (const q of questions) {
    if (seenSet.has(q.id)) continue;
    /* already answered straight questions shouldn't keep coming back — the
       graph remembers; builders stay, because rebuilding one is the point. */
    const isBuilder = q.kind === "multi" && (Array.isArray(q.steps) ? q.steps.length : 0) > 1;
    if (uid && attemptedIds.has(q.id) && !isBuilder) continue;
    const gap = gapOf(q.topic_slug);
    const fresh = clamp((q.year - 2013) / 12);
    const fit = clamp(1 - Math.abs((q.difficulty ?? 2) - 2) / 2);
    const multi = q.kind === "multi";
    let score = 0.44 * gap + 0.2 * fresh + 0.12 * fit + (multi ? 0.18 : 0) + 0.05;
    if (!q.is_free && !premium) score *= 0.78;
    const s = topicStats.get(q.topic_slug);
    let reason: string;
    if (multi) reason = "constructive — the answer gets built, not guessed";
    else if (s && s.n >= 3) reason = `${q.topic_slug.replace(/-/g, " ")} sits at ${Math.round((s.correct / Math.max(2, s.n)) * 100)}% — this one pokes the gap`;
    else if (gap > 0.6) reason = `${q.topic_slug.replace(/-/g, " ")} — clean soil, haven't touched it yet`;
    else if (fresh > 0.85) reason = `fresh from ${q.year} — the newest angle on it`;
    else reason = "kept warm for your walk through the graph";
    out.push({ score, reason, item: { ...q, type: "question" } });
  }

  for (const v of videos) {
    if (seenSet.has(`video:${v.id}`)) continue;
    const gap = gapOf(v.topic_slug);
    const rich = clamp((annCount.get(v.id) ?? 0) / 4);
    const score = clamp(0.5 * gap + 0.22 * rich + 0.14, 0, 0.97);
    const n = annCount.get(v.id) ?? 0;
    const reason = n > 0 ? `the explainer for ${v.topic_slug.replace(/-/g, " ")} · ${n} timed pop-up${n === 1 ? "" : "s"}` : `the explainer for ${v.topic_slug.replace(/-/g, " ")}`;
    out.push({ score, reason, item: { ...v, annotations: n, clips: clipsByVideo.get(v.id) ?? [], type: "video" } });
  }

  for (const a of articles) {
    if (seenSet.has(`article:${a.slug}`)) continue;
    const score = clamp(0.5 * gapOf(a.topic_slug) + 0.2, 0, 0.97);
    out.push({ score, reason: `${a.read_min} min on ${a.topic_slug.replace(/-/g, " ")} — short goodwill`, item: { ...a, type: "article" } });
  }

  for (const s of sims) {
    if (seenSet.has(`sim:${s.slug}`)) continue;
    const score = clamp(0.44 * gapOf(s.topic_slug) + 0.22, 0, 0.97);
    out.push({ score, reason: `play ${s.topic_slug.replace(/-/g, " ")} with your own hands`, item: { ...s, type: "sim" } });
  }

  /* tiny per-request jitter so "what's next" breathes between refreshes */
  for (const c of out) c.score += Math.random() * 0.1;

  /* ---- diversity merge -------------------------------------------- */
  out.sort((x, y) => y.score - x.score);
  const pools = {
    question: out.filter((c) => c.item.type === "question"),
    video: out.filter((c) => c.item.type === "video"),
    article: out.filter((c) => c.item.type === "article"),
    sim: out.filter((c) => c.item.type === "sim"),
  };
  const ptrs = { question: 0, video: 0, article: 0, sim: 0 } as Record<string, number>;

  const takeNext = (lastTopic: string | null, recent: string[]): Scored | null => {
    // at index 4, 8, 12 … prefer a non-question palate-cleanser when one exists
    const order = recent.length % 5 === 4
      ? ["video", "article", "sim", "question"]
      : ["question", "video", "article", "sim"];
    for (const key of order) {
      const pool = pools[key as keyof typeof pools];
      let p = ptrs[key];
      while (p < pool.length) {
        const c = pool[p];
        const topic = String(c.item.topic_slug);
        const nonQ = key !== "question";
        const qWindow = recent.slice(-4).filter((t) => t === "question").length;
        const ok = topic !== lastTopic && (nonQ || qWindow < 2);
        if (ok) {
          ptrs[key] = p + 1;
          return c;
        }
        p++;
      }
      ptrs[key] = Math.min(ptrs[key], pool.length - 1);
    }
    // fall back to absolutely anything left
    for (const key of ["question", "video", "article", "sim"]) {
      const pool = pools[key as keyof typeof pools];
      const p = ptrs[key];
      if (p < pool.length) {
        const c = pool[p];
        ptrs[key] = p + 1;
        return c;
      }
    }
    return null;
  };

  const items: Array<{ item: Record<string, unknown>; reason: string }> = [];
  const recent: string[] = [];
  let lastTopic: string | null = null;
  while (items.length < 18) {
    const c = takeNext(lastTopic, recent);
    if (!c) break;
    items.push({ item: c.item, reason: c.reason });
    recent.push(String(c.item.type));
    lastTopic = String(c.item.topic_slug);
  }

  /* non-premium walks always meet the archive once — the paywall is part of
     the walk, not an afterthought. Slotted at ~9 so the free flow breathes first. */
  if (!premium) {
    const hasLocked = items.some((x) => x.item.type === "question" && x.item.is_free === false);
    if (!hasLocked) {
      const locked = questions
        .filter((q) => !q.is_free && !seenSet.has(q.id))
        .sort((a, b) => b.year - a.year)[0];
      if (locked) {
        items.splice(Math.min(8, items.length), 0, {
          item: { ...locked, type: "question" } as Record<string, unknown>,
          reason: "guarded by the archive — six months of the graph opens it",
        });
      }
    }
  }

  return NextResponse.json({ items, premium, signedIn: Boolean(uid), attempted: attemptedMap });
}
