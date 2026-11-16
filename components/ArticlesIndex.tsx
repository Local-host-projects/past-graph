"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Article } from "@/lib/types";
import { isPremiumArticle } from "@/lib/premium-content";

export default function ArticlesIndex() {
  const supabase = useMemo(() => createClient(), []);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data }, me] = await Promise.all([
        supabase.from("articles").select("*").order("created_at"),
        fetch("/api/me").then((r) => r.json()).catch(() => ({ premium: false })),
      ]);
      setArticles((data as Article[]) ?? []);
      setPremium(Boolean((me as { premium?: boolean }).premium));
      setLoading(false);
    })();
  }, [supabase]);

  const free = useMemo(() => articles.filter((a) => !isPremiumArticle(a.slug)), [articles]);
  const paid = useMemo(() => articles.filter((a) => isPremiumArticle(a.slug)), [articles]);

  function shelf(list: Article[], title: string, locked: boolean) {
    if (!list.length) return null;
    return (
      <section className="mt-8">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="display text-[22px]">{title}</h2>
          <span className="chip !py-1 !px-3 text-[11.5px]">{list.length} {list.length === 1 ? "piece" : "pieces"}</span>
          {locked && <span className="chip chip-leaf !py-1 !px-3 text-[11.5px]">🔓 Included with Premium</span>}
        </div>
        <div className="mt-2 divide-y divide-[var(--hairline)]">
          {list.map((a) => (
            <a key={a.slug} href={`/articles/${a.slug}`} className="block py-5 group">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-[19px] font-semibold tracking-tight group-hover:text-[var(--accent)] transition-colors">{a.title}</h3>
                  <p className="muted text-[14px] mt-1 max-w-[70ch] leading-relaxed">{a.summary}</p>
                  <p className="text-[12.5px] muted mt-2">{a.read_min} min read · {a.subject_slug}</p>
                </div>
                {locked && <span className="chip !py-1 !px-2.5 text-[11px] shrink-0">★ Premium</span>}
              </div>
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
      <h1 className="display text-[34px] sm:text-[44px]">Articles</h1>
      <p className="muted mt-1.5 text-[15px] max-w-[65ch]">
        Short, exam-shaped reading. Each piece connects to a simulation and the questions where it applies.
      </p>

      {loading ? (
        <p className="muted text-[14px] mt-10">Loading…</p>
      ) : !articles.length ? (
        <div className="card p-8 mt-8 text-center">
          <p className="text-[17px] font-semibold">No articles yet</p>
          <p className="muted text-[14px] mt-1">Seed the database to load the library.</p>
        </div>
      ) : (
        <>
          {shelf(free, "Free — the starter shelf", false)}
          {shelf(paid, "Premium — the deep shelf", !premium)}
        </>
      )}
    </div>
  );
}
