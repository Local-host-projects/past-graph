"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { ComboRow } from "@/lib/types";
import AdvisorChat from "./AdvisorChat";
import { sfx } from "@/lib/sfx";

/* brochure names → the subjects Past Graph actually holds papers for */
const SLUG_MAP: Record<string, string> = {
  "english": "english",
  "english language": "english",
  "use of english": "english",
  "mathematics": "mathematics",
  "maths": "mathematics",
  "further mathematics": "mathematics",
  "physics": "physics",
  "chemistry": "chemistry",
  "biology": "biology",
  "economics": "economics",
};
const COMBO_ORDER = ["english", "mathematics", "physics", "chemistry", "biology", "economics"];

function comboToSlugs(subs: string[]): string[] {
  const set = new Set<string>();
  for (const raw of ["english", ...subs]) { // English is compulsory, always leads
    const s = SLUG_MAP[String(raw).trim().toLowerCase()];
    if (s) set.add(s);
  }
  return COMBO_ORDER.filter((s) => set.has(s)).slice(0, 4); // the hall allows four, never five
}

export default function PathfinderApp() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<ComboRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedCombo, setSavedCombo] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("jamb_combos").select("*").order("course");
      setRows((data as ComboRow[]) ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  const needle = q.trim().toLowerCase();
  const matches = needle
    ? rows.filter((r) =>
        `${r.career} ${r.course} ${r.master_key} ${r.jamb_subjects.join(" ")} ${r.notes}`
          .toLowerCase()
          .includes(needle)
      )
    : rows.slice(0, 6);

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="display text-[34px] sm:text-[44px]">Pathfinder</h1>
      <p className="muted mt-1.5 text-[15px] max-w-[65ch]">
        Find the UTME subjects that actually open your course — plus the O&apos;level caveat and the mistake that
        voids results. The final authority is always the JAMB brochure; this is the map before you register.
      </p>

      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Medicine, Law, Engineering, Accounting, Computer Science…"
        className="mt-6 w-full rounded-2xl border border-[var(--hairline)] bg-white px-5 py-4 text-[17px] outline-none focus:border-[var(--accent)] transition-colors"
      />

      {loading ? (
        <p className="muted text-[14px] mt-8">Loading combinations…</p>
      ) : (
        <div className="mt-7 grid gap-4">
          {matches.map((r) => (
            <div key={r.id} className="card p-5 sm:p-6 rise">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-[19px] font-semibold tracking-tight">{r.course}</h2>
                <span className="chip">{r.career}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="chip" style={{ background: "var(--ink)", color: "#fff" }}>English (compulsory)</span>
                {r.jamb_subjects.map((s) => (
                  <span key={s} className="chip" style={{ background: "rgba(0,113,227,0.1)", color: "var(--accent)" }}>{s}</span>
                ))}
              </div>
              <p className="mt-3 text-[14px] leading-relaxed"><strong className="font-semibold">Master key:</strong> {r.master_key}</p>
              <p className="mt-1 text-[14px] leading-relaxed muted"><strong className="font-semibold text-[var(--ink)]">O&apos;level:</strong> {r.olevel_note}</p>
              {r.notes && <p className="mt-2 text-[13px] muted leading-relaxed">{r.notes}</p>}
              <div className="mt-4 flex items-center gap-2.5 flex-wrap">
                <button
                  className={`btn !py-2 !px-4 !text-[13px] ${savedCombo === r.id ? "btn-leaf" : "btn-secondary"}`}
                  onClick={() => {
                    try { window.localStorage.setItem("pg_combo", JSON.stringify(comboToSlugs(r.jamb_subjects))); } catch { /* private mode */ }
                    setSavedCombo(r.id);
                    sfx("tick");
                  }}
                >
                  {savedCombo === r.id ? "Mock combo set ✓" : "Use this combo in Mock"}
                </button>
                <a href="/practice?mode=mock" className="text-[12.5px] muted hover:underline">open Year mock →</a>
              </div>
              {savedCombo === r.id && (
                <p className="text-[12.5px] muted mt-1.5">
                  Year mock now opens with {comboToSlugs(r.jamb_subjects).join(" + ")} — English first, four subjects max, scored over 400.
                </p>
              )}
            </div>
          ))}
          {!matches.length && (
            <p className="muted text-[14px]">No combination found for “{q}”. Try a broader course name like “science”, “law” or “engineering”.</p>
          )}
        </div>
      )}

      <AdvisorChat />
    </div>
  );
}
