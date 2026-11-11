"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Step } from "@/lib/types";
import MathText from "./MathText";
import { sfx } from "@/lib/sfx";

/* ---------------------------------------------------------------------------
   StepScene — the constructive core, now following the "Multi-step feed"
   design reference (Main.dc.html):

   · each step is a CHOICE among three tiles: one real move, two traps
     (the catalogue authored distractor: jump ahead / force the answer).
   · a wrong tile STAYS marked ("Not quite") — the world doesn't erase
     your slip, it explains it in the coach line and rings the figure.
   · the world rebuilds stage by stage; segments fill, cells flip from
     "?" to the value each landed move earns, the active region rings,
     and on completion the current flows (dash animation).
   · once the construction stands: a "Solved" card — who you slipped,
     the answer tiles of the exam below, replay button.

   The mock's palette is light; its VALUES (sizes, radii, gaps, type
   scale, animations) are ported 1:1 but rendered in the app's paper
   palette, per the reference's README ("replicate faithfully in its own
   components and styling system").
--------------------------------------------------------------------------- */

type Coach = { kind: "idle" | "ok" | "bad"; msg: string };
type Choice = { key: string; title: string; math: string; correct: boolean; why: string };

/* subject-staged worlds — the base canvas each construction builds upon */
const STROKE = "#f5f0e4";
const ZEST = "#ff6320";
const LEAF = "#c8f55b";

const MOTIF_KEYS: Array<[string, string[]]> = [
  ["droplets", ["bile", "globule", "emulsif", "droplet"]],
  ["mesh", ["fibrin", "clot", "thread", "mesh"]],
  ["osmosis", ["funnel", "membrane", "osmosis", "water potential", "fluid level"]],
  ["punnett", ["gamete", "punnett", "allele", "combination", "xross", "cross"]],
  ["circuit", ["current", "circuit", "resistor", "ohm", "volt", "battery", "charge flows"]],
  ["flask", ["mole", "titr", "concentration", "yield", "acid", "gas", "reaction"]],
  ["cell", ["cell", "organelle", "nucleus", "mitochondr", "enzyme"]],
  ["arc", ["projectile", "trajectory", "apex", "launch", "ball", "height", "range", "angle", "velocity"]],
  ["bridge", ["bridge", "beam", "deck", "cable", "truss"]],
  ["world", ["king", "govern", "policy", "council", "village", "elder", "people", "economy", "demand", "market"]],
];

const MOTIF_LABEL: Record<string, string> = {
  droplets: "Emulsification",
  mesh: "Clot mesh",
  osmosis: "Osmosis",
  punnett: "Punnett square",
  circuit: "Circuit",
  flask: "Titration",
  cell: "The cell",
  arc: "Trajectory",
  bridge: "The truss",
  world: "The world",
};

function detectMotif(step: Step | undefined): string | null {
  if (!step) return null;
  const hay = `${step.title} ${step.content} ${step.note ?? ""}`.toLowerCase();
  for (const [id, keys] of MOTIF_KEYS) if (keys.some((k) => hay.includes(k))) return id;
  return null;
}

