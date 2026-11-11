"use client";

/**
 * Tasteful, minimal sound kit — synthesized with the Web Audio API (no files, no network).
 * Grounded in Apple's audio-haptic guidance:
 *  - Causality: each sound is tied to one real event (step reveal, answer commit, panel open).
 *  - Harmony: call it in the same frame as the visual change (never on a CSS delay).
 *  - Utility: only 5 sounds exist; everything else in the app is silent.
 */

type Voice = "tick" | "correct" | "wrong" | "open" | "complete" | "lock";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

export function sfxInit() {
  if (typeof window === "undefined") return;
  if (ctx) {
    if (ctx.state === "suspended") ctx.resume();
    return;
  }
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
}

export function setMuted(m: boolean) {
  muted = m;
  if (typeof window !== "undefined") window.localStorage.setItem("pg_sound", m ? "off" : "on");
}

export function isMuted() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("pg_sound") === "off";
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number, glideTo?: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, ctx.currentTime + start + dur);
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.02);
}

export function sfx(voice: Voice) {
  if (muted || typeof window === "undefined") return;
  sfxInit();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();

  switch (voice) {
    // step reveal: a quiet, dry tick (like a keystroke)
    case "tick":
      tone(1180, 0, 0.035, "triangle", 0.05);
      break;
    // correct answer: warm two-note lift (perfect fourth)
    case "correct":
      tone(587.33, 0, 0.12, "sine", 0.08); // D5
      tone(783.99, 0.09, 0.22, "sine", 0.07); // G5
      break;
    // wrong answer: soft, low, non-punishing
    case "wrong":
      tone(220, 0, 0.16, "sine", 0.06, 165);
      break;
    // material arriving (panel / sheet): breathy upward sweep
    case "open":
      tone(420, 0, 0.16, "sine", 0.035, 840);
      break;
    // small pocket for locked premium years
    case "lock":
      tone(330, 0, 0.06, "square", 0.025);
      tone(247, 0.06, 0.10, "square", 0.02);
      break;
    // finish a set / unlock success: three-note major arpeggio
    case "complete":
      tone(523.25, 0, 0.1, "sine", 0.06); // C5
      tone(659.25, 0.09, 0.1, "sine", 0.06); // E5
      tone(783.99, 0.18, 0.28, "sine", 0.06); // G5
      break;
  }
}
