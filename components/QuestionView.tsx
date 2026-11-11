"use client";

import type { Question } from "@/lib/types";
import MathText from "./MathText";
import StepScene from "./StepScene";

export default function QuestionView({
  q,
  answered,
  picked,
  onPick,
  onConstructed,
  constructed = true,
  showSubject = false,
  compact = false,
}: {
  q: Question;
  answered: boolean;
  picked: string | null;
  onPick: (q: Question, letter: string) => void;
  onConstructed?: (id: string) => void;
  constructed?: boolean;
  showSubject?: boolean;
  compact?: boolean;
}) {
  const steps = q.kind === "multi" && q.steps && q.steps.length > 1 ? q.steps : null;
  const isMulti = steps !== null;
  const holding = isMulti && !constructed;

  return (
    <div className={`slip ${compact ? "p-4 pl-7 sm:p-5 sm:pl-8" : "p-5 pl-8 sm:p-7 sm:pl-9"}`}>
      {/* slip header: real data, mono, like the exam registry */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="mono text-[11px] tracking-[0.12em] px-2.5 py-1 rounded-full" style={{ background: "var(--paper-2)", color: "var(--ink)" }}>
          {showSubject ? `${q.subject_slug.toUpperCase()} · ` : ""}
          {q.year} · Q{String(q.qnum).padStart(2, "0")}
        </span>
        {isMulti && <span className="chip chip-zest !text-[11px] !py-1">Constructive</span>}
        {q.difficulty >= 3 && <span className="chip chip-soft !text-[11px] !py-1">Hard</span>}
      </div>

      <p className={`leading-relaxed qtext mt-3.5 ${compact ? "text-[15px]" : "text-[17px]"}`}>
        <MathText text={q.stem} />
      </p>

      {steps && (
        <div className="mt-4">
          <StepScene steps={steps} subjectSlug={q.subject_slug} onConstructed={() => onConstructed?.(q.id)} />
        </div>
      )}

      {/* the choices only exist once the picture is built */}
      {holding ? (
        <div className="mt-4 rounded-2xl p-3.5 text-center" style={{ border: "1.5px dashed rgba(32,26,17,0.35)", background: "var(--paper-2)" }}>
          <p className="mono text-[11px] tracking-[0.12em]" style={{ color: "var(--muted)" }}>CONSTRUCT TO UNLOCK</p>
          <p className="text-[13px] muted mt-1">The choices appear the moment the construction is complete.</p>
        </div>
      ) : (
        <div className={`mt-4 grid gap-2 ${isMulti ? "rise" : ""}`} role="listbox" aria-label="Answer choices">
          {q.options.map((o) => {
            let cls = "opt";
            if (answered && o.label === q.answer) cls += " opt-correct";
            else if (answered && o.label === picked) cls += " opt-wrong";
            else if (answered) cls += " opt-dim";
            return (
              <button
                key={o.label}
                disabled={answered}
                className={`${cls} text-left rounded-2xl qtext ${compact ? "p-3 text-[14px]" : "p-3.5 text-[15px]"}`}
                onClick={() => onPick(q, o.label)}
              >
                <span
                  className="inline-flex font-semibold mr-2.5 mono text-[12px] items-center justify-center"
                  style={{
                    width: 24, height: 24,
                    border: "1.5px solid var(--line)",
                    borderRadius: 99,
                    background: o.label === q.answer && answered ? "var(--leaf)" : "var(--card-bg)",
                  }}
                >
                  {o.label}
                </span>
                <MathText text={o.text} />
              </button>
            );
          })}
        </div>
      )}

      {answered && (
        <div className="mt-3.5 rise rounded-2xl border p-3.5 sm:p-4" style={{ borderColor: "rgba(32,26,17,0.35)", background: "var(--paper-2)" }}>
          <p className="mono text-[10.5px] tracking-[0.14em] mb-1.5" style={{ color: "var(--muted)" }}>
            EXAMINER&apos;S NOTE
          </p>
          <p className="text-[14px] font-semibold">
            {picked === q.answer ? "Correct — and here is why." : `Answer: ${q.answer}`}
          </p>
          <p className="text-[14px] leading-relaxed qtext mt-1"><MathText text={q.explanation} /></p>
        </div>
      )}
    </div>
  );
}