function short(s: string, n: number) {
  const t = s.trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

/* ---------------------------------------------------------------------------
   The decoy engine — three tiles per step: the true move plus TWO authored
   distractors. The catalogue: "jump ahead to a record not yet earned" and
   "force the answer / recall the result without building". The first
   ordering trap is real exam intuition; the second is what exams punish.
--------------------------------------------------------------------------- */

function buildChoices(steps: Step[], i: number): Choice[] {
  const step = steps[i];
  const correct: Choice = {
    key: "right",
    title: step.title,
    math: short(step.content, 64),
    correct: true,
    why: step.note ? step.note.replace(/^#\s*/, "") : "The record stands — this move is earned.",
  };

  const others = steps
    .map((s, j) => ({ s, j }))
    .filter((o) => o.j !== i && o.s.title !== step.title);

  const traps: Choice[] = [];
  if (others.length) {
    // prefer the next step (peeking ahead), else the previous, else anything
    const next = others.find((o) => o.j === i + 1) ?? others.find((o) => o.j === i - 1) ?? others[0];
    const where = next.j > i ? `the very next record — step ${next.j + 1}` : `a later record — step ${next.j + 1}`;
    traps.push({
      key: "trap-step",
      title: `Jump to “${short(next.s.title, 40)}”`,
      math: `skip ahead → step ${next.j + 1}`,
      correct: false,
      why: `“${short(next.s.title, 36)}” is ${where} — the construction collapses without step ${i + 1} first${step.note ? `: ${step.note.replace(/^#\s*/, "")}` : "."}`,
    });
  }
  traps.push({
    key: "trap-force",
    title: "Force the answer now",
    math: "assume the result and move on",
    correct: false,
    why: step.note
      ? `No forcing — ${step.note.replace(/^#\s*/, "")}`
      : `There is no skipping the build — ${step.title.toLowerCase()} is the move that earns the result.`,
  });

  const all = [correct, ...traps];
  // stable deterministic order per step so positions don't dance between renders
  const order = (step.content.length + i * 2) % 3;
  const rotated = order === 1 ? [all[1], all[0], all[2]] : order === 2 ? [all[2], all[0], all[1]] : all;
  return rotated;
}

/* ---------------------------------------------------------------------------
   The world canvases (unchanged) — each motif is a body that grows with p.
--------------------------------------------------------------------------- */

function lineProgressPro(progress: number) {
  return Array.from({ length: 7 }, (_, i) => {
    const x = 30 + i * 30;
    const y = 112 - Math.pow((i / 6) * progress, 2) * 84;
    return `${x},${y.toFixed(1)}`;
  });
}

function MathStage({ p }: { p: number }) {
  const pts = lineProgressPro(p);
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={`g${i}`} x1={20 + i * 40} y1={14} x2={20 + i * 40} y2={118} stroke={STROKE} strokeOpacity={0.14} strokeWidth={1} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <line key={`h${i}`} x1={20} y1={14 + i * 34.6} x2={220} y2={14 + i * 34.6} stroke={STROKE} strokeOpacity={0.14} strokeWidth={1} />
      ))}
      <polyline points={pts.join(" ")} fill="none" stroke={LEAF} strokeWidth={2.5} strokeLinecap="round" />
      <polyline className="step-flow" points={pts.join(" ")} fill="none" stroke={ZEST} strokeWidth={2} strokeOpacity={0.5} strokeDasharray="3 6" />
      {p >= 1 && <circle cx={pts[pts.length - 1].split(",")[0]} cy={Number(pts[pts.length - 1].split(",")[1])} r={6} fill={ZEST} />}
      <text x={222} y={126} fill={STROKE} fillOpacity={0.5} fontSize={9} textAnchor="end" fontFamily="var(--font-mono)">{`f(x) stage · ${(p * 100).toFixed(0)}%`}</text>
    </svg>
  );
}

function PhysicsStage({ p }: { p: number }) {
  const t = Math.max(0.15, Math.min(1, p));
  const apex = { x: 120, y: 18 };
  const x = t < 0.5 ? 25 + (apex.x - 25) * (t * 2) : apex.x + (215 - apex.x) * ((t - 0.5) * 2);
  const y = t < 0.5 ? 112 - (112 - apex.y) * (t * 2) : apex.y + (112 - apex.y) * ((t - 0.5) * 2);
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      <line x1={16} y1={112} x2={224} y2={112} stroke={STROKE} strokeOpacity={0.4} strokeWidth={2} />
      <path className="step-flow" d={`M25,112 Q${apex.x},${apex.y * 2 - 112} 215,112`} fill="none" stroke={STROKE} strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="4 5" />
      <line x1={120} y1={18} x2={120} y2={112} stroke={LEAF} strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="3 4" />
      {p > 0 && (
        <>
          <circle cx={x} cy={y} r={7} fill={ZEST} />
          <line x1={x} y1={y} x2={x} y2={y - 16} stroke={LEAF} strokeWidth={2} markerEnd="" />
          <path d={`M${x - 4},${y - 12} L${x},${y - 19} L${x + 4},${y - 12}`} fill="none" stroke={LEAF} strokeWidth={2} />
        </>
      )}
      <text x={222} y={126} fill={STROKE} fillOpacity={0.5} fontSize={9} textAnchor="end" fontFamily="var(--font-mono)">{`trajectory · ${(p * 100).toFixed(0)}%`}</text>
    </svg>
  );
}

