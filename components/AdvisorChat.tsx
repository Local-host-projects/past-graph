"use client";

/**
 * Pathfinder AI advisor chat. Talks to /api/ai/chat (Gemini, server-side key).
 * Honest states: signed-out → prompt to sign in; no key → quiet card; rate-limited → said so.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Turn = { role: "user" | "model"; text: string };

export default function AdvisorChat() {
  const supabase = useMemo(() => createClient(), []);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setSignedIn(Boolean(data?.user));
    })();
  }, [supabase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setNotice(null);
    const history = turns.slice(-6);
    setTurns((t) => [...t, { role: "user", text }]);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, dream: history.find((h) => h.role === "user")?.text, history }),
    });
    const data = (await res.json()) as { answer?: string; error?: string };

    if (data.answer) {
      setTurns((t) => [...t, { role: "model", text: data.answer! }]);
    } else if (data.error === "unauthenticated") {
      setNotice("Sign in to talk to the advisor.");
    } else if (data.error === "no_key") {
      setNotice("The advisor is asleep until the Gemini key is added.");
    } else if (data.error === "rate_limited") {
      setNotice("Giving the advisor a breather — try again in a few minutes.");
    } else {
      setNotice("The advisor couldn't answer just now. Try again.");
    }
    setBusy(false);
  }

  return (
    <div className="card p-5 sm:p-6 mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[15px] font-semibold tracking-tight">Ask the advisor</p>
        <span className="chip">Pathfinder AI</span>
      </div>
      <p className="muted text-[13.5px] mt-1 leading-relaxed">
        &ldquo;I want Medicine but I&apos;m scared of Physics — what do I do?&rdquo; It plans around your dream course,
        the real JAMB combinations and where the score pressure is.
      </p>

      {turns.length > 0 && (
        <div className="mt-4 grid gap-3 max-h-[380px] overflow-y-auto pr-1" aria-live="polite">
          {turns.map((t, i) => (
            <div key={i} className={t.role === "user" ? "" : "card-flat p-3.5"}>
              <span className={`block text-[11px] uppercase tracking-wide ${t.role === "user" ? "" : "text-[var(--accent)] font-semibold"}`}>
                {t.role === "user" ? "You" : "Pathfinder"}
              </span>
              <span className="block text-[14px] leading-relaxed whitespace-pre-wrap mt-0.5">{t.text}</span>
            </div>
          ))}
          {busy && <div className="card-flat p-3.5 muted text-[13.5px]">Thinking…</div>}
          <div ref={endRef} />
        </div>
      )}

      {notice && <p className="text-[13px] mt-3" style={{ color: "var(--red)" }}>{notice}</p>}

      <form className="mt-4 flex gap-2" onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={signedIn === false ? "Sign in to ask…" : "Your question"}
          maxLength={800}
          disabled={signedIn === false || busy}
          className="flex-1 rounded-xl border border-[var(--hairline)] bg-white px-4 py-2.5 text-[14px] outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-60"
        />
        <button className="btn btn-primary" disabled={busy || !input.trim() || signedIn === false}>
          Ask
        </button>
      </form>
    </div>
  );
}
