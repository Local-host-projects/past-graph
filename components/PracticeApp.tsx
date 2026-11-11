"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Subject, Topic, Question, Video, Sim, Article } from "@/lib/types";
import QuestionView from "./QuestionView";
import MediaPanel, { type PanelData } from "./MediaPanel";
import { sfx, sfxInit, isMuted } from "@/lib/sfx";

type Access = "all" | "free" | "premium";
type Mode = "paper" | "mock" | "wander";

const YEARS = Array.from({ length: 26 }, (_, i) => 2000 + i);
const FREE_FROM = 2021;
const MOCK_ORDER = ["english", "mathematics", "physics", "chemistry", "biology"];

export default function PracticeApp() {
  const supabase = useMemo(() => createClient(), []);
  const params = useSearchParams();
  const boot = useMemo(() => {
    const g = (k: string) => params.get(k);
    return {
      mode: (["paper", "mock", "wander"].includes(g("mode") ?? "") ? (g("mode") as Mode) : "paper"),
      subject: g("subject"),
      year: g("year") ? Number(g("year")) : null,
      topic: g("topic") ?? "all",
      enter: g("enter") === "1",
      qid: g("q"),
      constructive: g("constructive") === "1",
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mode, setMode] = useState<Mode>(boot.mode);
  const [subject, setSubject] = useState<string | null>(boot.subject);
  const [year, setYear] = useState<number | null>(boot.year);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topic, setTopic] = useState<string>(boot.topic);
  /* mockChosen default: whatever Pathfinder set as the student's combo (pg_combo),
  else the classic hall four. English leads; the hall allows four, never five. */
  const readCombo = (): string[] => {
    const fallback = ["english", "mathematics", "physics", "chemistry"];
    if (typeof window === "undefined") return fallback;
    try {
      const raw = JSON.parse(window.localStorage.getItem("pg_combo") ?? "[]");
      if (!Array.isArray(raw)) return fallback;
      const valid = MOCK_ORDER.filter((s) => raw.includes(s)); // MOCK_ORDER keeps English first
      return valid.length >= 2 ? valid.slice(0, 4) : fallback;
    } catch { return fallback; }
  };
  const [mockChosen, setMockChosen] = useState<string[]>(readCombo);
  const [access, setAccess] = useState<Access>("all");
  const [buildersOnly, setBuildersOnly] = useState<boolean>(boot.constructive);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [emptyNote, setEmptyNote] = useState<string | null>(null);

  const [reelsOpen, setReelsOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  /** every pick persists per question — go away, come back, it's still answered.
      `{qid: {letter, correct}}`; no duplicate attempt rows, ever. */
  const [picks, setPicks] = useState<Record<string, { letter: string; correct: boolean }>>({});
  const [premium, setPremium] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [hasPaper, setHasPaper] = useState<Record<string, boolean>>({});

  const [recs, setRecs] = useState<{ videos: Video[]; sims: Sim[]; articles: Article[] }>({ videos: [], sims: [], articles: [] });
  const [panel, setPanel] = useState<PanelData | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hintBusy, setHintBusy] = useState(false);
  const [hintNote, setHintNote] = useState<string | null>(null);

  // constructive gate: "the answer only exists once you built the picture"
  const [constructed, setConstructed] = useState<Record<string, boolean>>({});
  const constructedRef = useRef<Record<string, boolean>>({});
  const markConstructed = useCallback((id: string) => {
    if (constructedRef.current[id]) return;
    constructedRef.current[id] = true;
    setConstructed((m) => ({ ...m, [id]: true }));
  }, []);

  const reelRef = useRef<HTMLDivElement>(null);
  const enteredRef = useRef(false);

  useEffect(() => {
    sfxInit();
    (async () => {
      const { data } = await supabase.from("subjects").select("*").order("name");
      setSubjects((data as Subject[]) ?? []);
      setLoading(false);
      if (data) {
        const list = await Promise.all(
          (data as Subject[]).map(async (s) => {
            const { count } = await supabase.from("questions").select("id", { count: "exact", head: true }).eq("subject_slug", s.slug);
            return [s.slug, (count ?? 0) > 0] as const;
          })
        );
        setHasPaper(Object.fromEntries(list));
      }
      const { data: auth } = await supabase.auth.getUser();
      if (auth?.user) {
        setUser(auth.user.id);
        const { data: p } = await supabase.from("profiles").select("is_premium").eq("id", auth.user.id).maybeSingle();
        setPremium(Boolean(p?.is_premium));
      }
    })();
  }, [supabase]);

  /* ---------------- loaders --------------------------------------- */

  const fetchPaper = useCallback(
    async (slug: string, y: number) => {
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("subject_slug", slug)
        .eq("year", y)
        .order("qnum");
      const rows = ((data as Question[]) ?? []).sort((a, b) => a.qnum - b.qnum);
      return rows;
    },
    [supabase]
  );

  /** answered before? the sheet remembers — evidence for homesickness in the hall. */
  const prefill = useCallback(
    async (rows: Question[]) => {
      if (!user || !rows.length) return;
      const { data } = await supabase
        .from("attempts")
        .select("question_id,correct,picked")
        .in("question_id", rows.map((r) => r.id))
        .eq("user_id", user)
        .order("created_at");
      const m: Record<string, { letter: string; correct: boolean }> = {};
      for (const r of ((data as Array<{ question_id: string; correct: boolean; picked: string | null }>) ?? [])) {
        m[r.question_id] = { letter: r.picked ?? "", correct: Boolean(r.correct) };
      }
      if (Object.keys(m).length) setPicks((prev) => ({ ...m, ...prev }));
    },
    [supabase, user]
  );

  /** subject → one year → 30 questions, straight into the hall. */
  const startPaper = useCallback(
    async (slug: string, y: number, opts?: { open?: boolean; jumpId?: string | null }) => {
      setMode("paper");
      setSubject(slug);
      setYear(y);
      setIdx(0);
      setEmptyNote(null);
      setLoading(true);
      const rows = await fetchPaper(slug, y);
      setQuestions(rows);
      void prefill(rows);
      setLoading(false);
      if (!rows.length) {
        setEmptyNote(`No paper for ${slug} · ${y}. This subject may only live in the graph for now — try Surf inside Wander.`);
        return;
      }
      if (opts?.open) {
        setReelsOpen(true);
        const i = opts.jumpId ? rows.findIndex((r) => r.id === opts.jumpId) : -1;
        const start = i >= 0 ? i : 0;
        setIdx(start);
        requestAnimationFrame(() => scrollTo(start));
      }
    },
    [fetchPaper, prefill]
  );

  /** a full mock: one year, several subjects, exam-style blocks. */
  const startMock = useCallback(
    async (chosen: string[], y: number, opts?: { open?: boolean; jumpId?: string | null }) => {
      setMode("mock");
      setSubject(null);
      setYear(y);
      setIdx(0);
      setEmptyNote(null);
      setLoading(true);
      const { data } = await supabase
        .from("questions")
        .select("*")
        .eq("year", y)
        .in("subject_slug", chosen);
      const rows = (data as Question[]) ?? [];
      // exam-hall honesty: subject block by subject block, qnum ascending inside each.
      const session: Question[] = [];
      for (const slug of chosen) {
        session.push(...rows.filter((r) => r.subject_slug === slug).sort((a, b) => a.qnum - b.qnum));
      }
      setQuestions(session);
      void prefill(session);
      setLoading(false);
      if (!session.length) {
        setEmptyNote("No papers found for that mock yet — pick another year or subject.");
        return;
      }
      if (opts?.open) {
        setReelsOpen(true);
        const i = opts.jumpId ? session.findIndex((r) => r.id === opts.jumpId) : -1;
        const start = i >= 0 ? i : 0;
        setIdx(start);
        requestAnimationFrame(() => scrollTo(start));
      }
    },
    [supabase, prefill]
  );

  /** wander by topic across years (or constructive builders only). */
  const pickSubject = useCallback(
    async (slug: string, preTopic?: string) => {
      setMode("wander");
      setSubject(slug);
      const t = preTopic ?? "all";
      setTopic(t);
      setIdx(0);
      setReelsOpen(false);
      setEmptyNote(null);
      setLoading(true);
      const [{ data: ts }, { data: qs }] = await Promise.all([
        supabase.from("topics").select("*").eq("subject_slug", slug).order("name"),
        supabase.from("questions").select("*").eq("subject_slug", slug).order("year", { ascending: false }).order("qnum"),
      ]);
      setTopics((ts as Topic[]) ?? []);
      const rows = ((qs as Question[]) ?? []);
      setQuestions(rows);
      void prefill(rows);
      setLoading(false);
    },
    [supabase, prefill]
  );

  /* boot from deep links (the feed deep-links into an exact paper/question) */
  useEffect(() => {
    if (!boot.subject || enteredRef.current) return;
    if (boot.mode === "wander") {
      enteredRef.current = true;
      if (boot.constructive) setBuildersOnly(true);
      pickSubject(boot.subject, boot.topic).then(() => {
        if (boot.enter) {
          setReelsOpen(true);
          requestAnimationFrame(() => scrollTo(0));
        }
      });
    } else if (boot.year) {
      enteredRef.current = true;
      if (boot.mode === "mock") {
        startMock(readCombo(), boot.year, { open: boot.enter, jumpId: boot.qid });
      } else {
        startPaper(boot.subject, boot.year, { open: boot.enter, jumpId: boot.qid });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjects.length > 0]);

  /* ---------------- the wander stream ------------------------------ */

  const wanderStream = useMemo(() => {
    let list = questions;
    if (topic !== "all") list = list.filter((q) => q.topic_slug === topic);
    if (buildersOnly) list = list.filter((q) => q.kind === "multi" && (q.steps?.length ?? 0) > 1);
    if (access === "free") list = list.filter((q) => q.is_free);
    if (access === "premium") list = list.filter((q) => !q.is_free);
    return list;
  }, [questions, topic, buildersOnly, access]);

  /* ---------------- active session --------------------------------- */

  const session = useMemo(() => {
    if (mode === "wander") return wanderStream;
    return questions;
  }, [mode, wanderStream, questions]);

  const q = session[Math.min(idx, Math.max(session.length - 1, 0))];

  useEffect(() => {
    if (!q) return;
    setHint(null);
    setHintNote(null);
    (async () => {
      const [v, s, a] = await Promise.all([
        supabase.from("videos").select("*").eq("topic_slug", q.topic_slug).limit(3),
        supabase.from("sims").select("*").eq("topic_slug", q.topic_slug).limit(2),
        supabase.from("articles").select("*").eq("topic_slug", q.topic_slug).limit(2),
      ]);
      setRecs({
        videos: (v.data as Video[]) ?? [],
        sims: (s.data as Sim[]) ?? [],
        articles: (a.data as Article[]) ?? [],
      });
    })();
  }, [q?.id, supabase, q?.topic_slug]);

  async function askHint() {
    if (!q || hintBusy) return;
    setHintBusy(true);
    setHintNote(null);
    try {
      const res = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: q.id }),
      });
      const data = (await res.json()) as { hint?: string; error?: string };
      if (data.hint) setHint(data.hint);
      else if (data.error === "no_key") setHintNote("Hints wake up when the Gemini key is added.");
      else if (data.error === "unauthenticated") setHintNote("Sign in to use hints.");
      else if (data.error === "rate_limited") setHintNote("Take a breath — try another hint in a few minutes.");
      else setHintNote("No hint right now — try again.");
    } catch {
      setHintNote("No hint right now — try again.");
    } finally {
      setHintBusy(false);
    }
  }

  const onPick = useCallback(
    async (qq: Question, letter: string) => {
      if (!q || qq.id !== q.id) return;
      if (picks[qq.id]) return; // one sheet, one pick — going back never resets it
      const needsBuild = qq.kind === "multi" && (qq.steps?.length ?? 0) > 1;
      if (needsBuild && !constructedRef.current[qq.id]) {
        setHintNote("Build every step first — the choices appear when the construction is complete.");
        return;
      }
      const correct = letter === qq.answer;
      setPicks((m) => ({ ...m, [qq.id]: { letter, correct } }));
      sfx(correct ? "correct" : "wrong");
      if (user) {
        await supabase.from("attempts").insert({ user_id: user, question_id: qq.id, picked: letter, correct });
      }
    },
    [picks, q, user, supabase]
  );

  /* ---- reels: the scroll-snap full-screen player ------------------- */

  useEffect(() => {
    const el = reelRef.current;
    if (!reelsOpen || !el || !session.length) return;
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
            }
          }
        }
      },
      { root: el, threshold: [0.55] }
    );
    el.querySelectorAll<HTMLElement>(".reel-section").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [reelsOpen, session.length, subject, topic, access, mode, year, buildersOnly]);

  const scrollTo = useCallback(
    (i: number) => {
      const el = reelRef.current?.querySelector<HTMLElement>(`[data-i="${i}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    []
  );

  const openReels = () => {
    if (!session.length) return;
    setReelsOpen(true);
    requestAnimationFrame(() => scrollTo(idx));
  };

  useEffect(() => {
    if (!reelsOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setReelsOpen(false); return; }
      const i = idx;
      if (e.key === "n" || e.key === "N" || e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        if (i < session.length - 1) setIdx(i + 1), scrollTo(i + 1), sfx("tick");
      } else if (e.key === "p" || e.key === "P" || e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        if (i > 0) setIdx(i - 1), scrollTo(i - 1), sfx("tick");
      } else if (["a", "b", "c", "d"].includes(e.key.toLowerCase()) && q) {
        onPick(q, e.key.toUpperCase());
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reelsOpen, idx, session.length, onPick, scrollTo, q]);

  const activeSubject = subjects.find((s) => s.slug === subject);
  const paperFree = Boolean(year && year >= FREE_FROM);
  const paperLocked = Boolean(year && !paperFree && !premium);
  const mockFree = Boolean(year && year >= FREE_FROM);
  const mockLocked = Boolean(year && !mockFree && !premium);

  const sessionLabel =
    mode === "mock"
      ? `MOCK ${year ?? ""} · ${mockChosen.length} SUBJECTS`
      : mode === "wander"
        ? (topic === "all" ? `${activeSubject?.name ?? ""} · ALL TOPICS` : topics.find((t) => t.slug === topic)?.name ?? topic)
        : `${year ?? ""} · ${activeSubject?.name ?? subject ?? ""} · PAPER`;

  /* mock anatomy: contiguous subject blocks, then the JAMB-style /400 score —
     each subject out of 100, the whole hall out of 400. */
  const mockBlocks = useMemo(() => {
    const blocks: { subject: string; start: number; count: number }[] = [];
    questions.forEach((qq, i) => {
      const last = blocks[blocks.length - 1];
      if (last && last.subject === qq.subject_slug) last.count += 1;
      else blocks.push({ subject: qq.subject_slug, start: i, count: 1 });
    });
    return blocks;
  }, [questions]);

  const mockScore = useMemo(() => {
    if (!mockBlocks.length) return null;
    let total = 0;
    const detail = mockBlocks.map((b) => {
      const slice = questions.slice(b.start, b.start + b.count);
      const answered = slice.filter((r) => picks[r.id]).length;
      const correct = slice.filter((r) => picks[r.id]?.correct).length;
      const pts = Math.round((correct / Math.max(1, b.count)) * 100);
      total += pts;
      return { subject: b.subject, answered, count: b.count, pts };
    });
    return { total, detail };
  }, [questions, picks, mockBlocks]);

  /* ---- entry screen ------------------------------------------------- */

  const tabChips = (
    <div className="flex flex-wrap gap-2">
      {([
        ["paper", "One paper", "subject → year → 30 questions"],
        ["mock", "Year mock", "one year, four subjects, like the hall"],
        ["wander", "Wander", "a topic deep-pool, builders included"],
      ] as [Mode, string, string][]).map(([m, label, blurb]) => (
        <button
          key={m}
          onClick={() => { setMode(m); sfx("tick"); }}
          className={`btn !py-2 !px-4 !text-[14px] text-left ${mode === m ? "btn-primary" : "btn-secondary"}`}
        >
          <span className="block font-semibold">{label}</span>
          <span className="block mono text-[10.5px] opacity-75">{blurb}</span>
        </button>
      ))}
    </div>
  );

  const yearRail = (onYear: (y: number) => void, selected: number | null, extra?: (y: number) => string | null) => (
    <div className="flex flex-wrap gap-1.5 mt-6">
      {YEARS.map((y) => {
        const free = y >= FREE_FROM;
        const tag = extra?.(y) ?? null;
        return (
          <button
            key={y}
            onClick={() => { setYear(y); onYear(y); }}
            className={`mono text-[12px] font-semibold px-3 py-1.5 rounded-full transition-transform hover:-translate-y-0.5 ${selected === y ? "shadow-sm" : ""}`}
            style={
              selected === y
                ? { background: "var(--ink)", color: "var(--paper)", border: "1.5px solid var(--ink)" }
                : y >= FREE_FROM
                  ? { background: "var(--leaf)", border: "1.5px solid var(--line)", color: "var(--ink)" }
                  : { border: "1.5px dashed var(--line)", color: "var(--ink)", background: "transparent" }
            }
            aria-pressed={selected === y}
          >
            {y}{tag ? ` · ${tag}` : ""}
          </button>
        );
      })}
    </div>
  );

  const subjectChips = (onPick: (slug: string) => void, activeSlug: string | null, filter?: (slug: string) => boolean) => (
    <div className="flex flex-wrap gap-2">
      {subjects.filter((s) => (filter ? filter(s.slug) : true)).map((s) => (
        <button
          key={s.slug}
          onClick={() => onPick(s.slug)}
          className={`btn !py-2 !px-4 !text-[14px] ${activeSlug === s.slug ? "btn-primary" : "btn-secondary"}`}
        >
          {s.name}
        </button>
      ))}
      {!subjects.length && !loading && (
        <p className="muted text-[14px]">No subjects yet — run the seed SQL in your Supabase project (see supabase/seed.sql).</p>
      )}
    </div>
  );

  const lockCard = (
    <div className="slip p-6 pl-8 text-left max-w-xl">
      <div className="barcode" style={{ maxWidth: 240 }} aria-hidden="true" />
      <p className="mono text-[11px] tracking-[0.14em] mt-3" style={{ color: "var(--muted)" }}>
        NO. {year}-000 — THE ARCHIVE
      </p>
      <p className="display text-[24px] mt-2">{year} is in the archive.</p>
      <p className="muted text-[14.5px] mt-1.5 leading-relaxed">
        Papers from 2000–2020 live behind Past Graph Premium — ₦750 for the whole six-month UTME
        season. The five newest years stay free forever.
      </p>
      <div className="mt-5 flex gap-2 flex-wrap">
        <a href="/pricing" className="btn btn-zest" onClick={() => sfx("lock")}>Unlock for ₦750</a>
      </div>
    </div>
  );

  const constructiveNote = (count: number) => (
    <span className="mono text-[12.5px] muted">
      {count > 0 ? `${count} constructive question${count === 1 ? "" : "s"} in this pool` : "no constructive questions here — the builders live in other topics"}
    </span>
  );

  const entry = (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="display text-[40px] sm:text-[52px]">Practice</h1>
      <p className="muted mt-2 text-[15.5px] max-w-[62ch] leading-relaxed">
        Pick a subject, pick a year, and the paper opens full-screen, one question per swipe — the way the
        exam keeps your eyes on one thing. Five newest years free; the archive is ₦750 away.
      </p>

      <div className="mt-6">{tabChips}</div>

      {/* ---- one paper ---- */}
      {mode === "paper" && (
        <div className="mt-8">
          {subjectChips((slug) => { setSubject(slug); setYear(null); setQuestions([]); setEmptyNote(null); }, subject, (s) => hasPaper[s] !== false)}
          {subject && (
            <>
              {activeSubject && <p className="muted text-[13.5px] mt-3 max-w-[58ch]">{activeSubject.blurb}</p>}
              {yearRail((y) => { /* select-only; starting happens on the card */ }, year)}
              <p className="muted text-[13px] mt-2.5">
                <span className="inline-block w-3 h-3 rounded-full align-[-1px] mr-1.5" style={{ background: "var(--leaf)", border: "1.5px solid var(--line)" }} />
               	lime = free · dashed outline = the ₦750 archive
              </p>
              {loading ? (
                <div className="card p-8 mt-6 text-center muted text-[14px]">Pulling the paper…</div>
              ) : year ? (
                paperLocked ? (
                  <div className="mt-7">{lockCard}</div>
                ) : (
                  <div className="slip p-6 pl-8 mt-7 max-w-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="mono text-[11px] tracking-[0.14em]" style={{ color: "var(--muted)" }}>PAST GRAPH — PAPER</p>
                        <p className="mono text-[15px] font-semibold mt-1">NO&nbsp;{year}-030</p>
                      </div>
                      <span className="sticker sticker-zest" style={{ transform: "rotate(3deg)" }}>30 QUESTIONS</span>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 gap-y-3 mt-5">
                      {[
                        ["SUBJECT", activeSubject?.name ?? subject ?? ""],
                        ["YEAR", String(year)],
                        ["PAPER", "Objective"],
                        ["FORMAT", "Full-screen · snap"],
                        ["KEYS", "A–D + N/P"],
                        ["STATUS", paperFree ? "Free" : premium ? "Unlocked" : "Archive"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p className="mono text-[9.5px] tracking-[0.12em]" style={{ color: "var(--muted)" }}>{k}</p>
                          <p className="mono text-[13.5px] font-semibold mt-0.5">{v}</p>
                        </div>
                      ))}
                    </div>
                    <hr className="tear" />
                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                      <button
                        className="btn btn-primary text-[15.5px] px-6 py-3"
                        onClick={() => subject && startPaper(subject, year, { open: true })}
                      >
                        Sit this paper →
                      </button>
                      <button className="btn btn-secondary !py-3" onClick={() => { if (session.length) setReelsOpen(true); else if (subject && year) startPaper(subject, year, { open: true }); }}>
                        Pick up where I left
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <p className="muted text-[14px] mt-7">Choose a year above — every paper is exactly 30 questions, Worldwide catalog 2000–2025.</p>
              )}
            </>
          )}
        </div>
      )}

      {/* ---- year mock ---- */}
      {mode === "mock" && (
        <div className="mt-8">
          <p className="mono text-[11px] tracking-[0.12em] mb-2" style={{ color: "var(--muted)" }}>SUBJECTS IN THIS MOCK</p>
          <div className="flex flex-wrap gap-2">
            {MOCK_ORDER.filter((s) => subjects.some((x) => x.slug === s) && hasPaper[s] !== false).map((slug) => {
              const on = mockChosen.includes(slug);
              return (
                <button
                  key={slug}
                  onClick={() => {
                    sfx("tick");
                    setMockChosen((c) => {
                      if (on) return c.filter((x) => x !== slug);
                      if (c.length >= 4) return c; // the hall allows four subjects, never five
                      return [...c, slug].sort((a, b) => MOCK_ORDER.indexOf(a) - MOCK_ORDER.indexOf(b));
                    });
                  }}
                  className={`btn !py-2 !px-4 !text-[14px] ${on ? "btn-primary" : "btn-secondary"}`}
                  aria-pressed={on}
                >
                  {subjects.find((s) => s.slug === slug)?.name ?? slug}
                  <span className="mono text-[11px] ml-1.5 opacity-70">{on ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>
          <p className="mono text-[11px] tracking-[0.12em] mt-5 mb-2" style={{ color: "var(--muted)" }}>YEAR</p>
          {yearRail(() => {}, year)}
          <p className="muted text-[13px] mt-2.5">The same year across your chosen subjects — 30 × {mockChosen.length} = {30 * mockChosen.length} questions, subject block by block.</p>
          {loading ? (
            <div className="card p-8 mt-6 text-center muted text-[14px]">Assembling the mock…</div>
          ) : emptyNote ? (
            <div className="card p-6 mt-6 text-[14px]">{emptyNote}</div>
          ) : year ? (
            mockLocked ? (
              <div className="mt-7">{lockCard}</div>
            ) : (
              <div className="slip p-6 pl-8 mt-7 max-w-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mono text-[11px] tracking-[0.14em]" style={{ color: "var(--muted)" }}>PAST GRAPH — MOCK</p>
                    <p className="mono text-[15px] font-semibold mt-1">NO&nbsp;{year}-MOCK-{String(mockChosen.length).padStart(2, "0")}</p>
                  </div>
                  <span className="sticker sticker-zest" style={{ transform: "rotate(-3deg)" }}>{30 * mockChosen.length} QUESTIONS</span>
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-3 mt-5">
                  {[
                    ["YEAR", String(year)],
                    ["SUBJECTS", mockChosen.map((s) => subjects.find((x) => x.slug === s)?.name ?? s).join(", ")],
                    ["TOTAL", String(30 * mockChosen.length)],
                    ["ORDER", "subject blocks"],
                    ["KEYS", "A–D + N/P"],
                    ["STATUS", mockFree ? "Free" : premium ? "Unlocked" : "Archive"],
                  ].map(([k, v]) => (
                    <div key={k} className={k === "SUBJECTS" ? "col-span-3" : ""}>
                      <p className="mono text-[9.5px] tracking-[0.12em]" style={{ color: "var(--muted)" }}>{k}</p>
                      <p className="mono text-[12.5px] font-semibold mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
                <hr className="tear" />
                <div className="mt-4">
                  <button className="btn btn-primary text-[15.5px] px-6 py-3" onClick={() => startMock(mockChosen, year, { open: true })}>
                    Sit the mock →
                  </button>
                </div>
              </div>
            )
          ) : (
            <p className="muted text-[14px] mt-7">Choose a year — the mock stitches your subjects the way the hall does.</p>
          )}
        </div>
      )}

      {/* ---- wander ---- */}
      {mode === "wander" && (
        <div className="mt-8">
          {subjectChips((slug) => pickSubject(slug), subject)}
          {subject && (
            <>
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <select
                  className="rounded-full px-4 py-2 text-[13.5px] cursor-pointer"
                  style={{ border: "1.5px solid var(--line)", background: "var(--card-bg)", color: "var(--ink)" }}
                  value={topic}
                  onChange={(e) => { setTopic(e.target.value); setIdx(0); }}
                >
                  <option value="all">Entire subject</option>
                  {topics.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                </select>
                <button
                  onClick={() => { setBuildersOnly(!buildersOnly); setIdx(0); }}
                  className={`btn !py-1.5 !px-4 !text-[13px] ${buildersOnly ? "btn-leaf" : "btn-secondary"}`}
                  aria-pressed={buildersOnly}
                >
                  Builders only{buildersOnly ? " ✓" : ""}
                </button>
                <div className="flex gap-1.5">
                  {(["all", "free", "premium"] as Access[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => { setAccess(a); setIdx(0); }}
                      className={`btn !py-1.5 !px-4 !text-[13px] ${access === a ? "btn-primary" : "btn-secondary"}`}
                    >
                      {a === "all" ? "All" : a === "free" ? "Free years" : "Archive"}
                    </button>
                  ))}
                </div>
                <span className="mono text-[12.5px] muted ml-auto">
                  {session.length ? `${session.length} questions in this pool` : "0 questions"}
                </span>
              </div>
              {buildersOnly && topic !== "all" && (
                <div className="mt-2.5">{constructiveNote(session.length)}</div>
              )}

              {loading ? (
                <div className="card p-8 mt-6 text-center muted text-[14px]">Loading the pool…</div>
              ) : emptyNote ? (
                <div className="card p-6 mt-6 text-[14px]">{emptyNote}</div>
              ) : !session.length ? (
                <div className="card p-8 mt-6 text-center">
                  <p className="text-[17px] font-semibold">
                    {buildersOnly ? "No constructive questions in this pool" : "Nothing here yet"}
                  </p>
                  <p className="muted text-[14px] mt-1">
                    {buildersOnly
                      ? "Builders are the multi-step questions where you construct the answer. Try another topic, or turn the builder filter off."
                      : "Try another topic, or switch the filter back to All."}
                  </p>
                </div>
              ) : (
                <div className="mt-8">
                  <button className="btn btn-zest text-[16px] px-7 py-3.5" onClick={openReels}>
                    Enter the stream
                  </button>
                  <p className="muted text-[13.5px] mt-3 max-w-[64ch] leading-relaxed">
                    In the stream: swipe or scroll between questions, tap an option to answer — or use keys
                    <span className="inline-flex mx-1.5 gap-1">
                      {["A", "B", "C", "D", "N", "P"].map((k) => (
                        <kbd
                          key={k}
                          className="mono text-[11px] font-semibold"
                          style={{ border: "1.5px solid var(--line)", borderRadius: 8, background: "var(--card-bg)", padding: "1px 6px" }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                    — the same keys the exam hall itself gives you.
                  </p>
                  <div className="mt-7 grid sm:grid-cols-3 gap-3.5 max-w-3xl">
                    {(session[0] ? [session[0], session[1] ?? session[0], session[2] ?? session[0]] : []).map((preview, i) => (
                      <button
                        key={preview.id}
                        className="card-flat p-4 text-left hover:-translate-y-0.5 transition-transform"
                        onClick={openReels}
                      >
                        <span className="mono text-[11px] px-2 py-1 rounded-full" style={{ background: "var(--paper-2)" }}>
                          {preview.year} · Q{String(preview.qnum).padStart(2, "0")}
                          {preview.kind === "multi" && (preview.steps?.length ?? 0) > 1 ? " · builder" : ""}
                        </span>
                        <span className="block mt-2.5 text-[13.5px] leading-snug line-clamp-3">{preview.stem.slice(0, 120)}…</span>
                        <span className="block mt-2.5 text-[12px] font-semibold" style={{ color: "var(--zest-deep)" }}>Open in the stream</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <MediaPanel panel={panel} onClose={() => setPanel(null)} />
    </div>
  );

  /* ---- reels overlay ------------------------------------------------ */
  const reels = (
    <div className="reels" role="region" aria-label="Question stream">
      {/* floating chrome */}
      <div className="reel-chip-top">
        <button
          className="btn glass-ink !py-2 !px-4 !text-[13px]"
          style={{ border: "1.5px solid var(--card-bg)" }}
          onClick={() => { setReelsOpen(false); sfx("tick"); }}
        >
          ✕ Exit
        </button>
        <span className="mono chip chip-soft" style={{ cursor: "default" }}>
          {sessionLabel} {session.length ? `· ${Math.min(idx + 1, session.length)}/${session.length}` : ""}
        </span>
        {mode === "mock" && mockScore && (
          <span className="mono chip" style={{ cursor: "default", background: "var(--zest)", color: "#fff7ed" }}>
            Σ {mockScore.total}/400
          </span>
        )}
      </div>

      {/* progress rail */}
      <div className="reel-rail" aria-hidden="true">
        {session.slice(0, 90).map((_: Question, i: number) => (
          <button
            key={i}
            className="reel-dot"
            data-on={i === idx ? "1" : "0"}
            aria-label={`Go to question ${i + 1}`}
            onClick={() => { setIdx(i); scrollTo(i); }}
          />
        ))}
      </div>

      {/* mock: switch between subject blocks from the bottom of the hall */}
      {mode === "mock" && mockScore && (
        <div className="mock-panel" role="tablist" aria-label="Mock subject blocks">
          {mockScore.detail.map((d, k) => {
            const b = mockBlocks[k];
            if (!b) return null;
            const active = idx >= b.start && idx < b.start + b.count;
            return (
              <button
                key={d.subject}
                className="mock-chip"
                data-on={active ? "1" : "0"}
                onClick={() => { setIdx(b.start); scrollTo(b.start); sfx("tick"); }}
              >
                <span className="font-semibold">{subjects.find((s) => s.slug === d.subject)?.name ?? d.subject}</span>
                <span className="mono">{d.answered}/{d.count} · {d.pts}</span>
              </button>
            );
          })}
          <span className="mock-chip mono" data-total="1">Σ {mockScore.total}/400</span>
        </div>
      )}

      <div ref={reelRef} className="reels-scroller">
        {session.map((qq, i) => {
          const thisLocked = !qq.is_free && !premium;
          return (
            <section key={qq.id} className="reel-section" data-i={i}>
              <div className="reel-body">
                {thisLocked ? (
                  <div className="slip p-7 pl-9 text-center w-full max-w-lg">
                    <div className="barcode mx-auto" style={{ maxWidth: 260 }} aria-hidden="true" />
                    <p className="mono text-[11px] tracking-[0.14em] mt-3" style={{ color: "var(--muted)" }}>
                      NO. {qq.subject_slug.toUpperCase()}-{qq.year}-{String(qq.qnum).padStart(3, "0")} — ARCHIVE
                    </p>
                    <p className="display text-[22px] mt-2">This one is in the archive</p>
                    <p className="muted text-[14.5px] mt-1.5 leading-relaxed">
                      Questions from 2000–2020 live behind Past Graph Premium — ₦750 for the full
                      six-month UTME season, Pathfinder included.
                    </p>
                    <div className="mt-5 flex gap-2 justify-center flex-wrap">
                      <a href="/pricing" className="btn btn-zest" onClick={() => sfx("lock")}>See Premium</a>
                      <button
                        className="btn btn-secondary"
                        onClick={() => { const n = Math.min(i + 1, session.length - 1); setIdx(n); scrollTo(n); }}
                      >
                        Skip ahead
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <QuestionView
                      q={qq}
                      answered={Boolean(picks[qq.id])}
                      picked={picks[qq.id]?.letter ?? null}
                      onPick={onPick}
                      onConstructed={markConstructed}
                      constructed={Boolean(constructed[qq.id])}
                      showSubject={mode === "mock"}
                    />
                    {!picks[qq.id] && i === idx && (
                      <div className="w-full max-w-lg">
                        {!hint ? (
                          <div className="flex items-center gap-2.5">
                            <button
                              className="chip chip-soft !py-1.5"
                              disabled={hintBusy}
                              onClick={askHint}
                              style={{ cursor: hintBusy ? "wait" : "pointer" }}
                            >
                              {hintBusy ? "Thinking…" : "Hint"}
                            </button>
                            <span className="text-[11.5px] muted">a nudge, never the answer</span>
                          </div>
                        ) : (
                          <div className="card-flat p-4">
                            <span className="mono text-[10px] tracking-[0.14em] font-semibold" style={{ color: "var(--zest-deep)" }}>HINT</span>
                            <span className="block text-[14px] leading-relaxed mt-1">{hint}</span>
                          </div>
                        )}
                        {hintNote && <p className="text-[12px] muted mt-1.5">{hintNote}</p>}
                      </div>
                    )}
                    {Boolean(picks[qq.id]) && i === idx && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-lg">
                        {recs.videos.slice(0, 1).map((v) => (
                          <button
                            key={v.id}
                            className="card-flat p-3.5 text-left hover:-translate-y-0.5 transition-transform"
                            onClick={() => { sfx("open"); setPanel({ type: "video", data: v }); }}
                          >
                            <span className="block text-[12.5px] font-semibold leading-snug">▶ {v.title}</span>
                            <span className="block text-[11px] muted mt-0.5">{v.channel}</span>
                          </button>
                        ))}
                        {recs.sims.slice(0, 1).map((s) => (
                          <button
                            key={s.slug}
                            className="card-flat p-3.5 text-left hover:-translate-y-0.5 transition-transform"
                            onClick={() => { sfx("open"); setPanel({ type: "sim", data: s }); }}
                          >
                            <span className="block text-[12.5px] font-semibold leading-snug">⌁ {s.title}</span>
                            <span className="block text-[11px] muted mt-0.5">simulation</span>
                          </button>
                        ))}
                        {recs.articles.slice(0, 1).map((a) => (
                          <button
                            key={a.slug}
                            className="card-flat p-3.5 text-left hover:-translate-y-0.5 transition-transform"
                            onClick={() => { sfx("open"); setPanel({ type: "article", data: a }); }}
                          >
                            <span className="block text-[12.5px] font-semibold leading-snug">◫ {a.title}</span>
                            <span className="block text-[11px] muted mt-0.5">{a.read_min} min read</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <MediaPanel panel={panel} onClose={() => setPanel(null)} />
    </div>
  );

  return reelsOpen ? reels : entry;
}
