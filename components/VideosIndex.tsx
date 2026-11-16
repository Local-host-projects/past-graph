"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Video } from "@/lib/types";
import { isPremiumVideo } from "@/lib/premium-content";

export default function VideosIndex() {
  const supabase = useMemo(() => createClient(), []);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data }, me] = await Promise.all([
        supabase.from("videos").select("*").order("created_at", { ascending: true }),
        fetch("/api/me").then((r) => r.json()).catch(() => ({ premium: false })),
      ]);
      setVideos((data as Video[]) ?? []);
      setPremium(Boolean((me as { premium?: boolean }).premium));
      setLoading(false);
    })();
  }, [supabase]);

  const free = useMemo(() => videos.filter((v) => !isPremiumVideo(v.youtube_id)), [videos]);
  const paid = useMemo(() => videos.filter((v) => isPremiumVideo(v.youtube_id)), [videos]);

  function shelf(list: Video[], title: string, note: string, locked: boolean) {
    if (!list.length) return null;
    return (
      <section className="mt-9">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="display text-[22px]">{title}</h2>
          <span className="chip !py-1 !px-3 text-[11.5px]">{list.length} {list.length === 1 ? "video" : "videos"}</span>
          {locked && <span className="chip chip-leaf !py-1 !px-3 text-[11.5px]">🔓 Included with Premium</span>}
        </div>
        <p className="muted text-[13.5px] mt-1">{note}</p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((v) => (
            <a key={v.id} href={`/videos/${v.id}`} className="group">
              <div className="relative rounded-2xl overflow-hidden bg-[var(--bg-2)] aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                {locked && <span className="absolute top-2.5 right-2.5 chip !py-1 !px-2.5 text-[11px]">★ Premium</span>}
              </div>
              <h3 className="mt-2.5 text-[15px] font-semibold leading-snug tracking-tight">{v.title}</h3>
              <p className="text-[13px] muted mt-0.5">{v.channel}</p>
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
      <h1 className="display text-[34px] sm:text-[44px]">Video index</h1>
      <p className="muted mt-1.5 text-[15px] max-w-[65ch]">
        Explainers indexed to the exact timestamp where they unlock a topic — and sectioned for
        retrieval: watch a new section and it quizzes you on the one before it. Play one and a
        pop-up will find you; the simulation opens beside the running video.
      </p>

      {loading ? (
        <p className="muted text-[14px] mt-10">Loading…</p>
      ) : !videos.length ? (
        <div className="card p-8 mt-8 text-center">
          <p className="text-[17px] font-semibold">The index is empty</p>
          <p className="muted text-[14px] mt-1">Run supabase/seed.sql in the Supabase SQL editor to load the researched catalog.</p>
        </div>
      ) : (
        <>
          {shelf(free, "Free — the onramp", "Core explainers every candidate should watch. Timed notes, sims, and section quizzes included.", false)}
          {shelf(paid, "Premium archive", "Long-form deep-dives and the second-order pieces — full arc, quiz checkpoints at every section boundary.", !premium)}
        </>
      )}
    </div>
  );
}
