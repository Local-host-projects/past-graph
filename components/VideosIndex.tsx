"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Video } from "@/lib/types";

export default function VideosIndex() {
  const supabase = useMemo(() => createClient(), []);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: true });
      setVideos((data as Video[]) ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
      <h1 className="display text-[34px] sm:text-[44px]">Video index</h1>
      <p className="muted mt-1.5 text-[15px] max-w-[65ch]">
        Explainers we&apos;ve indexed to the exact timestamp where they unlock a topic. Play one and a pop-up will
        find you; open it and the simulation appears beside the running video.
      </p>

      {loading ? (
        <p className="muted text-[14px] mt-10">Loading…</p>
      ) : !videos.length ? (
        <div className="card p-8 mt-8 text-center">
          <p className="text-[17px] font-semibold">The index is empty</p>
          <p className="muted text-[14px] mt-1">Run supabase/seed.sql in the Supabase SQL editor to load the researched catalog.</p>
        </div>
      ) : (
        <div className="mt-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((v) => (
            <a key={v.id} href={`/videos/${v.id}`} className="group">
              <div className="rounded-2xl overflow-hidden bg-[var(--bg-2)] aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${v.youtube_id}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <h2 className="mt-2.5 text-[15px] font-semibold leading-snug tracking-tight">{v.title}</h2>
              <p className="text-[13px] muted mt-0.5">{v.channel}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
