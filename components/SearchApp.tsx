"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Article, Topic, Video } from "@/lib/types";

export default function SearchApp() {
  const supabase = useMemo(() => createClient(), []);
  const [q, setQ] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    (async () => {
      const [t, a, v] = await Promise.all([
        supabase.from("topics").select("*"),
        supabase.from("articles").select("slug,title,summary,subject_slug,topic_slug,read_min"),
        supabase.from("videos").select("*"),
      ]);
      setTopics((t.data as Topic[]) ?? []);
      setArticles((a.data as Article[]) ?? []);
      setVideos((v.data as Video[]) ?? []);
    })();
  }, [supabase]);

  const needle = q.trim().toLowerCase();
  const fTopics = needle ? topics.filter((t) => `${t.name} ${t.blurb}`.toLowerCase().includes(needle)) : [];
  const fArticles = needle ? articles.filter((a) => `${a.title} ${a.summary}`.toLowerCase().includes(needle)) : [];
  const fVideos = needle ? videos.filter((v) => `${v.title} ${v.blurb} ${v.channel}`.toLowerCase().includes(needle)) : [];

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="display text-[34px] sm:text-[44px]">Search the graph</h1>
      <p className="muted mt-1.5 text-[15px]">Topics, explainers and articles — type a concept, not a menu.</p>

      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="projectile, moles, concord, quadratic…"
        className="mt-6 w-full rounded-2xl border border-[var(--hairline)] bg-white px-5 py-4 text-[17px] outline-none focus:border-[var(--accent)] transition-colors"
      />

      {needle && (
        <div className="mt-7 grid gap-6">
          {fTopics.length > 0 && (
            <section>
              <p className="text-[13px] font-semibold tracking-tight mb-2">Topics</p>
              {fTopics.map((t) => (
                <a key={t.slug} href={`/practice`} className="block py-2.5 border-b border-[var(--hairline)]">
                  <span className="text-[15px] font-medium">{t.name}</span>
                  <span className="block text-[13px] muted">{t.blurb}</span>
                </a>
              ))}
            </section>
          )}
          {fVideos.length > 0 && (
            <section>
              <p className="text-[13px] font-semibold tracking-tight mb-2">Videos</p>
              {fVideos.map((v) => (
                <a key={v.id} href={`/videos/${v.id}`} className="block py-2.5 border-b border-[var(--hairline)]">
                  <span className="text-[15px] font-medium">{v.title}</span>
                  <span className="block text-[13px] muted">{v.channel}</span>
                </a>
              ))}
            </section>
          )}
          {fArticles.length > 0 && (
            <section>
              <p className="text-[13px] font-semibold tracking-tight mb-2">Articles</p>
              {fArticles.map((a) => (
                <a key={a.slug} href={`/articles/${a.slug}`} className="block py-2.5 border-b border-[var(--hairline)]">
                  <span className="text-[15px] font-medium">{a.title}</span>
                  <span className="block text-[13px] muted">{a.summary}</span>
                </a>
              ))}
            </section>
          )}
          {!fTopics.length && !fVideos.length && !fArticles.length && (
            <p className="muted text-[14px]">Nothing matched “{q}”. Try a shorter concept word.</p>
          )}
        </div>
      )}
    </div>
  );
}
