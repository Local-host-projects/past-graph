"use client";

/**
 * The sims lab frame. Each kind is a directly-interactive Three.js board:
 * you grab the model, not a play button. Three is dynamic-imported inside
 * each model, so pages only pay for the lab when a sim is on screen.
 */
import { lazy, Suspense } from "react";
import type { Sim } from "@/lib/types";

const MODELS = {
  projectile: lazy(() => import("./sims/ProjectileSim")),
  wave: lazy(() => import("./sims/WaveSim")),
  ohm: lazy(() => import("./sims/OhmSim")),
  punnett: lazy(() => import("./sims/PunnettSim")),
  demand: lazy(() => import("./sims/DemandSim")),
  snell: lazy(() => import("./sims/SnellSim")),
} as const;

const HINTS: Record<Sim["kind"], string> = {
  projectile: "Drag the cannon to aim — release to fire. The arc is the prediction; the ball is the physics.",
  wave: "Drag the orange knob up or down for amplitude; stretch the ruler to change wavelength. The frequency readout is real: 340 / λ.",
  ohm: "Drag the cell (V) or the resistor (R). The carriers speed up with current and the lamp answers with light.",
  punnett: "Tap a parent card to cycle its genotype — the grid, the colours and the tally recompute.",
  demand: "Drag either curve up or down. The equilibrium point finds the crossing for you.",
  snell: "Drag the light source around the arc. Total internal reflection appears when it should — try swapping the media.",
};

export default function SimView({ sim, locked }: { sim: Pick<Sim, "slug" | "kind" | "title">; locked?: boolean }) {
  const Model = MODELS[sim.kind];
  if (!Model) {
    return (
      <div className="card p-4 sm:p-5">
        <h3 className="text-[15px] font-semibold tracking-tight">{sim.title}</h3>
        <p className="text-[12.5px] muted mt-2">This model is still being built.</p>
      </div>
    );
  }
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="text-[15px] font-semibold tracking-tight">
          {sim.title}
          {locked && <span className="chip !py-0.5 !px-2 text-[10.5px] ml-2 align-middle">★ Premium</span>}
        </h3>
        {!locked && <span className="chip !py-1 !px-2.5 text-[10.5px] whitespace-nowrap">grab it</span>}
      </div>
      {locked ? (
        <div className="rounded-xl bg-[var(--bg-2)] p-8 text-center">
          <p className="text-[15px] font-semibold">🔒 Included with Premium</p>
          <p className="muted text-[13px] mt-1.5 max-w-[42ch] mx-auto">
            This model lives on the premium shelf — ₦750 covers the whole six-month season.
          </p>
          <a href="/pricing" className="btn btn-primary !py-1.5 !px-4 !text-[13px] mt-3 inline-block">
            See Premium
          </a>
        </div>
      ) : (
        <>
          <Suspense
            fallback={<div className="rounded-xl" style={{ height: 300, background: "var(--bg-2)" }} aria-label="Loading model" />}
          >
            <Model />
          </Suspense>
          <p className="text-[12.5px] muted mt-3 leading-relaxed">{HINTS[sim.kind]}</p>
        </>
      )}
    </div>
  );
}
