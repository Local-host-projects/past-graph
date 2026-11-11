"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { sfx, sfxInit, isMuted } from "@/lib/sfx";
import type { Question, Step } from "@/lib/types";
import QuestionView from "./QuestionView";

/* clips: annotation slices surfaced by the ranker so a video slide reads
   sectionally — each chip is a watcher deep-link at that timestamp. */
type Clip = { t_start: number; title: string; kind: string; sim_slug: string | null; article_slug: string | null };

type FeedItem = {
  type: "question" | "video" | "article" | "sim";
  id?: string; slug?: string;
  subject_slug: string; topic_slug: string;
  year?: number; qnum?: number; stem?: string; kind?: string; is_free?: boolean; difficulty?: number;
  options?: { label: string; text: string }[] | null;
  answer?: string | null;
  explanation?: string | null;
  steps?: Step[] | null;
  youtube_id?: string; title?: string; channel?: string; blurb?: string; annotations?: number; clips?: Clip[];
  summary?: string; read_min?: number;
  reason?: string;
};

function itemKey(it: FeedItem) {
  return it.type === "question" ? `q:${it.id}` : it.type === "video" ? `v:${it.id}` : it.type === "article" ? `a:${it.slug}` : `s:${it.slug}`;
}
function itemHref(it: FeedItem) {
  if (it.type === "question") return `/practice?mode=paper&subject=${it.subject_slug}&year=${it.year}&q=${it.id}&enter=1`;
  if (it.type === "video") return `/videos/${it.id}`;
  if (it.type === "article") return `/articles/${it.slug}`;
  return "/sims";
}
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, "0")}`;

/** a feed question becomes a real Question when the API shipped the answer data */
function asQuestion(it: FeedItem): Question | null {
  if (it.type !== "question" || !it.id || !it.stem || !it.options?.length || !it.answer) return null;
  return {
    id: it.id,
    subject_slug: it.subject_slug,
    topic_slug: it.topic_slug,
    year: it.year ?? 0,
    qnum: it.qnum ?? 0,
    stem: it.stem,
    options: it.options,
    answer: it.answer,
    explanation: it.explanation ?? "",
    kind: it.kind === "multi" ? "multi" : "single",
    steps: (it.steps as Step[] | null) ?? null,
    difficulty: it.difficulty ?? 2,
    is_free: it.is_free !== false,
  };
}

const readMap = (key: string): Record<string, boolean> => {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(key) ?? "{}") as Record<string, boolean>; } catch { return {}; }
};
const readLog = (): string[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem("pg_feed_seen") ?? "[]") as string[]; } catch { return []; }
};
const persistMap = (key: string, val: Record<string, boolean>) => {
  try { window.localStorage.setItem(key, JSON.stringify(val)); } catch { /* private mode */ }
};
const persistLog = (val: string[]) => {
  try { window.localStorage.setItem("pg_feed_seen", JSON.stringify(val)); } catch { /* private mode */ }
};

export default function FeedApp() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [premium, setPremium] = useState(false);
  const [signedIn, setSignedIn] = useState(true);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [saved, setSaved] = useState<Record<string, boolean>>(() => readMap("pg_feed_saved"));
  const [follows, setFollows] = useState<Record<string, boolean>>(() => readMap("pg_feed_follows"));
  const seenRef = useRef<string[]>(readLog());
  const [toast, setToast] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  /** feed-inline attempts: one pick per question, remembered across reloads */
  const [answers, setAnswers] = useState<Record<string, { letter: string; correct: boolean }>>({});
  const [constructed, setConstructed] = useState<Record<string, boolean>>({});
  const constructedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    sfxInit();
    setSaved(readMap("pg_feed_saved"));
    setFollows(readMap("pg_feed_follows"));
    seenRef.current = readLog();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seen: seenRef.current.slice(-40) }),
      });
      const data = (await res.json()) as {
        items?: Array<{ item: FeedItem; reason: string }>;
        premium?: boolean;
        signedIn?: boolean;
        attempted?: Record<string, { picked: string; correct: boolean }>;
      };
      setPremium(Boolean(data.premium));
      setSignedIn(Boolean(data.signedIn));
      if (data.attempted && Object.keys(data.attempted).length) {
        /* server-owned prefill — the browser session may be invisible to the
           JS client (httpOnly cookies), so the answered map rides with the feed */
        setAnswers((prev) => ({ ...prev, ...data.attempted }));
      }
      setItems(
        (data.items ?? []).map((x, i) => {
          const it = x.item as FeedItem;
          return { ...it, reason: x.reason, id: it.type === "question" || it.type === "video" ? it.id ?? String(i) : it.id ?? it.slug ?? String(i) };
        })
      );
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const feedPick = useCallback(
    async (qq: Question, letter: string) => {
      if (answers[qq.id]) return;
      const correct = letter === qq.answer;
      setAnswers((m) => ({ ...m, [qq.id]: { letter, correct } }));
      sfx(correct ? "correct" : "wrong");
      /* persistence rides the server now: it owns the session (httpOnly
         cookies) and the answer key — the client only names its pick */
      try {
        await fetch("/api/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question_id: qq.id, picked: letter }),
        });
      } catch {
        /* anonymous / offline: the answer stays local */
      }
    },
    [answers]
  );

  const markConstructed = useCallback((id: string) => {
    if (constructedRef.current[id]) return;
    constructedRef.current[id] = true;
    setConstructed((m) => ({ ...m, [id]: true }));
  }, []);

  /* slide tracking + seen-log (novelty lives across the session folder) */
  const scroller = scrollerRef;
  useEffect(() => {
    const el = scroller.current;
    if (!el || !items.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.55) {
            const i = Number((e.target as HTMLElement).dataset.i);
            if (!Number.isNaN(i)) {
              setIdx((prev) => {
                if (prev !== i && !isMuted()) sfx("tick");
                return i;
              });
              const it = items[i];
              if (it) {
                const key = itemKey(it);
                if (!seenRef.current.includes(key)) {
                  const next = [...seenRef.current, key].slice(-40);
                  seenRef.current = next;
                  persistLog(next);
                }
              }
            }
          }
        }
      },
      { root: el, threshold: [0.55] }
    );
    el.querySelectorAll<HTMLElement>(".reel-section").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items, scroller]);

  const scrollTo = useCallback((i: number) => {
    scrollerRef.current?.querySelector<HTMLElement>(`[data-i="${i}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { window.history.back(); return; }
      if (e.key === "n" || e.key === "N" || e.key === "ArrowDown") {
        e.preventDefault();
        if (idx < items.length - 1) { setIdx(idx + 1); scrollTo(idx + 1); sfx("tick"); }
      } else if (e.key === "p" || e.key === "P" || e.key === "ArrowUp") {
        e.preventDefault();
        if (idx > 0) { setIdx(idx - 1); scrollTo(idx - 1); sfx("tick"); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, items.length, scrollTo]);

  function toggleIn(storageKey: string, setter: (f: (m: Record<string, boolean>) => Record<string, boolean>) => void, key: string) {
    setter((m) => {
      const next = { ...m, [key]: !m[key] };
      persistMap(storageKey, next);
      return next;
    });
  }

  async function share(it: FeedItem) {
    const url = `${location.origin}${itemHref(it)}`;
    try {
      if (navigator.share) await navigator.share({ url, title: "Past Graph" });
      else { await navigator.clipboard.writeText(url); setToast("Copied — drop it in the class group."); }
    } catch {
      setToast("Couldn't share — link is in the address bar.");
    }
    sfx("open");
    setTimeout(() => setToast(null), 2600);
  }

  /* ------------------------------------------------------------------ */

  const chrome = (
    <div className="reel-chip-top">
      <a href="/" className="btn glass-ink !py-2 !px-4 !text-[13px]" style={{ border: "1.5px solid var(--card-bg)" }}>
        ✕ Exit
      </a>
      <span className="mono chip chip-soft" style={{ cursor: "default" }}>GRAPH FEED · {items.length ? `${Math.min(idx + 1, items.length)}` : "–"}</span>
      <button
        className="btn glass-ink !py-2 !px-3 !text-[13px]"
        style={{ border: "1.5px solid var(--card-bg)", cursor: "pointer" }}
        onClick={() => { void load(); requestAnimationFrame(() => scrollerRef.current?.scrollTo({ top: 0 })); }}
      >
        ↻ New walk
      </button>
    </div>
  );

  /* the rail is three calm buttons — nothing else */
  const rail = (it: FeedItem) => (
    <div className="feed-rail">
      <button
        className="rail-btn"
        data-on={saved[itemKey(it)] ? "1" : "0"}
        aria-pressed={Boolean(saved[itemKey(it)])}
        aria-label="Save"
        onClick={() => { sfx("tick"); toggleIn("pg_feed_saved", setSaved, itemKey(it)); }}
      >
        {saved[itemKey(it)] ? "★" : "☆"}
      </button>
      <span className="rail-cap">Save</span>

      <button
        className="rail-btn"
        data-on={follows["t:" + it.topic_slug] ? "1" : "0"}
        aria-pressed={Boolean(follows["t:" + it.topic_slug])}
        aria-label="Follow topic"
        onClick={() => { sfx("tick"); toggleIn("pg_feed_follows", setFollows, "t:" + it.topic_slug); }}
      >
        {follows["t:" + it.topic_slug] ? "✓" : "+"}
      </button>
      <span className="rail-cap">Follow</span>

      <button className="rail-btn" onClick={() => share(it)} aria-label="Share">↗</button>
      <span className="rail-cap">Share</span>
    </div>
  );

  const captionBox = (it: FeedItem) => (
    <div className="feed-caption">
      <p className="mono text-[10.5px] tracking-[0.06em]" style={{ color: "rgba(245,240,228,0.55)" }}>
        #{it.topic_slug} ·#{it.subject_slug}{it.year ? ` ·${it.year}` : ""}
      </p>
      <p className="mt-1 text-[12px] flex items-center gap-1.5" style={{ color: "rgba(245,240,228,0.72)" }}>
        <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 99, background: "var(--zest)", display: "inline-block" }} />
        {it.reason ?? "picked for your walk"}
      </p>
    </div>
  );

  const sections = useMemo((): ReactNode[] => {
    const list: ReactNode[] = [];
    list.push(
      <section key="welcome" className="reel-section" data-i={0}>
        <div className="reel-body">
          <div className="w-full max-w-lg text-center" style={{ color: "var(--paper)" }}>
            <span className="sticker sticker-zest" style={{ display: "inline-block", transform: "rotate(-3deg)" }}>RANKED BY THE GRAPH</span>
            <h1 className="display text-[30px] sm:text-[38px] mt-4">Not a scroll — a walk.</h1>
            <p className="text-[14.5px] mt-3 leading-relaxed" style={{ color: "rgba(245,240,228,0.8)" }}>
              Your weakest threads first, then the video, the sim or the article that explains them.
              Answer right here — no topic repeats twice in a row.
            </p>
            <p className="mono text-[12px] mt-5" style={{ color: "rgba(245,240,228,0.55)" }}>
              keys: N / P · save ☆ · follow topics · share ↗
            </p>
            {!signedIn && (
              <a href="/login" className="feed-pill feed-pill-soft mt-5" style={{ display: "inline-flex" }}>
                Sign in — the feed learns from your attempts
              </a>
            )}
          </div>
        </div>
      </section>
    );

    items.forEach((it, i) => {
      const idxSection = i + 1;
      const locked = it.type === "question" && it.is_free === false && !premium;

      if (locked) {
        list.push(
          <section key={itemKey(it)} className="reel-section" data-i={idxSection}>
            <div className="reel-body">
              <div className="slip p-6 pl-8 w-full max-w-md">
                <div className="barcode" style={{ maxWidth: 230 }} aria-hidden="true" />
                <p className="mono text-[11px] tracking-[0.14em] mt-3" style={{ color: "var(--muted)" }}>NO. {it.subject_slug.toUpperCase()}-{it.year} — ARCHIVE</p>
                <p className="display text-[21px] mt-2">Behind the ₦750</p>
                <p className="muted text-[14px] mt-1.5 leading-relaxed">
                  The 2000–2020 archive sleeps here. Six months of the whole graph is one payment.
                </p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <a href="/pricing" className="btn btn-zest" onClick={() => sfx("lock")}>Unlock — ₦750 / 6 mo</a>
                </div>
              </div>
            </div>
            {rail(it)}
            {captionBox(it)}
          </section>
        );
        return;
      }

      if (it.type === "question") {
        const q = asQuestion(it);
        if (q) {
          list.push(
            <section key={itemKey(it)} className="reel-section" data-i={idxSection}>
              <div className="reel-body reel-tight">
                <QuestionView
                  q={q}
                  compact
                  showSubject
                  answered={Boolean(answers[q.id])}
                  picked={answers[q.id]?.letter ?? null}
                  onPick={feedPick}
                  constructed={Boolean(constructed[q.id])}
                  onConstructed={markConstructed}
                />
              </div>
              {rail(it)}
              {captionBox(it)}
            </section>
          );
          return;
        }
        /* fallback: no answer data — keep it navigable */
        list.push(
          <section key={itemKey(it)} className="reel-section" data-i={idxSection}>
            <div className="reel-body">
              <div className="slip p-5 pl-8 w-full max-w-lg">
                <span className="mono text-[11px] tracking-[0.12em] px-2.5 py-1 rounded-full" style={{ background: "var(--paper-2)" }}>
                  {it.year} · {it.subject_slug.toUpperCase()} · Q{String(it.qnum ?? 0).padStart(2, "0")}
                </span>
                <a href={itemHref(it)} className="btn btn-primary !py-2 !px-5 !text-[14.5px] mt-4 block" onClick={() => sfx("open")}>
                  Solve it in the hall →
                </a>
              </div>
            </div>
            {rail(it)}
            {captionBox(it)}
          </section>
        );
        return;
      }

      if (it.type === "video") {
        /* the slide IS the clip list; the full watcher is one honest link */
        const clips = (it.clips ?? []).slice(0, 6);
        const n = it.annotations ?? 0;
        list.push(
          <section key={itemKey(it)} className="reel-section" data-i={idxSection}>
            <div className="reel-body reel-tight">
              <div className="slip p-4 pl-8 sm:p-5 sm:pl-9 w-full max-w-md">
                <a href={itemHref(it)} className="block" onClick={() => sfx("open")}>
                  <p className="text-[15.5px] font-semibold leading-snug">{it.title}</p>
                  <p className="mono text-[11px] mt-1 muted">{it.channel} · {n} timed pop-up{n === 1 ? "" : "s"}</p>
                </a>
                <div className="mt-3 grid gap-1.5">
                  {clips.map((c, k) => (
                    <a
                      key={k}
                      href={`/videos/${it.id}?t=${Math.round(c.t_start)}`}
                      className="clip-chip"
                      onClick={() => sfx("open")}
                    >
                      <span className="t mono shrink-0">{fmt(c.t_start)}</span>
                      <span className="truncate flex-1">{c.title}</span>
                      <span className="k shrink-0 mono">{c.kind === "sim" ? "⌁ sim" : c.kind === "article" ? "¶ brief" : "✎ note"}</span>
                    </a>
                  ))}
                  {!clips.length && (
                    <p className="muted text-[12px] leading-relaxed">{n ? `${n} timed note${n === 1 ? "" : "s"} wake up inside the watcher.` : "An explainer for this topic."}</p>
                  )}
                </div>
                <a href={itemHref(it)} className="feed-pill feed-pill-leaf mt-3" onClick={() => sfx("open")} style={{ display: "inline-flex" }}>
                  Open the watcher →
                </a>
              </div>
            </div>
            {rail(it)}
            {captionBox(it)}
          </section>
        );
        return;
      }

      if (it.type === "article") {
        list.push(
          <section key={`a:${it.slug}`} className="reel-section" data-i={idxSection}>
            <div className="reel-body reel-tight">
              <div className="slip p-4 pl-8 sm:p-5 sm:pl-9 w-full max-w-md text-left">
                <span className="chip chip-soft">{it.read_min} min read</span>
                <h3 className="display text-[20px] mt-2.5">{it.title}</h3>
                <p className="muted text-[13px] mt-1.5 leading-relaxed">{(it.summary ?? "").slice(0, 130).trim()}…</p>
                <a href={itemHref(it)} className="btn btn-secondary !py-2 !px-4 !text-[13.5px] mt-3.5" onClick={() => sfx("open")}>
                  Read the brief →
                </a>
              </div>
            </div>
            {rail(it)}
            {captionBox(it)}
          </section>
        );
        return;
      }

      list.push(
        <section key={`s:${it.slug}`} className="reel-section" data-i={idxSection}>
          <div className="reel-body reel-tight">
            <div className="slip p-4 pl-8 sm:p-5 sm:pl-9 w-full max-w-md text-left">
              <span className="chip chip-soft">simulation</span>
              <h3 className="display text-[20px] mt-2.5">{it.title}</h3>
              <p className="muted text-[13px] mt-1.5 leading-relaxed">{(it.blurb ?? "").slice(0, 120)}</p>
              <a href={itemHref(it)} className="btn btn-secondary !py-2 !px-4 !text-[13.5px] mt-3.5" onClick={() => sfx("open")}>
                Play it →
              </a>
            </div>
          </div>
          {rail(it)}
          {captionBox(it)}
        </section>
      );
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, premium, signedIn, saved, follows, answers, constructed]);

  function toastChip() {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[80] pill-arrive">
        <span className="mono chip chip-soft">{toast}</span>
      </div>
    );
  }

  if (loading && !items.length) {
    return (
      <div className="reels feed-dark">
        <div className="absolute inset-0 grid place-items-center">
          <div className="slip p-6 pl-8 max-w-sm text-center">
            <div className="barcode mx-auto" style={{ maxWidth: 200 }} aria-hidden="true" />
            <p className="mono text-[11px] tracking-[0.14em] mt-3" style={{ color: "var(--muted)" }}>RANKING THE GRAPH…</p>
            <p className="text-[15px] mt-2">Mastery gap → freshness → builders first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reels feed-dark" role="region" aria-label="Graph feed">
      {chrome}

      <div ref={scrollerRef} className="reels-scroller">
        {items.length ? (
          sections
        ) : (
          <div className="absolute inset-0 grid place-items-center" style={{ color: "var(--paper)" }}>
            <div className="text-center">
              <p className="display text-[24px]">Nothing to walk right now</p>
              <p className="mt-2 text-[14px]" style={{ color: "rgba(245,240,228,0.7)" }}>
                The seed data may still be asleep — <a href="/practice" className="underline">practice</a> still works.
              </p>
            </div>
          </div>
        )}
      </div>

      {toast && toastChip()}
    </div>
  );
}
