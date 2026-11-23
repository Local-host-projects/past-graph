"use client";

/**
 * Refraction at a boundary — drag the light source around the arc above the
 * interface. The refracted ray, the reflected ray and total internal
 * reflection all follow Snell's law. "Swap media" flips into the
 * glass→air case so TIR can be seen without a second sim.
 */
import { useEffect, useRef, useState } from "react";
import { mountStage, type Stage } from "./stage";

const R = 152; // ray length / handle radius

export default function SnellSim() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState({ a1: 40, a2: 25.4, tir: false, thc: null as number | null, glassOnTop: false });
  const st = useRef({ a1: 40, glassOnTop: false, dragDir: false });
  const redrawRef = useRef<(() => void) | null>(null);

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

      const accent = 0xe8722a;
      const ink = 0x2a2118;

      /* media slabs + interface */
      const topMat = new T.MeshBasicMaterial({ color: 0x0071e3, transparent: true, opacity: 0.06 });
      const bottomMat = new T.MeshBasicMaterial({ color: 0x6b6255, transparent: true, opacity: 0.14 });
      const topSlab = new T.Mesh(new T.PlaneGeometry(900, 180), topMat);
      topSlab.position.set(0, 95, -10);
      const bottomSlab = new T.Mesh(new T.PlaneGeometry(900, 210), bottomMat);
      bottomSlab.position.set(0, -105, -10);
      s.scene.add(topSlab, bottomSlab);

      const iface = new T.Mesh(new T.BoxGeometry(900, 2.5, 2), new T.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.55 }));
      iface.position.set(0, 0, -4);
      s.scene.add(iface);

      const normal = new T.Line(
        new T.BufferGeometry().setFromPoints([new T.Vector3(0, -176, 0), new T.Vector3(0, 176, 0)]),
        new T.LineDashedMaterial({ color: ink, transparent: true, opacity: 0.25, dashSize: 7, gapSize: 7 })
      );
      normal.computeLineDistances();
      s.scene.add(normal);

      /* beams */
      const beam = (hex: number, opacity: number) => new T.Mesh(
        new T.BoxGeometry(1, 3.6, 3.6),
        new T.MeshBasicMaterial({ color: hex, transparent: true, opacity })
      );
      const incident = beam(accent, 0.95);
      const refracted = beam(accent, 0.75);
      const reflected = beam(0xc9302c, 0.85);
      s.scene.add(incident, refracted, reflected);

      const source = new T.Mesh(
        new T.SphereGeometry(9, 20, 16),
        new T.MeshStandardMaterial({ color: accent, roughness: 0.3 })
      );
      source.position.z = 10;
      s.scene.add(source);

      function setBeam(mesh: import("three").Mesh, x1: number, y1: number, x2: number, y2: number) {
        const dx = x2 - x1, dy = y2 - y1;
        mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, 6);
        mesh.rotation.z = Math.atan2(dy, dx);
        mesh.scale.set(Math.hypot(dx, dy), 1, 1);
      }

      function draw() {
        const glassOnTop = st.current.glassOnTop;
        const n1 = glassOnTop ? 1.5 : 1.0;
        const n2 = glassOnTop ? 1.0 : 1.5;
        const a1 = st.current.a1;
        const th1 = (a1 * Math.PI) / 180;
        const sinT2 = (n1 * Math.sin(th1)) / n2;
        const tir = sinT2 > 1;
        const th2 = tir ? 0 : Math.asin(sinT2);
        const thc = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;

        /* media tint follows the indices */
        topMat.color.setHex(glassOnTop ? 0x6b6255 : 0x0071e3);
        topMat.opacity = glassOnTop ? 0.14 : 0.06;
        bottomMat.color.setHex(glassOnTop ? 0x0071e3 : 0x6b6255);
        bottomMat.opacity = glassOnTop ? 0.06 : 0.14;

        const sx = -R * Math.sin(th1);
        const sy = R * Math.cos(th1);
        source.position.set(sx, sy, 10);
        setBeam(incident, sx, sy, 0, 0);

        if (!tir) {
          refracted.visible = true;
          reflected.visible = false;
          setBeam(refracted, 0, 0, R * Math.sin(th2), -R * Math.cos(th2));
        } else {
          refracted.visible = false;
          reflected.visible = true;
          setBeam(reflected, 0, 0, R * Math.sin(th1), R * Math.cos(th1));
        }

        setRead({ a1, a2: (th2 * 180) / Math.PI, tir, thc, glassOnTop });
      }
      redrawRef.current = draw;
      draw();

      s.onPointer((e, type) => {
        const p = s.toWorld(e);
        if (type === "down") {
          if (Math.hypot(p.x - source.position.x, p.y - source.position.y) < 46) {
            st.current.dragDir = true;
            s.canvas.style.cursor = "grabbing";
          }
        } else if (type === "move" && st.current.dragDir) {
          /* angle from the normal; the handle lives in the top medium */
          const a = (Math.atan2(-p.x, Math.max(4, p.y)) * 180) / Math.PI;
          st.current.a1 = Math.max(5, Math.min(85, a));
          draw();
        } else if (type === "up") {
          st.current.dragDir = false;
          s.canvas.style.cursor = "grab";
        }
      });
    })().catch(() => {});

    return () => {
      dead = true;
      stage?.dispose();
    };
  }, []);

  function swap() {
    st.current.glassOnTop = !st.current.glassOnTop;
    redrawRef.current?.();
  }

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: 300, background: "var(--bg-2)" }}>
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-3 top-2.5 flex flex-wrap gap-3 text-[11.5px] mono" style={{ color: "var(--muted)" }}>
        <span>θ1 {read.a1.toFixed(0)}°</span>
        {!read.tir && <span>θ2 {read.a2.toFixed(1)}°</span>}
        {read.tir && <span style={{ color: "var(--red)" }}>TOTAL INTERNAL REFLECTION</span>}
        {read.thc !== null && <span>θc {read.thc.toFixed(1)}°</span>}
      </div>
      <button
        onClick={swap}
        className="absolute right-3 top-2.5 text-[11.5px] px-2.5 py-1 rounded-full border"
        style={{ borderColor: "rgba(32,26,17,0.35)", background: "var(--card-bg)", color: "var(--ink)" }}
      >
        {read.glassOnTop ? "glass → air" : "air → glass"}
      </button>
      <div className="pointer-events-none absolute right-3 bottom-2.5 text-[11.5px]" style={{ color: "var(--muted)" }}>
        drag the light source
      </div>
    </div>
  );
}