function ChemStage({ p }: { p: number }) {
  const n = Math.round(p * 6);
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      <polygon points="96,20 144,20 144,52 176,112 64,112 96,52" fill="none" stroke={STROKE} strokeWidth={2.5} />
      <polygon points={`100,${112 - 36 * p} 140,${112 - 36 * p} 168,112 72,112`} fill={LEAF} fillOpacity={0.35} />
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={104 + i * 7} cy={104 - i * 9 - (i % 2) * 5} r={3 + (i % 2)} fill={ZEST} fillOpacity={0.85} />
      ))}
      <line x1={64} y1={112} x2={176} y2={112} stroke={STROKE} strokeWidth={2.5} />
      <text x={222} y={126} fill={STROKE} fillOpacity={0.5} fontSize={9} textAnchor="end" fontFamily="var(--font-mono)">{`reaction stage · ${(p * 100).toFixed(0)}%`}</text>
    </svg>
  );
}

function BioStage({ p }: { p: number }) {
  const organelles = Math.round(p * 4);
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      <circle cx={120} cy={66} r={48} fill="none" stroke={STROKE} strokeWidth={2.5} strokeOpacity={0.85} />
      <circle cx={120} cy={66} r={15} fill={LEAF} fillOpacity={0.4} stroke={LEAF} strokeWidth={1.5} />
      {Array.from({ length: 4 }, (_, i) => {
        const on = i < organelles;
        const pos = [[92, 42], [148, 46], [96, 92], [146, 90]][i];
        return (
          <circle
            key={i}
            cx={pos[0]}
            cy={pos[1]}
            r={on ? 5 : 3}
            fill={on ? ZEST : "none"}
            stroke={ZEST}
            strokeOpacity={on ? 0.95 : 0.25}
            strokeWidth={1.5}
          />
        );
      })}
      <text x={222} y={126} fill={STROKE} fillOpacity={0.5} fontSize={9} textAnchor="end" fontFamily="var(--font-mono)">{`cell stage · ${(p * 100).toFixed(0)}%`}</text>
    </svg>
  );
}

const SUBJECT_STAGES: Record<string, (p: number) => React.ReactNode> = {
  mathematics: (p) => <MathStage p={p} />,
  physics: (p) => <PhysicsStage p={p} />,
  chemistry: (p) => <ChemStage p={p} />,
  biology: (p) => <BioStage p={p} />,
};

/* ---- step-kind motifs ----------------------------------------------------- */

function DropletMotif({ p }: { p: number }) {
  const drops = 1 + Math.round(p * 7);
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      <circle cx={60} cy={72} r={26} fill={LEAF} fillOpacity={0.35} stroke={LEAF} strokeWidth={2} />
      {Array.from({ length: drops }, (_, i) => (
        <g key={i} className="stage-pop" style={{ animationDelay: `${i * 0.06}s` }}>
          <circle cx={108 + i * 17} cy={70 + (i % 3) * 12} r={7 + (i % 2) * 2} fill={ZEST} fillOpacity={0.8} />
        </g>
      ))}
      <text x={120} y={122} fill={STROKE} fillOpacity={0.6} fontSize={9.5} textAnchor="middle" fontFamily="var(--font-mono)">large globule → countless droplets</text>
    </svg>
  );
}

function MeshMotif({ p }: { p: number }) {
  const rows = 3, cols = 8;
  const drawn = Math.round(p * rows * cols);
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      {Array.from({ length: drawn }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        return (
          <g key={i}>
            <line x1={48 + r * 40} y1={34 + c * 9} x2={88 + r * 40} y2={34 + c * 9} stroke={LEAF} strokeWidth={1.6} strokeOpacity={0.8} />
            <line x1={52 + r * 40} y1={34 + c * 9} x2={84 + r * 40} y2={34 + c * 9 - 6} stroke={ZEST} strokeWidth={1.2} strokeOpacity={0.7} />
          </g>
        );
      })}
      <text x={120} y={122} fill={STROKE} fillOpacity={0.6} fontSize={9.5} textAnchor="middle" fontFamily="var(--font-mono)">threads trap cells — the mesh seals</text>
    </svg>
  );
}

