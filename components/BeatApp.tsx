"use client";

/**
 * Beat my path — a challenge encoded entirely in the URL, zero DB.
 * /beat?q=<questionId>&w=<sender's wrong picks> — the friend plays the same
 * question (retryable: wrong picks count, never lock), and tries to land
 * UNDER the sender's count. Sharing rides WhatsApp (wa.me).
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Question } from "@/lib/types";
import QuestionView from "./QuestionView";
import { sfx, sfxInit } from "@/lib/sfx";

type Stage =
  | { s: "loading" }
  | { s: "missing" }
  | { s: "archived" }
  | { s: "play"; q: Question };

export default function BeatApp() {
  const supabase = useMemo(() => createClient(), []);
  const params = useSearchParams();
  const qid = (params.get("q") ?? "").trim();
  const rawW = Number(params.get("w"));
  const senderW = Number.isFinite(rawW) && rawW >= 0 ? Math.min(50, Math.round(rawW)) : 0;
  const senderName = (params.get("n") ?? "").slice(0, 40);

  const [stage, setStage] = useState<Stage>({ s: "loading" });
  const [premium, setPremium] = useState(false);

  /* the friend's run: retryable picks, each wrong one counts */
  const [wrong, setWrong] = useState(0);
  const [busted, setBusted] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    sfxInit();
  }, []);

  useEffect(() => {
    (async () => {
      if (!qid) {
        setStage({ s: "missing" });
        return;
      }
      const { data } = await supabase.from("questions").select("*").eq("id", qid).maybeSingle();
      if (!data) {
        setStage({ s: "missing" });
        return;
      }
      const q = data as Question;
      const me = await fetch("/api/me").then((r) => r.json()).catch(() => ({ premium: false }));
      setPremium(Boolean((me as { premium?: boolean }).premium));
      setStage(!q.is_free && !Boolean((me as { premium?: boolean }).premium) ? { s: "archived" } : { s: "play", q });
    })();
  }, [qid, supabase]);

  function onPick(qq: Question, answer: string) {
    if (picked) return;
    if (answer === qq.answer) {
      setPicked(answer);
      setBusted(null);
      sfx("correct");
      return;
    }
    setBusted(answer);
    setWrong((n) => n + 1);
    sfx("wrong");
  }

  function reset() {
    setPicked(null);
    setBusted(null);
    setWrong(0);
    sfx("tick");
  }

  function reshare() {
    const q = stage.s === "play" ? stage.q : null;
    if (!q) return;
    const url = `${window.location.origin}/beat?q=${q.id}&w=${wrong}`;
    const text =
      wrong === 0
        ? `I just matched a flawless run on this Past Graph path. Think you can too? ${url}`
        : `I beat this Past Graph path with ${wrong} wrong pick${wrong === 1 ? "" : "s"}. Your turn: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    sfx("tick");
  }

  const who = senderName ? decodeURIComponent(senderName) : "A friend";

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
      <p className="chip" style={{ margin: "0 auto" }}>Beat my path</p>
      <h1 className="display text-[34px] sm:text-[44px] mt-3 text-center">
        {stage.s === "play" ? "Can you beat the path?" : "Beat my path"}
      </h1>

      {stage.s === "loading" && <p className="muted text-[14.5px] mt-6 text-center">Pulling the challenge…</p>}

      {stage.s === "missing" && (
        <div className="card p-7 mt-7 text-center">
          <p className="text-[15.5px] font-semibold">This link lost its challenge</p>
          <p className="muted text-[14px] mt-1.5 leading-relaxed">
            Ask your friend to send it again — the question and their score ride inside the WhatsApp link itself.
          </p>
          <a className="btn btn-secondary mt-5" href="/practice">Go practise instead</a>
        </div>
      )}

      {stage.s === "archived" && (
        <div className="card p-7 mt-7 text-center">
          <div className="barcode mx-auto" style={{ maxWidth: 220 }} aria-hidden="true" />
          <p className="display text-[22px] mt-3">This path is in the archive</p>
          <p className="muted text-[14.5px] mt-1.5 leading-relaxed">
            Your friend trained on a premium question (2000–2020). ₦750 unlocks the whole six-month
            season — then you can answer the challenge.
          </p>
          <a className="btn btn-zest mt-5" href="/pricing">Unlock for ₦750</a>
        </div>
      )}

      {stage.s === "play" && (
        <>
          <p className="text-center muted text-[14.5px] mt-2">
            {who} cleared this with{" "}
            <strong style={{ color: "var(--ink)" }}>
              {senderW === 0 ? "a flawless run" : `${senderW} wrong pick${senderW === 1 ? "" : "s"}`}
            </strong>
            . {senderW === 0 ? "Match it — anything more loses." : "Fewer wrong picks wins. Match it for a draw."}
          </p>

          <div className="mt-6">
            <QuestionView q={stage.q} answered={Boolean(picked)} picked={picked} onPick={onPick} />
          </div>

          {busted && !picked && (
            <p className="text-[13px] mt-3" style={{ color: "var(--red)" }}>
              Not {busted} — that&apos;s wrong pick #{wrong}. Try again.
            </p>
          )}
          {!picked && (
            <p className="mono text-[11px] tracking-[0.12em] mt-4" style={{ color: "var(--muted)" }}>
              WRONG PICKS SO FAR: {wrong}
            </p>
          )}

          {picked && (
            <div
              className="mt-5 rounded-2xl border p-5 text-center"
              style={{ borderColor: "rgba(32,26,17,0.35)", background: "var(--paper-2)" }}
            >
              <p className="display text-[24px]">
                {wrong < senderW
                  ? "Beaten. Cleanly."
                  : wrong === senderW
                    ? "Dead heat."
                    : senderW === 0
                      ? "The flawless run stands."
                      : `${who} wins this one.`}
              </p>
              <p className="muted text-[14px] mt-1.5">
                You used {wrong} wrong pick{wrong === 1 ? "" : "s"} · {who} used {senderW}.
              </p>
              <div className="mt-4 flex gap-2 justify-center flex-wrap">
                <button className="btn btn-zest" onClick={reshare}>
                  Send your own challenge ⚡
                </button>
                <button className="btn btn-secondary" onClick={reset}>
                  Play it again
                </button>
              </div>
            </div>
          )}

          <p className="text-[12px] muted text-center mt-8 leading-relaxed">
            Beat-my-path challenges live entirely in the link — no accounts, no tracking.
            The sender&apos;s count is the bar; yours is counted honestly, one wrong pick at a time.
          </p>
        </>
      )}
    </div>
  );
}
