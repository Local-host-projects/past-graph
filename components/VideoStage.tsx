"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Video, Annotation, Sim, Article } from "@/lib/types";
import SimView from "./Sim";
import { sfx } from "@/lib/sfx";

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

function loadYouTubeAPI(): Promise<any> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
    /* Poll instead of trusting the ready callback: the callback fires only on the
       script's very first load, never on component remounts after that. */
    const poll = () => {
      if (window.YT?.Player) return resolve(window.YT);
      setTimeout(poll, 90);
    };
    poll();
  });
}

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Panel = { kind: "sim" | "article" | "note"; sim?: Sim; article?: Article; note?: Annotation };

/* Drag geometry: fraction of the wide grid owned by the video pane. */
const SPLIT_DEFAULT = 0.58;
const SPLIT_STOPS = [0.42, 0.58, 0.68];
const SPLIT_MIN = 0.3;
const SPLIT_MAX = 0.74;

function rubberband(overshoot: number, constant = 0.55) {
  const dim = 1; // fraction domain
  return (overshoot * dim * constant) / (dim + constant * Math.abs(overshoot));
}

export default function VideoStage() {
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();
  /* deep start: `?t=<seconds>` — feed clip chips land the viewer inside a slice */
  const bootT = useMemo(() => {
    const raw = Number(sp.get("t"));
    return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const supabase = useMemo(() => createClient(), []);
  const playerRef = useRef<any>(null);
  const playerBox = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [video, setVideo] = useState<Video | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [now, setNow] = useState(0);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [loading, setLoading] = useState(true);
  const [wide, setWide] = useState(false);

  /* ---- side-by-side when the viewport is wider than tall (incl. rotated phones) ---- */
  useEffect(() => {
    const mq = window.matchMedia("(min-aspect-ratio: 6/5)");
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const reducedMotion = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
  }, []);

  /* ---- load video + annotations -------------------------------------------------- */
  useEffect(() => {
    (async () => {
      const { data: v } = await supabase.from("videos").select("*").eq("id", params.id).maybeSingle();
      setVideo(v as Video);
      if (v) {
        const { data: a } = await supabase.from("video_annotations").select("*").eq("video_id", v.id).order("t_start");
        setAnnotations((a as Annotation[]) ?? []);
      }
      setLoading(false);
    })();
  }, [params.id, supabase]);

  /* ---- player + currentTime polling --------------------------------------------- */
  useEffect(() => {
    if (!video) return;
    let timer: ReturnType<typeof setInterval>;
    let cancelled = false;
    (async () => {
      const YT = await loadYouTubeAPI();
      if (cancelled || !playerBox.current) return;
      playerRef.current = new YT.Player(playerBox.current, {
        videoId: video.youtube_id,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (e: any) => {
            if (bootT != null) e.target.seekTo(bootT, true);
            e.target.playVideo();
          },
        },
      });
      timer = setInterval(() => {
        try {
          const t = playerRef.current?.getCurrentTime?.();
          if (typeof t === "number") setNow(t);
        } catch {}
      }, 250);
    })();
    return () => {
      cancelled = true;
      clearInterval(timer);
      try { playerRef.current?.destroy?.(); } catch {}
      playerRef.current = null;
    };
  }, [video, bootT]);

  /* ---- the live slice: the annotation window the viewer is inside right now ---- */
  const live = annotations.find((a) => now >= a.t_start && now < a.t_end && a.id !== dismissed);

  /* ---- split divider: 1:1 tracking, rubber-band bounds, velocity spring handoff --- */
  const drag = useRef<{ startX: number; startSplit: number; width: number; history: { t: number; x: number }[] } | null>(null);
  const springRef = useRef<number | null>(null);

  function cancelSpring() {
    if (springRef.current !== null) {
      cancelAnimationFrame(springRef.current);
      springRef.current = null;
    }
  }

  const splitValue = useRef(SPLIT_DEFAULT);

  function setSplit(v: number) {
    splitValue.current = v;
    gridRef.current?.style.setProperty("--split", v.toFixed(4));
  }

  function springTo(target: number, velocity: number) {
    cancelSpring();
    if (reducedMotion.current || Math.abs(target - splitValue.current) < 0.002) {
      setSplit(target);
      return;
    }
    let x = splitValue.current;
    let v = Math.max(-4, Math.min(4, velocity)); // cap: a violent flick must not explode the integrator
    let last = performance.now();
    let frames = 0;
    const k = 210;              // spring stiffness
    const c = 2 * Math.sqrt(k); // critically damped: no overshoot (damping ratio 1.0)
    const step = () => {
      const t = performance.now();
      const dt = Math.min((t - last) / 1000, 1 / 30);
      last = t;
      const a = -k * (x - target) - c * v;
      v = Math.max(-6, Math.min(6, v + a * dt));
      x = Math.min(SPLIT_MAX + 0.02, Math.max(SPLIT_MIN - 0.02, x + v * dt));
      setSplit(x);
      if ((Math.abs(x - target) < 0.0015 && Math.abs(v) < 0.0015) || ++frames > 300) {
        setSplit(target);
        springRef.current = null;
        return;
      }
      springRef.current = requestAnimationFrame(step);
    };
    springRef.current = requestAnimationFrame(step);
  }

  function onDividerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    cancelSpring();
    const grid = gridRef.current;
    if (!grid) return;
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch { /* synthetic or stale pointer id }; tracking still works while the pointer is over the divider */ }
    drag.current = {
      startX: e.clientX,
      startSplit: splitValue.current,
      width: grid.getBoundingClientRect().width - 26, // usable span (minus the divider lane)
      history: [{ t: performance.now(), x: e.clientX }],
    };
    e.currentTarget.dataset.drag = "1";
  }

  function onDividerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    d.history.push({ t: performance.now(), x: e.clientX });
    if (d.history.length > 8) d.history.shift();
    const raw = d.startSplit + (e.clientX - d.startX) / d.width;
    let v = raw;
    if (raw < SPLIT_MIN) v = SPLIT_MIN - rubberband(SPLIT_MIN - raw);
    else if (raw > SPLIT_MAX) v = SPLIT_MAX + rubberband(raw - SPLIT_MAX);
    setSplit(v);
  }

  function onDividerUp(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    e.currentTarget.dataset.drag = "0";
    /* velocity from the last ~90ms of tracking, in fraction/s */
    const nowT = performance.now();
    const recent = d.history.filter((h) => nowT - h.t < 90);
    const pxPerSec = recent.length >= 2
      ? ((recent[recent.length - 1].x - recent[0].x) / Math.max(1, recent[recent.length - 1].t - recent[0].t)) * 1000
      : 0;
    const velFrac = Math.max(-4, Math.min(4, pxPerSec / d.width));
    /* momentum projection: where the gesture is headed, then the nearest 60/40-ish stop */
    const projected = splitValue.current + velFrac * 0.14;
    const target = SPLIT_STOPS.reduce((best, s) =>
      Math.abs(s - projected) < Math.abs(best - projected) ? s : best
    , SPLIT_STOPS[0]);
    springTo(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, target)), velFrac);
    sfx("tick");
  }

  /* ---- actions ------------------------------------------------------------------ */
  async function openAnnotation(a: Annotation) {
    sfx("open");
    if (a.kind === "sim" && a.sim_slug) {
      const { data } = await supabase.from("sims").select("*").eq("slug", a.sim_slug).maybeSingle();
      setPanel({ kind: "sim", sim: data as Sim });
    } else if (a.kind === "article" && a.article_slug) {
      const { data } = await supabase.from("articles").select("*").eq("slug", a.article_slug).maybeSingle();
      setPanel({ kind: "article", article: data as Article });
    } else {
      setPanel({ kind: "note", note: a });
    }
  }

  function seek(t: number) {
    playerRef.current?.seekTo?.(t, true);
    playerRef.current?.playVideo?.();
    sfx("tick");
  }

  /* Esc closes the companion; O opens the live pill. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && panel) setPanel(null);
      if ((e.key === "o" || e.key === "O") && live) openAnnotation(live);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, live]);

  if (loading) return <div className="max-w-3xl mx-auto py-24 px-6 muted text-[14px]">Loading video…</div>;
  if (!video) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-6">
        <p className="display text-[24px]">Video not found</p>
        <p className="muted text-[14px] mt-1">
          Seed the database first, then refresh. <a className="link-muted underline" href="/videos">Back to videos</a>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <a href="/videos" className="text-[13px] muted hover:underline">← All videos</a>
      <h1 className="display text-[30px] sm:text-[42px] mt-2">{video.title}</h1>
      <p className="muted text-[14px] mt-1">{video.channel} — timestamped for Past Graph</p>

      <div ref={gridRef} className={`watch-grid mt-6 ${wide && panel ? "split" : ""}`}>
        {/* main column: player with the note overlaid ON it, then the timestamp trail */}
        <div className="watch-main min-w-0">
          <div className="slip p-1.5 relative" style={{ boxShadow: "4px 5px 0 rgba(32,26,17,0.14)" }}>
            <div className="relative aspect-video w-full rounded-[14px] overflow-hidden bg-black">
              <div ref={playerBox} className="w-full h-full" />
              {/* the pop-up lives ON the video — unmissable, never docked under it */}
              {live && (
                <div className="watch-overlay" aria-live="polite">
                  <div className="dock-pill pill-arrive w-full max-w-full">
                    <button className="flex items-center gap-2.5 flex-1 text-left min-w-0" onClick={() => openAnnotation(live)}>
                      <span className="pulse-dot inline-block w-2 h-2 rounded-full shrink-0" style={{ background: "var(--zest)" }} />
                      <span className="truncate text-[13px] font-semibold">
                        {live.kind === "sim" ? "Open simulation" : live.kind === "article" ? "Read alongside" : "Deeper look"}:
                        {" "}{live.title}
                      </span>
                      <span className="t ml-1 shrink-0" style={{ opacity: 0.65 }}>{fmt(live.t_start)}</span>
                    </button>
                    <button
                      className="x shrink-0"
                      aria-label="Dismiss this pop-up"
                      onClick={(e) => { e.stopPropagation(); setDismissed(live.id); sfx("tick"); }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* idle line only when nothing is live right now */}
          <div className="min-h-[20px] mt-2">
            {!live && annotations.length > 0 && (
              <p className="text-[12px] muted">Timed notes pop onto the video as the presenter reaches them.</p>
            )}
          </div>

          {/* trail: the whole map, tamper-proof */}
          {annotations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {annotations.map((a) => (
                <button
                  key={a.id}
                  className="trail-pill"
                  data-live={a === live ? "1" : "0"}
                  onClick={() => seek(a.t_start)}
                  title={`Jump to ${fmt(a.t_start)}`}
                >
                  <span className="t">{fmt(a.t_start)}</span>
                  <span>{a.title}</span>
                </button>
              ))}
            </div>
          )}

          <p className="muted text-[13.5px] mt-5 max-w-[65ch] leading-relaxed">{video.blurb}</p>
        </div>

        {/* draggable divider — only exists in the side-by-side layout */}
        {wide && panel && (
          <div
            className="watch-divider"
            role="separator"
            aria-orientation="vertical"
            aria-label="Adjust the split between video and companion"
            onPointerDown={onDividerDown}
            onPointerMove={onDividerMove}
            onPointerUp={onDividerUp}
            onPointerCancel={onDividerUp}
          />
        )}

        {/* companion: deeper explanation, a simulation to play with, or an article */}
        {panel && (
          <aside className="watch-side" aria-label="Companion panel">
            <div className="slip p-5 pl-8 sm:p-6 sm:pl-9 pop min-h-[200px]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {(panel.kind === "note" ? panel.note : null) && (
                    <p className="mono text-[11px] tracking-[0.12em]" style={{ color: "var(--muted)" }}>
                      AT {fmt(panel.note!.t_start)} · NOTE
                    </p>
                  )}
                  {panel.kind === "sim" && <p className="mono text-[11px] tracking-[0.12em]" style={{ color: "var(--muted)" }}>SIMULATION</p>}
                  {panel.kind === "article" && <p className="mono text-[11px] tracking-[0.12em]" style={{ color: "var(--muted)" }}>ARTICLE</p>}
                </div>
                <button className="btn btn-secondary !py-1.5 !px-3.5 !text-[12.5px] shrink-0" onClick={() => setPanel(null)}>
                  ⟵ Video only
                </button>
              </div>

              {panel.kind === "sim" && panel.sim && (
                <div className="mt-4">
                  <h3 className="display text-[20px]">{panel.sim.title}</h3>
                  <p className="text-[13.5px] muted mt-0.5 leading-relaxed">{panel.sim.blurb}</p>
                  <div className="mt-3"><SimView sim={panel.sim} /></div>
                </div>
              )}

              {panel.kind === "article" && panel.article && (
                <div className="mt-3">
                  <h3 className="display text-[20px]">{panel.article.title}</h3>
                  <p className="text-[12.5px] muted mt-0.5">{panel.article.read_min} min read</p>
                  <div className="mt-2">
                    {panel.article.body.split("\n\n").map((b, i) =>
                      b.startsWith("## ") ? (
                        <h4 key={i} className="mt-3 mb-1 text-[14.5px] font-semibold">{b.slice(3)}</h4>
                      ) : b.startsWith("- ") ? (
                        <ul key={i} className="ml-5 list-disc text-[14px]">
                          {b.split("\n").filter(Boolean).map((li, j) => <li key={j}>{li.slice(2)}</li>)}
                        </ul>
                      ) : (
                        <p key={i} className="mt-2 text-[14.5px] leading-relaxed">{b}</p>
                      )
                    )}
                  </div>
                </div>
              )}

              {panel.kind === "note" && panel.note && (
                <div className="mt-3">
                  <h3 className="display text-[21px]">{panel.note.title}</h3>
                  <div className="mt-2">
                    {panel.note.body.split("\n\n").map((b, i) =>
                      b.startsWith("- ") ? (
                        <ul key={i} className="ml-5 list-disc text-[14.5px] leading-relaxed">
                          {b.split("\n").filter(Boolean).map((li, j) => <li key={j}>{li.slice(2)}</li>)}
                        </ul>
                      ) : (
                        <p key={i} className="mt-2 text-[14.5px] leading-relaxed">{b}</p>
                      )
                    )}
                  </div>
                  <button
                    className="btn btn-secondary !py-1.5 !px-3.5 !text-[12.5px] mt-4"
                    onClick={() => seek(panel.note!.t_start)}
                  >
                    ↺ Jump back to {fmt(panel.note.t_start)}
                  </button>
                  <p className="text-[12px] muted mt-2">The video keeps playing while you stay here.</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