function OsmosisMotif({ p }: { p: number }) {
  const lvl = 20 + p * 46;
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      <rect x={70} y={26} width={40} height={78} rx={6} fill="none" stroke={STROKE} strokeWidth={2.5} />
      <rect x={140} y={26} width={40} height={78} rx={6} fill="none" stroke={STROKE} strokeWidth={2.5} />
      <line x1={110} y1={26} x2={110} y2={104} stroke={STROKE} strokeOpacity={0.7} strokeWidth={3} strokeDasharray="5 4" />
      <rect x={72} y={104 - 40} width={36} height={38} fill={LEAF} fillOpacity={0.35} />
      <rect x={142} y={104 - lvl} width={36} height={lvl} fill={LEAF} fillOpacity={0.35} />
      <path d={`M112,64 L138,64`} stroke={ZEST} strokeWidth={2.5} />
      <path d={`M132,58 L140,64 L132,70`} fill="none" stroke={ZEST} strokeWidth={2.5} />
      <text x={120} y={122} fill={STROKE} fillOpacity={0.6} fontSize={9.5} textAnchor="middle" fontFamily="var(--font-mono)">solvent crosses the membrane</text>
    </svg>
  );
}

function PunnettMotif({ p }: { p: number }) {
  const cells = Math.round(p * 16);
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      {Array.from({ length: 16 }, (_, i) => {
        const c = i % 4, r = Math.floor(i / 4);
        const on = i < cells;
        const ratio = [[9, 0], [3, 1], [3, 2], [1, 3]] as const;
        const which = r * 4 + c;
        const idx = which < 9 ? 0 : which < 12 ? 1 : which < 15 ? 2 : 3;
        const color = ratio[idx][1] === 0 ? LEAF : ratio[idx][1] === 1 ? ZEST : ratio[idx][1] === 2 ? "#f5f0e4" : "#8a7c66";
        return (
          <rect
            key={i}
            x={64 + c * 24}
            y={30 + r * 20}
            width={22}
            height={16}
            rx={3}
            fill={color}
            fillOpacity={on ? 0.55 : 0.06}
            stroke={STROKE}
            strokeOpacity={0.5}
            strokeWidth={1.2}
          />
        );
      })}
      <text x={120} y={122} fill={STROKE} fillOpacity={0.6} fontSize={9.5} textAnchor="middle" fontFamily="var(--font-mono)">9 · 3 · 3 · 1 — the square itself</text>
    </svg>
  );
}

/* the circuit motif follows the reference figure: battery → pair → merge */
function CircuitMotif({ p, built }: { p: number; built: number }) {
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      <path d="M40,100 H200 V40 H40 V70 M40,40 V70" fill="none" stroke={STROKE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <g className={built >= 1 ? "g-o son" : "g-s"}>
        <path d="M96,40 H160 V70 H96" fill="none" stroke={STROKE} strokeWidth={2} strokeLinejoin="round" />
        <rect x={104} y={28} width={42} height={22} rx={5} fill="rgba(245,240,228,0.08)" stroke={STROKE} strokeWidth={1.5} />
        <text x={125} y={43} textAnchor="middle" fontSize={12} fontWeight={600} fill={STROKE}>6 Ω</text>
        <rect x={104} y={74} width={42} height={22} rx={5} fill="rgba(245,240,228,0.08)" stroke={STROKE} strokeWidth={1.5} />
        <text x={125} y={89} textAnchor="middle" fontSize={12} fontWeight={600} fill={STROKE}>4 Ω</text>
      </g>
      <g className={built >= 2 ? "g-o son" : "g-s"}>
        <rect x={104} y={28} width={64} height={22} rx={5} fill="rgba(200,245,91,0.16)" stroke={ZEST} strokeWidth={2} />
        <text x={136} y={43} textAnchor="middle" fontSize={12} fontWeight={700} fill={LEAF}>2 Ω</text>
      </g>
      <g className={built >= 3 ? "g-o son" : "g-s"}>
        <rect x={100} y={28} width={72} height={22} rx={5} fill="rgba(200,245,91,0.16)" stroke={ZEST} strokeWidth={2} />
        <text x={136} y={43} textAnchor="middle" fontSize={12} fontWeight={700} fill={LEAF}>12 Ω</text>
      </g>
      <line x1={26} y1={70} x2={56} y2={70} stroke={STROKE} strokeWidth={2} />
      <line x1={32} y1={78} x2={44} y2={78} stroke={STROKE} strokeWidth={4} />
      <text x={62} y={74} fontSize={12} fontWeight={600} fill={STROKE}>battery</text>
      {built >= 3 && (
        <path className="step-flow" d="M40,100 H200 V40 H40 V70 M40,40 V70" fill="none" stroke={ZEST} strokeWidth={3} strokeLinecap="round" strokeDasharray="1 11" />
      )}
      <text x={120} y={122} fill={STROKE} fillOpacity={0.6} fontSize={9.5} textAnchor="middle" fontFamily="var(--font-mono)">parallel pair → series → the loop closes</text>
    </svg>
  );
}

