"use client";

/**
 * Annotation blanks — the token-tray question kind.
 *
 * The stem carries slots marked ___1___, ___2___, …; `options` is the word
 * bank (label = the token's letter, text = the token itself) and `answer` is
 * the comma-joined token labels in slot order ("B,A,D,C").
 *
 * Mobile-first interaction: tap a token, then tap its slot — drag works on
 * desktop as the garnish. Tokens are single-use; clearing a slot returns the
 * token to the tray. One commit: "Lock in the blanks" records the arrangement.
 */
import { useMemo, useState, type ReactNode } from "react";
import type { Question } from "@/lib/types";
import MathText from "./MathText";

const SLOT_RE = /___(\d+)___/g;

export default function BlankView({
  q,
  answered,
  picked,
  onPick,
}: {
  q: Question;
  answered: boolean;
  picked: string | null;
  onPick: (q: Question, answer: string) => void;
}) {
  const slots = useMemo(() => [...q.stem.matchAll(SLOT_RE)].map((m) => Number(m[1])), [q.stem]);
  const tokens = q.options ?? [];
  const byLabel = useMemo(() => new Map(tokens.map((t) => [t.label, t.text])), [tokens]);

  /* review: the committed arrangement, colored against the real answer */
  const review = useMemo(
    () => (picked ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    [picked]
  );
  const truth = useMemo(() => q.answer.split(",").map((s) => s.trim()), [q.answer]);

  const [place, setPlace] = useState<Record<number, string>>({});
  const [armed, setArmed] = useState<string | null>(null);
  const usedLabels = new Set(Object.values(place));

  function dropIn(slot: number, label: string | null) {
    if (!label) return;
    setPlace((p) => {
      const next = { ...p };
      /* a token sits in exactly one slot: moving it vacates wherever it was */
      for (const k of Object.keys(next)) {
        const n = Number(k);
        if (n !== slot && next[n] === label) delete next[n];
      }
      next[slot] = label;
      return next;
    });
    setArmed(null);
  }

  function clearSlot(slot: number) {
    setPlace((p) => {
      const next = { ...p };
      delete next[slot];
      return next;
    });
  }

  function commit() {
    if (!slots.length) return;
    const order = slots.map((s) => place[s] ?? "");
    if (order.some((x) => !x)) return;
    onPick(q, order.join(","));
  }

  /* ---------- review (answered): static, colored, honest ---------- */
  if (answered) {
    return (
      <p className="leading-relaxed qtext mt-3.5 text-[15.5px]">
        {renderStem(q.stem, (slot, i) => {
          const got = review[i] ?? "";
          const ok = got === truth[i];
          return (
            <span
              key={slot}
              className="blank-slot blank-slot-static"
              data-ok={ok ? "1" : "0"}
              data-got={got ? "1" : "0"}
            >
              {got ? byLabel.get(got) ?? got : "—"}
            </span>
          );
        })}
      </p>
    );
  }

  if (!slots.length) {
    return <p className="muted text-[14px]">This fill-in question is missing its slots — skip it.</p>;
  }

  /* ---------- play: tap-then-place, drag on desktop ---------- */
  const filled = slots.every((s) => place[s]);
  return (
    <div className="mt-3.5">
      <div className="blank-tray" role="listbox" aria-label="Word bank">
        <span className="mono text-[10px] tracking-[0.14em]" style={{ color: "var(--muted)" }}>
          WORD BANK
        </span>
        <div className="blank-tokens">
          {tokens.map((t) => {
            const used = usedLabels.has(t.label);
            const isArmed = armed === t.label;
            return (
              <button
                key={t.label}
                className={`blank-token ${isArmed ? "armed" : ""}`}
                disabled={used}
                data-used={used ? "1" : "0"}
                onClick={() => setArmed(isArmed ? null : t.label)}
                draggable={!used}
                onDragStart={(e) => {
                  setArmed(t.label);
                  e.dataTransfer.setData("text/plain", t.label);
                }}
              >
                <span className="mono text-[10px] opacity-60">{t.label}</span> {t.text}
              </button>
            );
          })}
        </div>
      </div>

      <p className="leading-relaxed qtext text-[15.5px] mt-3">
        {renderStem(q.stem, (slot, i) => {
          const label = place[slot];
          return (
            <button
              key={slot}
              className={`blank-slot ${label ? "filled" : ""} ${armed && !label ? "armed-target" : ""}`}
              onClick={() => (label ? clearSlot(slot) : armed ? dropIn(slot, armed) : undefined)}
              onDragOver={(e) => {
                if (armed) e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                dropIn(slot, armed ?? e.dataTransfer.getData("text/plain"));
              }}
              aria-label={`Slot ${i + 1}${label ? `, filled with ${byLabel.get(label)}` : ", empty"}`}
            >
              {label ? byLabel.get(label) : `＿${i + 1}`}
            </button>
          );
        })}
      </p>

      <div className="flex items-center gap-2.5 mt-3 flex-wrap">
        <button
          className="btn btn-primary !py-2 !px-4 !text-[13.5px]"
          disabled={!filled}
          style={{ opacity: filled ? 1 : 0.45 }}
          onClick={commit}
        >
          Lock in the blanks
        </button>
        <button className="chip chip-soft !py-1.5" onClick={() => { setPlace({}); setArmed(null); }}>
          Clear
        </button>
        <span className="text-[11.5px] muted">
          {armed ? "now tap the slot it belongs in" : "tap a token, then its slot — or drag"}
        </span>
      </div>
    </div>
  );
}

/* Renders the stem, swapping ___n___ markers for interactive slot elements. */
function renderStem(stem: string, renderSlot: (slot: number, index: number) => ReactNode): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of stem.matchAll(SLOT_RE)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(<MathText key={`t${i}`} text={stem.slice(last, at)} />);
    parts.push(renderSlot(Number(m[1]), i));
    last = at + m[0].length;
    i++;
  }
  if (last < stem.length) parts.push(<MathText key={`t${i}`} text={stem.slice(last)} />);
  return parts;
}
