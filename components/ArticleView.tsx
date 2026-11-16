"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Article, Sim, Video } from "@/lib/types";
import { isPremiumArticle } from "@/lib/premium-content";
import SimView from "./Sim";
import MathText from "./MathText";

export default function ArticleView() {
  const params = useParams<{ slug: string }>();
  const supabase = useMemo(() => createClient(), []);
  const [article, setArticle] = useState<Article | null>(null);
  const [sims, setSims] = useState<Sim[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [qCount, setQCount] = useState<number | null>(null);
  const [premium, setPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: a } = await supabase.from("articles").select("*").eq("slug", params.slug).maybeSingle();
      setArticle(a as Article);
      const me = await fetch("/api/me").then((r) => r.json()).catch(() => ({ premium: false }));
      setPremium(Boolean((me as { premium?: boolean }).premium));
      if (a) {
        const { count } = await supabase
          .from("questions")
          .select("id", { count: "exact", head: true })
          .eq("topic_slug", a.topic_slug);
        setQCount(count ?? 0);
        const [s, v] = await Promise.all([
          supabase.from("sims").select("*").eq("topic_slug", a.topic_slug),
          supabase.from("videos").select("*").eq("topic_slug", a.topic_slug).limit(2),
        ]);
        setSims((s.data as Sim[]) ?? []);
        setVideos((v.data as Video[]) ?? []);
      }
      setLoading(false);
    })();
  }, [params.slug, supabase]);

  if (loading) return <p className="max-w-3xl mx-auto px-6 py-16 muted text-[14px]">Loading…</p>;
  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-[20px] font-semibold">Article not found</p>
        <a href="/articles" className="text-[var(--accent)] text-[14px]">← Back to articles</a>
      </div>
    );
  }

  const gated = isPremiumArticle(article.slug) && premium === false;

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
      <a href="/articles" className="text-[13px] muted hover:text-[var(--ink)]">← Articles</a>
      <div className="mt-3 grid lg:grid-cols-[1fr_320px] gap-10 items-start">
        <article>
          <h1 className="display text-[30px] sm:text-[38px]">{article.title}</h1>
          <p className="muted text-[13px] mt-1.5">{article.read_min} min read · {article.subject_slug}</p>
          {qCount !== null && (
            <a
              href={`/practice?mode=wander&subject=${article.subject_slug}&topic=${article.topic_slug}&enter=1`}
              className="chip chip-leaf !text-[12px] mt-3"
              style={{ cursor: "pointer" }}
            >
              Practice this topic · {qCount} questions →
            </a>
          )}
          {gated ? (
            <div className="card p-6 mt-6">
              <p className="mono text-[11px] tracking-[0.14em]" style={{ color: "var(--muted)" }}>PREMIUM · ★</p>
              <p className="text-[15px] mt-2 leading-relaxed max-w-[55ch]">
                The opening is free — the full piece, its worked examples and the linked questions live on the premium shelf.
                ₦750 covers the whole six-month season.
              </p>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <a href="/pricing" className="btn btn-primary !py-2 !px-5 !text-[14px]">Get Premium · ₦750</a>
                <a href="/articles" className="text-[13.5px] muted underline">Free shelf</a>
              </div>
            </div>
          ) : (
          <div className="mt-5 max-w-[68ch]">
            {article.body.split("\n\n").map((b, i) =>
              b.startsWith("## ") ? (
                <h2 key={i} className="text-[21px] font-semibold tracking-tight mt-7 mb-1.5"><MathText text={b.slice(3)} /></h2>
              ) : b.startsWith("- ") ? (
                <ul key={i} className="ml-5 list-disc text-[16px] leading-relaxed mt-2">
                  {b.split("\n").filter(Boolean).map((li, j) => <li key={j} className="mt-1"><MathText text={li.slice(2)} /></li>)}
                </ul>
              ) : (
                <p key={i} className="text-[16px] leading-[1.65] mt-3"><MathText text={b} /></p>
              )
            )}
          </div>
          )}
        </article>
        <aside className="lg:sticky lg:top-16 grid gap-4">
          {sims[0] && <SimView sim={sims[0]} />}
          {videos.map((v) => (
            <a key={v.id} href={`/videos/${v.id}`} className="card-flat p-3.5 hover:shadow-md transition-shadow">
              <span className="block text-[13.5px] font-medium leading-snug">{v.title}</span>
              <span className="block text-[12px] muted mt-0.5">Watch with timestamp pop-ups →</span>
            </a>
          ))}
        </aside>
      </div>
    </div>
  );
}
