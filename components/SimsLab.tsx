"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Sim } from "@/lib/types";
import SimView from "./Sim";

export default function SimsLab() {
  const supabase = useMemo(() => createClient(), []);
  const [sims, setSims] = useState<Sim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("sims").select("*").order("title");
      setSims((data as Sim[]) ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
      <h1 className="display text-[34px] sm:text-[44px]">Sims lab</h1>
      <p className="muted mt-1.5 text-[15px] max-w-[65ch]">
        Move a slider, watch the model redraw. These same canvases open beside questions and timestamped videos.
      </p>
      {loading ? (
        <p className="muted text-[14px] mt-10">Loading…</p>
      ) : (
        <div className="mt-7 grid md:grid-cols-2 gap-5">
          {sims.map((s) => <SimView key={s.slug} sim={s} />)}
        </div>
      )}
    </div>
  );
}
