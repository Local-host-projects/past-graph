"use client";

/**
 * Market equilibrium — drag the demand line or the supply line vertically.
 * The equilibrium point, the surplus/shortage shading and the price/quantity
 * readout all follow. Direct manipulation of the curves themselves.
 */
import { useEffect, useRef, useState } from "react";
import { mountStage, type Stage } from "./stage";

const QMAX = 14;
const PX0 = -272, PX1 = 300, PY0 = -132;   // axis origin
const QW = 512, PH = 218;                  // plotting span in world units
const qx = (q: number) => PX0 + 20 + (q / QMAX) * QW;
const py = (p: number) => PY0 + 12 + (p / 90) * PH;

export default function DemandSim() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState({ pe: 0, qe: 0, d: 0, s: 0 });
  const st = useRef({ d: 0, s: 0, drag: null as null | "d" | "s", lastY: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let stage: Stage | null = null;
    let dead = false;

    (async () => {
      const s = await mountStage(host);
      if (dead) { s.dispose(); return; }
      stage = s;
      const T = s.T;
      const cam = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 2000);
      s.setCamera(cam);

      const ink = 0x2a2118;
      const accent = 0xe8722a;

      /* axes */
      const axisMat = new T.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.55 });
      const xAxis = new T.Mesh(new T.BoxGeometry(QW + 34, 2.4, 2), axisMat);
      xAxis.position.set(PX0 + 20 + QW / 2, PY0, 0);
      s.scene.add(xAxis);
      const yAxis = new T.Mesh(new T.BoxGeometry(2.4, PH + 16, 2), axisMat);
      yAxis.position.set(PX0, PY0 + PH / 2, 0);
      s.scene.add(yAxis);

      /* heavy lines: a unit box scaled to length, rotated to the angle */
      const mkLine = (hex: number) => new T.Mesh(
        new T.BoxGeometry(1, 4, 4),
        new T.MeshBasicMaterial({ color: hex })
      );
      const demandLine = mkLine(accent);
      const supplyLine = mkLine(0x1d1d1f);
      s.scene.add(demandLine, supplyLine);

      /* surplus / shortage shading (triangles) */
      const shade = (hex: number, opacity: number) => {
        const geo = new T.BufferGeometry();
        geo.setAttribute("position", new T.BufferAttribute(new Float32Array(9), 3));
        return new T.Mesh(geo, new T.MeshBasicMaterial({ color: hex, transparent: true, opacity, side: T.DoubleSide }));
      };
      const surplus = shade(0xe8722a, 0.12);
      const shortage = shade(0x0071e3, 0.10);
      s.scene.add(surplus, shortage);

      const eq = new T.Mesh(new T.CircleGeometry(7, 20), new T.MeshBasicMaterial({ color: accent }));
      eq.position.z = 8;
      s.scene.add(eq);

      function setLine(mesh: import("three").Mesh, x1: number, y1: number, x2: number, y2: number) {
        const dx = x2 - x1, dy = y2 - y1;
        mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, 6);
        mesh.rotation.z = Math.atan2(dy, dx);
        mesh.scale.set(Math.hypot(dx, dy), 1, 1);
      }
      function setTri(mesh: import("three").Mesh, a: [number, number], b: [number, number], c: [number, number]) {
        const pos = (mesh.geometry as import("three").BufferGeometry).attributes.position as import("three").BufferAttribute;
        pos.setXYZ(0, a[0], a[1], 1);
        pos.setXYZ(1, b[0], b[1], 1);
        pos.setXYZ(2, c[0], c[1], 1);
        pos.needsUpdate = true;
        (mesh.geometry as import("three").BufferGeometry).computeBoundingSphere();
      }

      function apply() {
        const { d, s: sup } = st.current;
        const Pd = (q: number) => 60 - 4 * q + d * 10;
        const Ps = (q: number) => 8 + 3 * q + sup * 10;
        const qe = Math.max(0, Math.min(QMAX, (52 + d * 10 - sup * 10) / 7));
        const pe = Ps(qe);

        setLine(demandLine, qx(0), py(Pd(0)), qx(QMAX), py(Pd(QMAX)));
        setLine(supplyLine, qx(0), py(Ps(0)), qx(QMAX), py(Ps(QMAX)));

        setTri(surplus, [qx(0), py(pe)], [qx(qe), py(pe)], [qx(0), py(Pd(0))]);
        setTri(shortage, [qx(0), py(pe)], [qx(qe), py(pe)], [qx(0), py(Ps(0))]);

        eq.position.set(qx(qe), py(pe), 8);
        setRead({ pe, qe, d, s: sup });
      }
      apply();

      /* point-to-line distance in world units */
      function near(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
        const dx = x2 - x1, dy = y2 - y1;
        const L2 = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / L2));
        return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
      }

      s.onPointer((e, type) => {
        const p = s.toWorld(e);
        const { d, s: ss } = st.current;
        const Pd = (q: number) => 60 - 4 * q + d * 10;
        const Ps = (q: number) => 8 + 3 * q + ss * 10;
        if (type === "down") {
          if (near(p.x, p.y, qx(0), py(Pd(0)), qx(QMAX), py(Pd(QMAX))) < 30) {
            st.current.drag = "d";
            st.current.lastY = p.y;
            s.canvas.style.cursor = "grabbing";
          } else if (near(p.x, p.y, qx(0), py(Ps(0)), qx(QMAX), py(Ps(QMAX))) < 30) {
            st.current.drag = "s";
            st.current.lastY = p.y;
            s.canvas.style.cursor = "grabbing";
          }
        } else if (type === "move" && st.current.drag) {
          const dy = (p.y - st.current.lastY) / 24; // 24 world units per 1 shift unit
          st.current.lastY = p.y;
          if (st.current.drag === "d") st.current.d = Math.max(-2, Math.min(2, st.current.d + dy));
          else st.current.s = Math.max(-2, Math.min(2, st.current.s + dy));
          apply();
        } else if (type === "up") {
          st.current.drag = null;
          s.canvas.style.cursor = "grab";
        }
      });
    })().catch((err) => console.error("[demand sim] mount failed", err));

    return () => {
      dead = true;
      stage?.dispose();
    };
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: 300, background: "var(--bg-2)" }}>
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-3 top-2.5 flex flex-wrap gap-3 text-[11.5px] mono" style={{ color: "var(--muted)" }}>
        <span>P ₦{read.pe.toFixed(0)}</span>
        <span>Q {read.qe.toFixed(1)}</span>
        <span>DEMAND {read.d >= 0 ? "+" : ""}{read.d.toFixed(1)}</span>
        <span>SUPPLY {read.s >= 0 ? "+" : ""}{read.s.toFixed(1)}</span>
      </div>
      <div className="pointer-events-none absolute right-3 bottom-2.5 text-[11.5px]" style={{ color: "var(--muted)" }}>
        drag a curve up or down
      </div>
    </div>
  );
}
