"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Article } from "@/lib/types";

export default function ArticlesIndex() {
  const supabase = useMemo(() => createClient(), []);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("articles").select("*").order("created_at");
      setArticles((data as Article[]) ?? []);
      setLoading(false);
    })();
  }, [supabase]);

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
        <div className="mt-7 divide-y divide-[var(--hairline)]">
          {articles.map((a) => (
            <a key={a.slug} href={`/articles/${a.slug}`} className="block py-5 group">
              <h2 className="text-[19px] font-semibold tracking-tight group-hover:text-[var(--accent)] transition-colors">{a.title}</h2>
              <p className="muted text-[14px] mt-1 max-w-[70ch] leading-relaxed">{a.summary}</p>
              <p className="text-[12.5px] muted mt-2">{a.read_min} min read · {a.subject_slug}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
