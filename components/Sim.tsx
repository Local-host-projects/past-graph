"use client";

import { useEffect, useRef, useState } from "react";
import type { Sim } from "@/lib/types";

const ACCENT = "#0071e3";
const INK = "#1d1d1f";
const GRID = "rgba(0,0,0,0.06)";

export default function SimView({ sim, locked }: { sim: Pick<Sim, "slug" | "kind" | "title">; locked?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(true);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // per-kind slider state
  const [p, setP] = useState<Record<string, number>>((): Record<string, number> => {
    if (sim.kind === "projectile") return { v0: 40, angle: 45, g: 10 };
    if (sim.kind === "wave") return { amp: 60, freq: 2 };
    if (sim.kind === "punnett") return { a: 2, b: 3 };
    if (sim.kind === "demand") return { d: 0, s: 0, tax: 0 };
    if (sim.kind === "snell") return { ang: 40, n1: 1.33, n2: 1.5 };
    return { v: 12, r: 4 };
  });

  const tRef = useRef(0);
  const playRef = useRef(playing);
  playRef.current = playing;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      if (sim.kind === "projectile") {
        const { v0, angle, g } = p;
        const th = (angle * Math.PI) / 180;
        const t = tRef.current;
        const T = (2 * v0 * Math.sin(th)) / g;
        const R = (v0 * v0 * Math.sin(2 * th)) / g;
        const Hmax = (v0 * v0 * Math.sin(th) ** 2) / (2 * g);
        const scale = Math.min((W - 70) / Math.max(R, 1), (H - 50) / Math.max(Hmax, 1), 4);
        // ground + grid
        ctx.strokeStyle = GRID; ctx.beginPath();
        for (let i = 0; i < 10; i++) { ctx.moveTo(0, (H / 10) * i); ctx.lineTo(W, (H / 10) * i); }
        ctx.stroke();
        ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(0, H - 18); ctx.lineTo(W, H - 18); ctx.stroke();
        // path
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const tt = (T * i) / 100;
          const x = v0 * Math.cos(th) * tt;
          const y = v0 * Math.sin(th) * tt - 0.5 * g * tt * tt;
          const px = 14 + x * scale, py = H - 18 - y * scale;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.5; ctx.stroke();
        // ball at t
        if (T > 0) {
          const bt = t % T;
          const x = v0 * Math.cos(th) * bt;
          const y = v0 * Math.sin(th) * bt - 0.5 * g * bt * bt;
          ctx.beginPath();
          ctx.arc(14 + x * scale, H - 18 - y * scale, 7, 0, Math.PI * 2);
          ctx.fillStyle = ACCENT; ctx.fill();
          ctx.beginPath();
          ctx.moveTo(14 + x * scale, H - 18 - y * scale);
          ctx.lineTo(14 + x * scale, H - 18);
          ctx.strokeStyle = ACCENT + "44"; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.font = "13px system-ui"; ctx.fillStyle = "#6e6e73";
        ctx.fillText(`Range ${R.toFixed(0)} m   Max height ${Hmax.toFixed(0)} m   T of flight ${T.toFixed(1)} s`, 14, 22);
        if (!reduced.current && playRef.current) tRef.current += dt;
      }

      if (sim.kind === "wave") {
        const { amp, freq } = p;
        ctx.strokeStyle = GRID; ctx.beginPath();
        ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i <= W; i += 2) {
          const y = H / 2 - amp * Math.sin(2 * Math.PI * freq * (i / W) - tRef.current * 3);
          i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y);
        }
        ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.5; ctx.stroke();
        ctx.font = "13px system-ui"; ctx.fillStyle = "#6e6e73";
        ctx.fillText(`Amplitude ${amp}  |  Frequency ${freq} Hz`, 14, 22);
        if (!reduced.current && playRef.current) tRef.current += dt;
      }

      if (sim.kind === "ohm") {
        const { v, r } = p;
        const I = v / r;
        const bright = Math.max(0.15, Math.min(1, I / 4));
        // lamp
        ctx.beginPath(); ctx.arc(W - 90, H / 2, 42, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,193,7,${bright})`; ctx.fill();
        ctx.beginPath(); ctx.arc(W - 90, H / 2, 42, 0, Math.PI * 2);
        ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
        // circuit
        ctx.strokeStyle = INK; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W - 90, H / 2 - 42); ctx.lineTo(90, H / 2 - 42); ctx.lineTo(90, H / 2 + 42);
        ctx.lineTo(W - 90, H / 2 + 42); ctx.lineTo(W - 90, H / 2 + 42); ctx.stroke();
        // battery
        ctx.fillStyle = INK; ctx.fillRect(70, H / 2 - 16, 10, 32);
        // current arrows
        ctx.font = "13px system-ui"; ctx.fillStyle = "#6e6e73";
        ctx.fillText(`V = ${v} V`, 24, H / 2 - 52);
        ctx.fillText(`R = ${r} Ω`, 120, H / 2 - 52);
        ctx.fillText(`I = V/R = ${I.toFixed(2)} A`, 24, 22);
        ctx.fillStyle = `rgba(0,113,227,${bright})`;
        ctx.fillText(`Brightness ${(bright * 100).toFixed(0)}%`, W - 140, H / 2 + 42 + 24);
        if (!reduced.current && playRef.current) tRef.current += dt;
      }

      if (sim.kind === "punnett") {
        const NAMES = ["AA", "Aa", "aa"];
        const gi = (x: number) => Math.max(0, Math.min(2, Math.round(x) - 1));
        const A = NAMES[gi(p.a)], B = NAMES[gi(p.b)];
        const g1 = [A[0], A[1]], g2 = [B[0], B[1]];
        const canon = (s: string) => (s === "aA" ? "Aa" : s);
        const cells = [
          [canon(g1[0] + g2[0]), canon(g1[0] + g2[1])],
          [canon(g1[1] + g2[0]), canon(g1[1] + g2[1])],
        ];
        const sq = 96, gap = 10, ox = W / 2 - (2 * sq + gap) / 2, oy = 64;
        ctx.font = "13px system-ui"; ctx.fillStyle = "#6e6e73";
        ctx.fillText(`Parent A: ${A}   ×   Parent B: ${B}`, ox, 26);
        for (let j = 0; j < 2; j++) ctx.fillText(g2[j], ox + j * (sq + gap) + sq / 2 - 8, oy - 8);
        for (let i = 0; i < 2; i++) ctx.fillText(g1[i], ox - 26, oy + i * (sq + gap) + sq / 2 + 4);
        let dom = 0;
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const g = cells[i][j];
            const isDom = g.includes("A");
            if (isDom) dom++;
            const x = ox + j * (sq + gap), y = oy + i * (sq + gap);
            ctx.fillStyle = isDom ? "rgba(0,113,227,0.10)" : "rgba(0,0,0,0.05)";
            ctx.fillRect(x, y, sq, sq);
            ctx.strokeStyle = GRID; ctx.lineWidth = 1; ctx.strokeRect(x, y, sq, sq);
            ctx.fillStyle = INK; ctx.font = "600 17px system-ui";
            ctx.fillText(g, x + sq / 2 - 10, y + sq / 2 + 6);
          }
        }
        ctx.font = "13px system-ui"; ctx.fillStyle = "#6e6e73";
        ctx.fillText(`Dominant trait shows in ${(dom / 4) * 100}% of offspring · recessive in ${100 - (dom / 4) * 100}%`, ox, oy + 2 * sq + gap + 28);
      }

      if (sim.kind === "demand") {
        const { d, s, tax } = p;
        const Pd = (q: number) => 60 - 4 * q + d * 10;
        const Ps = (q: number) => 8 + 3 * q + s * 10 + tax;
        const qe = Math.max(0, Math.min(14, (52 + d * 10 - s * 10 - tax) / 7));
        const pe = Ps(qe);
        const X0 = 46, Y0 = H - 34, XW = W - X0 - 24, YH = Y0 - 26;
        const qx = (q: number) => X0 + (q / 14) * XW;
        const py = (v: number) => Y0 - (Math.max(0, Math.min(90, v)) / 90) * YH;
        // axes
        ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X0 + XW, Y0);
        ctx.moveTo(X0, Y0); ctx.lineTo(X0, 18); ctx.stroke();
        // surplus regions (linear curves → straight triangles)
        ctx.fillStyle = "rgba(0,113,227,0.08)";
        ctx.beginPath(); ctx.moveTo(qx(0), py(pe)); ctx.lineTo(qx(qe), py(pe)); ctx.lineTo(qx(0), py(Pd(0))); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.07)";
        ctx.beginPath(); ctx.moveTo(qx(0), py(pe)); ctx.lineTo(qx(qe), py(pe)); ctx.lineTo(qx(0), py(Ps(0))); ctx.closePath(); ctx.fill();
        // curves
        ctx.save();
        ctx.beginPath(); ctx.rect(X0, 14, XW, Y0 - 14); ctx.clip();
        ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(qx(0), py(Pd(0))); ctx.lineTo(qx(14), py(Pd(14))); ctx.stroke();
        ctx.strokeStyle = INK;
        ctx.beginPath(); ctx.moveTo(qx(0), py(Ps(0))); ctx.lineTo(qx(14), py(Ps(14))); ctx.stroke();
        ctx.restore();
        // equilibrium marker
        ctx.fillStyle = ACCENT;
        ctx.beginPath(); ctx.arc(qx(qe), py(pe), 5, 0, Math.PI * 2); ctx.fill();
        ctx.font = "13px system-ui"; ctx.fillStyle = "#6e6e73";
        ctx.fillText(`Q →`, X0 + XW + 4, Y0 + 4);
        ctx.fillText(`P`, X0 - 12, 20);
        ctx.fillStyle = ACCENT;
        ctx.fillText(`Demand ${d > 0 ? "+" : ""}${d.toFixed(1)}`, W - 150, 22);
        ctx.fillStyle = INK;
        ctx.fillText(`Supply ${s > 0 ? "+" : ""}${s.toFixed(1)}`, W - 150, 40);
        ctx.fillStyle = "#6e6e73";
        ctx.fillText(`Equilibrium: ₦${pe.toFixed(0)} at ${qe.toFixed(1)} units${tax > 0 ? ` (tax ₦${tax.toFixed(0)}/unit)` : ""}`, 14, 22);
      }

      if (sim.kind === "snell") {
        const { ang, n1, n2 } = p;
        const th1 = (ang * Math.PI) / 180;
        const s2 = (n1 * Math.sin(th1)) / n2;
        const tir = s2 > 1;
        const th2 = tir ? 0 : Math.asin(s2);
        const thc = n1 > n2 ? (Math.asin(Math.min(1, n2 / n1)) * 180) / Math.PI : null;
        const cx = W / 2, cy = H / 2, L = Math.min(W, H) / 2 - 22;
        // media bands
        ctx.fillStyle = "rgba(0,113,227,0.06)"; ctx.fillRect(0, 0, W, cy);
        ctx.fillStyle = "rgba(0,0,0,0.045)"; ctx.fillRect(0, cy, W, H - cy);
        // interface + normal
        ctx.strokeStyle = INK; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
        ctx.setLineDash([5, 5]); ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy - L); ctx.lineTo(cx, cy + L); ctx.stroke();
        ctx.setLineDash([]);
        // incident ray
        ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(cx - L * Math.sin(th1), cy - L * Math.cos(th1)); ctx.lineTo(cx, cy); ctx.stroke();
        // refracted, or the reflected ray at TIR
        if (!tir) {
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + L * Math.sin(th2), cy + L * Math.cos(th2)); ctx.stroke();
        } else {
          ctx.strokeStyle = "#c9302c";
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + L * Math.sin(th1), cy - L * Math.cos(th1)); ctx.stroke();
        }
        ctx.font = "13px system-ui"; ctx.fillStyle = "#6e6e73";
        ctx.fillText(`n₁ = ${n1.toFixed(2)}   n₂ = ${n2.toFixed(2)}   θ₁ = ${ang}°`, 14, 22);
        ctx.fillText(tir ? "Total internal reflection — no ray crosses" : `θ₂ = ${((th2 * 180) / Math.PI).toFixed(1)}°`, 14, H - 12);
        if (thc !== null) ctx.fillText(`Critical angle ${thc.toFixed(1)}°`, W - 160, H - 12);
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [p, sim.kind]);

  const step = sim.kind === "snell" ? 0.01 : sim.kind === "punnett" ? 1 : 0.5;
  const sliders =
    sim.kind === "projectile"
      ? [["v0", "Launch speed (m/s)", 10, 70], ["angle", "Angle (°)", 5, 85], ["g", "Gravity (m/s²)", 2, 25]] as const
      : sim.kind === "wave"
      ? [["amp", "Amplitude", 10, 80], ["freq", "Frequency (Hz)", 0.5, 6]] as const
      : sim.kind === "punnett"
      ? [["a", "Parent A genotype", 1, 3], ["b", "Parent B genotype", 1, 3]] as const
      : sim.kind === "demand"
      ? [["d", "Demand shift (income)", -2, 2], ["s", "Supply shift (cost)", -2, 2], ["tax", "Per-unit tax (₦)", 0, 10]] as const
      : sim.kind === "snell"
      ? [["ang", "Incident angle (°)", 5, 85], ["n1", "n₁ (top medium)", 1, 2.5], ["n2", "n₂ (bottom medium)", 1, 2.5]] as const
      : [["v", "Voltage (V)", 1, 24], ["r", "Resistance (Ω)", 1, 12]] as const;

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] font-semibold tracking-tight">
          {sim.title}
          {locked && <span className="chip !py-0.5 !px-2 text-[10.5px] ml-2 align-middle">★ Premium</span>}
        </h3>
        {!locked && (
          <button className="btn btn-secondary !py-1.5 !px-3.5 !text-[13px]" onClick={() => setPlaying((v) => !v)}>
            {playing ? "Pause" : "Play"}
          </button>
        )}
      </div>
      {locked ? (
        <div className="rounded-xl bg-[var(--bg-2)] p-8 text-center">
          <p className="text-[15px] font-semibold">🔒 Included with Premium</p>
          <p className="muted text-[13px] mt-1.5 max-w-[42ch] mx-auto">This model lives on the premium shelf — ₦750 covers the whole six-month season.</p>
          <a href="/pricing" className="btn btn-primary !py-1.5 !px-4 !text-[13px] mt-3 inline-block">See Premium</a>
        </div>
      ) : (
        <>
          <canvas ref={canvasRef} width={560} height={320} className="w-full rounded-xl bg-[var(--bg-2)]" />
          <div className="mt-3 grid gap-2.5">
            {sliders.map(([key, label, min, max]) => (
              <label key={key} className="flex items-center gap-3 text-[13px]">
                <span className="w-36 shrink-0 muted">{label}</span>
                <input
                  type="range" min={min} max={max} step={step} value={p[key]}
                  onChange={(e) => setP((s) => ({ ...s, [key]: Number(e.target.value) }))}
                  className="w-full accent-[var(--accent)]"
                />
              </label>
            ))}
          </div>
          <p className="text-[12.5px] muted mt-3">Adjust the sliders — everything re-plots live. Play it beside a question or a video.</p>
        </>
      )}
    </div>
  );
}
