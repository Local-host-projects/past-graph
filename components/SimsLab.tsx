"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Sim } from "@/lib/types";
import SimView from "./Sim";
import { isPremiumSim } from "@/lib/premium-content";

export default function SimsLab() {
  const supabase = useMemo(() => createClient(), []);
  const [sims, setSims] = useState<Sim[]>([]);
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data }, me] = await Promise.all([
        supabase.from("sims").select("*").order("title"),
        fetch("/api/me").then((r) => r.json()).catch(() => ({ premium: false })),
      ]);
      setSims((data as Sim[]) ?? []);
      setPremium(Boolean((me as { premium?: boolean }).premium));
      setLoading(false);
    })();
  }, [supabase]);

  const free = useMemo(() => sims.filter((s) => !isPremiumSim(s.slug)), [sims]);
  const paid = useMemo(() => sims.filter((s) => isPremiumSim(s.slug)), [sims]);

  function shelf(list: Sim[], title: string, locked: boolean) {
    if (!list.length) return null;
    return (
      <section className="mt-8">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="display text-[22px]">{title}</h2>
          <span className="chip !py-1 !px-3 text-[11.5px]">{list.length} {list.length === 1 ? "model" : "models"}</span>
          {locked && <span className="chip chip-leaf !py-1 !px-3 text-[11.5px]">🔓 Included with Premium</span>}
        </div>
        <div className="mt-4 grid md:grid-cols-2 gap-5">
          {list.map((s) => (
            <div key={s.slug} className="relative">
              <SimView sim={s} locked={locked} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
      <h1 className="display text-[34px] sm:text-[44px]">Sims lab</h1>
      <p className="muted mt-1.5 text-[15px] max-w-[65ch]">
        Grab them. Every model here answers to your hand — aim the cannon, stretch the wave, drag the resistor.
        These same boards open beside questions and timestamped videos.
      </p>
      {loading ? (
        <p className="muted text-[14px] mt-10">Loading…</p>
      ) : (
        <>
          {shelf(free, "Free — start here", false)}
          {shelf(paid, "Premium — advanced models", !premium)}
        </>
      )}
    </div>
  );
}