function FlaskMotif({ p }: { p: number }) {
  const n = 1 + Math.round(p * 5);
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      <polygon points="102,28 138,28 138,54 166,110 74,110 102,54" fill="none" stroke={STROKE} strokeWidth={2.5} />
      <rect x={86} y={110 - 30 * p - 2} width={68} height={2} fill="none" stroke={LEAF} strokeWidth={1.5} strokeDasharray="3 3" />
      <polygon points={`90,${110 - 26 * p} 150,${110 - 26 * p} 164,110 76,110`} fill={LEAF} fillOpacity={0.35} />
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={106 + i * 8} cy={104 - i * 10} r={3.4} fill={ZEST} fillOpacity={0.9} className="stage-pop" style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
      <text x={120} y={125} fill={STROKE} fillOpacity={0.6} fontSize={9.5} textAnchor="middle" fontFamily="var(--font-mono)">measure · convert · pour</text>
    </svg>
  );
}

function CellMotif({ p }: { p: number }) {
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      <circle cx={120} cy={64} r={46} fill="none" stroke={STROKE} strokeWidth={2.5} />
      <circle cx={120} cy={64} r={14} fill={LEAF} fillOpacity={0.4} stroke={LEAF} strokeWidth={1.5} />
      {["nucleus", "mitochondrion", "chloroplast", "vacuole"].map((label, i) => {
        const pos = [[92, 40], [150, 44], [94, 90], [148, 88]][i];
        const on = i <= Math.round(p * 3);
        return (
          <g key={label} className="stage-pop">
            <circle cx={pos[0]} cy={pos[1]} r={on ? 5.5 : 2.5} fill={on ? ZEST : "none"} stroke={ZEST} strokeOpacity={on ? 1 : 0.3} strokeWidth={1.5} />
            <text x={pos[0] + 9} y={pos[1] + 3.5} fill={STROKE} fillOpacity={on ? 0.75 : 0.25} fontSize={8} fontFamily="var(--font-mono)">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ArcMotif({ p }: { p: number }) {
  const u = Math.max(0.05, Math.min(1, p));
  const x0 = 32, x1 = 208, apex = { x: 120, y: 22 };
  const x = u < 0.5 ? x0 + (apex.x - x0) * (u * 2) : apex.x + (x1 - apex.x) * ((u - 0.5) * 2);
  const y = u < 0.5 ? 108 - (108 - apex.y) * (u * 2) : apex.y + (108 - apex.y) * ((u - 0.5) * 2);
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      <line x1={20} y1={108} x2={220} y2={108} stroke={STROKE} strokeOpacity={0.4} strokeWidth={2} />
      <path className="step-flow" d={`M${x0},108 Q120,${apex.y * 2 - 108} ${x1},108`} fill="none" stroke={STROKE} strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="4 5" />
      <line x1={x0} y1={108} x2={x0 + 34} y2={108 - 14} stroke={LEAF} strokeWidth={2} />
      <text x={x0 + 40} y={100} fill={LEAF} fontSize={9} fontFamily="var(--font-mono)">u · θ</text>
      <circle cx={x} cy={y} r={6.5} fill={ZEST} />
      <text x={222} y={126} fill={STROKE} fillOpacity={0.5} fontSize={9} textAnchor="end" fontFamily="var(--font-mono)">{`R · H · t — ${(p * 100).toFixed(0)}%`}</text>
    </svg>
  );
}

function BridgeMotif({ p }: { p: number }) {
  const stageN = Math.round(p * 3);
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      <line x1={16} y1={112} x2={224} y2={112} stroke={STROKE} strokeOpacity={0.35} strokeWidth={2} />
      {stageN >= 1 && (
        <g className="stage-pop">
          <rect x={52} y={78} width={6} height={34} fill={STROKE} />
          <rect x={182} y={78} width={6} height={34} fill={STROKE} />
        </g>
      )}
      {stageN >= 2 && (
        <g className="stage-pop" style={{ animationDelay: "0.05s" }}>
          <rect x={46} y={70} width={148} height={7} fill={ZEST} />
        </g>
      )}
      {stageN >= 3 && (
        <g className="stage-pop" style={{ animationDelay: "0.1s" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={55 + i * 30} y1={70} x2={55 + i * 30} y2={50} stroke={LEAF} strokeWidth={1.8} />
          ))}
          <rect x={55} y={40} width={132} height={5} fill={LEAF} />
        </g>
      )}
      <text x={222} y={126} fill={STROKE} fillOpacity={0.5} fontSize={9} textAnchor="end" fontFamily="var(--font-mono)">{`truss · ${(p * 100).toFixed(0)}%`}</text>
    </svg>
  );
}

function SkyStars({ p }: { p: number }) {
  const stars = 4 + Math.round(p * 5);
  return (
    <g>
      {Array.from({ length: stars }, (_, i) => (
        <circle key={i} cx={24 + i * 42} cy={12 + (i % 3) * 7} r={1.6} fill={STROKE} fillOpacity={0.5} />
      ))}
    </g>
  );
}

function WorldMotif({ p }: { p: number }) {
  return (
    <svg viewBox="0 0 240 132" className="stage-canvas" style={{ width: "100%", height: 132 }} aria-hidden>
      <SkyStars p={p} />
      <rect x={30} y={64} width={180} height={40} fill={LEAF} fillOpacity={0.12} />
      {Array.from({ length: 1 + Math.round(p * 4) }, (_, i) => (
        <g key={i} className="stage-pop" style={{ animationDelay: `${i * 0.05}s` }}>
          <rect x={44 + i * 38} y={64 - (18 + (i % 3) * 8)} width={20} height={18 + (i % 3) * 8} fill={STROKE} fillOpacity={0.75} />
          <rect x={48 + i * 38} y={64 - (18 + (i % 3) * 8) + 5} width={5} height={6} fill="rgba(32,26,17,0.55)" />
          <rect x={57 + i * 38} y={64 - (18 + (i % 3) * 8) + 5} width={5} height={6} fill="rgba(32,26,17,0.55)" />
        </g>
      ))}
      <text x={120} y={124} fill={STROKE} fillOpacity={0.6} fontSize={9.5} textAnchor="middle" fontFamily="var(--font-mono)">the world reorders around your move</text>
    </svg>
  );
}

const MOTIF_MAP: Record<string, (p: number, built: number) => React.ReactNode> = {
  droplets: (p) => <DropletMotif p={p} />,
  mesh: (p) => <MeshMotif p={p} />,
  osmosis: (p) => <OsmosisMotif p={p} />,
  punnett: (p) => <PunnettMotif p={p} />,
  circuit: (p, built) => <CircuitMotif p={p} built={built} />,
  flask: (p) => <FlaskMotif p={p} />,
  cell: (p) => <CellMotif p={p} />,
  arc: (p) => <ArcMotif p={p} />,
  bridge: (p) => <BridgeMotif p={p} />,
  world: (p) => <WorldMotif p={p} />,
};

/* ---------------------------------------------------------------------------
   StepScene
--------------------------------------------------------------------------- */

export default function StepScene({ steps, subjectSlug = "mathematics", onConstructed }: {
  steps: Step[];
  subjectSlug?: string;
  onConstructed?: () => void;
}) {
  const [built, setBuilt] = useState(0);                 // landed moves
  const [tried, setTried] = useState<Record<string, boolean>>({}); // slips this stage
  const [slips, setSlips] = useState(0);
  const [coach, setCoach] = useState<Coach>({ kind: "idle", msg: "Tap the next step. The world rebuilds as you go." });
  const [ringMiss, setRingMiss] = useState(false);       // red + shaking ring
  const [pulse, setPulse] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);

  const complete = built >= steps.length;
  const slipped = Object.keys(tried).length > 0;
  const currentStep = steps[Math.min(built, steps.length - 1)];
  const choices = useMemo(() => (complete ? [] : buildChoices(steps, Math.min(built, steps.length - 1))), [built, steps, complete]);
  const motif = detectMotif(complete ? steps[steps.length - 1] : steps[Math.min(built, steps.length - 1)]);
  const stageKey = `${motif ?? subjectSlug}-${pulse}${ringMiss ? "-m" : ""}`;
  const progress = steps.length > 1 ? Math.min(1, built / (steps.length - 1)) : 1;
  const world = (motif && MOTIF_MAP[motif] ? MOTIF_MAP[motif](progress, built) : (SUBJECT_STAGES[subjectSlug] ?? SUBJECT_STAGES.mathematics)(progress));

  function land(c: Choice) {
    if (c.correct) {
      setTried({});
      setRingMiss(false);
      setCoach({ kind: "ok", msg: c.why });
      const next = built + 1;
      setBuilt(next);
      setPulse((p) => p + 1);
      sfx("tick");
      if (next >= steps.length && !firedRef.current) {
        firedRef.current = true;
        sfx("correct");
        onConstructed?.();
      }
    } else {
      sfx("wrong");
      setTried((t) => ({ ...t, [c.key]: true }));
      setSlips((s) => s + 1);
      setCoach({ kind: "bad", msg: c.why });
      setRingMiss(true);
      setPulse((p) => p + 1); // re-trigger the ring shake
    }
  }

  function replay() {
    firedRef.current = false;
    setBuilt(0);
    setTried({});
    setSlips(0);
    setCoach({ kind: "idle", msg: "Tap the next step. The world rebuilds as you go." });
    setRingMiss(false);
    onConstructed?.(); // keep the gate sticky once earned
  }

  const ringCls = `ring${!complete ? " ring-on" : ""}${ringMiss ? ` ring-bad ${slips % 2 ? "sa" : "sb"}` : ""}`;

  return (
    <div className="stepcard">
      {/* the world — figure card with segments, canvas, ring, cells */}
      <div className="stage">
        <div className="stage-head">
          <span className="stage-label">{motif ? (MOTIF_LABEL[motif] ?? "The world") : "The world"}</span>
          <div className="segs" aria-hidden>
            {steps.map((_, i) => (
              <span key={i} className={`seg${built > i ? " seg-full" : i === built ? " seg-cur" : ""}`} />
            ))}
          </div>
        </div>
        <div ref={stageRef} className="stage-box" aria-live="polite">
          <div key={stageKey} className={`stage-cycle w-full h-full flex items-center justify-center`}>
            {world}
          </div>
          <div className={ringCls} key={`ring-${pulse}`} aria-hidden />
        </div>
        <div className="cells">
          {steps.map((s, i) => {
            const bad = !complete && ringMiss && i === built && slipped;
            return (
              <div key={i} className={`cell${built > i ? " cell-ok" : bad ? " cell-bad" : ""}`}>
                <div className="l">{short(s.title, 12)}</div>
                <div className="v">{built > i ? short(s.content, 18) : bad ? "✗" : "?"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* the coach — idle prompt / ok confirmation / slip reason */}
      <div className={`stepcoach${coach.kind === "ok" ? " s-ok" : coach.kind === "bad" ? " s-bad" : ""}`} role="status" aria-live="polite">
        <span className="dot" aria-hidden />
        <span>{coach.msg}</span>
      </div>

      {complete ? (
        <div className="solved card">
          <span className="solved-lead">Constructed ✓</span>
          <span className="solved-line">
            The construction stands — the exam options below are earned. Built in {steps.length} step{steps.length === 1 ? "" : "s"} with {slips === 1 ? "1 slip" : `${slips} slips`}.
          </span>
          <div className="build-chips" aria-hidden>
            {steps.map((s, i) => (
              <span key={i} className={`bchip${i === steps.length - 1 ? " bwin" : ""}`}>{short(s.title, 22)}</span>
            ))}
          </div>
          {slips > 0 && (
            <span className="solved-slip">The steps you slipped on will come back later in your feed.</span>
          )}
          <button className="btn btn-secondary s-replay" onClick={replay} style={{ cursor: "pointer" }}>
            Try the build again
          </button>
        </div>
      ) : (
        <div className="lane">
          <div className="lane-label">
            {`Step ${Math.min(built + 1, steps.length)} of ${steps.length} · ${currentStep.title}`}
          </div>
          <div className="s-opts">
            {choices.map((c) => (
              <button
                key={c.key}
                className={`s-opt${tried[c.key] ? " s-tried" : ""}`}
                disabled={!!tried[c.key]}
                onClick={() => land(c)}
              >
                <span className="t">
                  {c.title}
                  {tried[c.key] && <span className="tag">Not quite</span>}
                </span>
                <span className="m">{c.correct ? <MathText text={c.math} /> : c.math}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


