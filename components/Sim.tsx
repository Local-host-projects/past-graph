"use client";

import { useEffect, useRef, useState } from "react";
import type { Sim } from "@/lib/types";

const ACCENT = "#0071e3";
const INK = "#1d1d1f";
const GRID = "rgba(0,0,0,0.06)";

export default function SimView({ sim }: { sim: Pick<Sim, "slug" | "kind" | "title"> }) {
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

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [p, sim.kind]);

  const sliders =
    sim.kind === "projectile"
      ? [["v0", "Launch speed (m/s)", 10, 70], ["angle", "Angle (°)", 5, 85], ["g", "Gravity (m/s²)", 2, 25]] as const
      : sim.kind === "wave"
      ? [["amp", "Amplitude", 10, 80], ["freq", "Frequency (Hz)", 0.5, 6]] as const
      : [["v", "Voltage (V)", 1, 24], ["r", "Resistance (Ω)", 1, 12]] as const;

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] font-semibold tracking-tight">{sim.title}</h3>
        <button className="btn btn-secondary !py-1.5 !px-3.5 !text-[13px]" onClick={() => setPlaying((v) => !v)}>
          {playing ? "Pause" : "Play"}
        </button>
      </div>
      <canvas ref={canvasRef} width={560} height={320} className="w-full rounded-xl bg-[var(--bg-2)]" />
      <div className="mt-3 grid gap-2.5">
        {sliders.map(([key, label, min, max]) => (
          <label key={key} className="flex items-center gap-3 text-[13px]">
            <span className="w-36 shrink-0 muted">{label}</span>
            <input
              type="range" min={min} max={max} step={0.5} value={p[key]}
              onChange={(e) => setP((s) => ({ ...s, [key]: Number(e.target.value) }))}
              className="w-full accent-[var(--accent)]"
            />
          </label>
        ))}
      </div>
      <p className="text-[12.5px] muted mt-3">Adjust the sliders — everything re-plots live. Play it beside a question or a video.</p>
    </div>
  );
}
