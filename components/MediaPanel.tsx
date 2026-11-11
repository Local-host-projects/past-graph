"use client";

import { useEffect, useRef } from "react";
import SimView from "./Sim";
import MathText from "./MathText";
import type { Video, Sim, Article } from "@/lib/types";

export type PanelData =
  | { type: "video"; data: Video }
  | { type: "sim"; data: Pick<Sim, "slug" | "kind" | "title"> }
  | { type: "article"; data: Article };

export default function MediaPanel({ panel, onClose }: { panel: PanelData | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!panel) return;
    returnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, onClose]);

  if (!panel) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: "rgba(32, 26, 17, 0.45)" }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={ref}
        className="slip pop w-full sm:max-w-2xl max-h-[86vh] overflow-auto rounded-t-[20px] sm:rounded-[18px] p-5 sm:p-7 pl-8 sm:pl-9"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={returnRef} className="btn btn-secondary !py-1.5 !px-4 !text-[13px]" onClick={onClose}>
          ✓ Return to question
        </button>

        {panel.type === "video" && (
          <div className="mt-4">
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black" style={{ border: "1.5px solid var(--line)" }}>
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${panel.data.youtube_id}`}
                title={panel.data.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 className="mt-3 text-[17px] font-semibold">{panel.data.title}</h3>
            <p className="text-[13px] muted">{panel.data.channel}</p>
          </div>
        )}

        {panel.type === "sim" && <div className="mt-4"><SimView sim={panel.data} /></div>}

        {panel.type === "article" && (
          <div className="mt-4">
            <h3 className="display text-[24px]">{panel.data.title}</h3>
            <p className="text-[13px] muted mt-1">{panel.data.read_min} min read</p>
            <div className="mt-3 prose-lite">
              {panel.data.body.split("\n\n").map((b, i) =>
                b.startsWith("## ") ? (
                  <h4 key={i} className="mt-4 mb-1 text-[15.5px] font-semibold"><MathText text={b.slice(3)} /></h4>
                ) : b.startsWith("- ") ? (
                  <ul key={i} className="ml-5 list-disc text-[14.5px]">
                    {b.split("\n").filter(Boolean).map((li, j) => <li key={j}><MathText text={li.slice(2)} /></li>)}
                  </ul>
                ) : (
                  <p key={i} className="mt-2 text-[15px] leading-relaxed"><MathText text={b} /></p>
                )
              )}
            </div>
            <a
              href={`/practice?mode=wander&subject=${panel.data.subject_slug}&topic=${panel.data.topic_slug}&enter=1`}
              className="chip chip-leaf !text-[12px] mt-4"
              style={{ cursor: "pointer" }}
            >
              Practice this topic →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
