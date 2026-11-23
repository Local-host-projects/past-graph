"use client";

/**
 * Ohm's law — drag the resistor or the cell to change them; the lamp and the
 * current respond instantly. Current is shown as charge carriers travelling
 * the loop: their speed is the current, the lamp's brightness is the power.
 */
import { useEffect, useRef, useState } from "react";
import { mountStage, roundedRectPoints, type Stage } from "./stage";

export default function OhmSim() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState({ v: 12, r: 4, i: 3, p: 36 });
  const st = useRef({ v: 12, r: 4, drag: null as null | "v" | "r", prog: 0 });

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
      const CY = -12;

      /* the wire loop as a tube */
      const path = roundedRectPoints(T, 250, 118, 26).map((p) => new T.Vector3(p.x, p.y + CY, 0));
      const curve = new T.CatmullRomCurve3(path, true, "catmullrom", 0.2);
      const wire = new T.Mesh(
        new T.TubeGeometry(curve, 260, 3.4, 10, true),
        new T.MeshStandardMaterial({ color: 0x3a3128, roughness: 0.55 })
      );
      s.scene.add(wire);

      /* components on the loop */
      const battery = new T.Mesh(
        new T.BoxGeometry(26, 62, 16),
        new T.MeshStandardMaterial({ color: 0x1d1d1f, roughness: 0.45 })
      );
      battery.position.set(-250, CY, 6);
      s.scene.add(battery);
      const resistor = new T.Mesh(
        new T.BoxGeometry(92, 26, 16),
        new T.MeshStandardMaterial({ color: 0xd9b98c, roughness: 0.6 })
      );
      resistor.position.set(0, CY + 118, 6);
      s.scene.add(resistor);

      /* lamp: halo, ring, hot disc */
      const halo = new T.Mesh(
        new T.CircleGeometry(64, 40),
        new T.MeshBasicMaterial({ color: 0xffb020, transparent: true, opacity: 0.12 })
      );
      halo.position.set(250, CY, 2);
      s.scene.add(halo);
      const ring = new T.Mesh(
        new T.TorusGeometry(34, 3.2, 10, 44),
        new T.MeshStandardMaterial({ color: ink, roughness: 0.5 })
      );
      ring.position.set(250, CY, 8);
      s.scene.add(ring);
      const lampMat = new T.MeshBasicMaterial({ color: 0x8a8378 });
      const disc = new T.Mesh(new T.CircleGeometry(30, 36), lampMat);
      disc.position.set(250, CY, 7);
      s.scene.add(disc);

      /* value rails: V on the left, R on the right */
      const railMat = new T.MeshBasicMaterial({ color: 0x8a8378, transparent: true, opacity: 0.3 });
      const vRail = new T.Mesh(new T.BoxGeometry(2, 190, 2), railMat);
      vRail.position.set(-318, CY, 0);
      s.scene.add(vRail);
      const rRail = new T.Mesh(new T.BoxGeometry(2, 190, 2), railMat);
      rRail.position.set(318, CY, 0);
      s.scene.add(rRail);

      const knobMat = () => new T.MeshStandardMaterial({ color: accent, roughness: 0.4 });
      const vKnob = new T.Mesh(new T.SphereGeometry(10, 20, 16), knobMat());
      const rKnob = new T.Mesh(new T.SphereGeometry(10, 20, 16), knobMat());
      s.scene.add(vKnob, rKnob);

      /* current carriers */
      const DOTS = 26;
      const dots: import("three").Mesh[] = [];
      const dotMat = new T.MeshBasicMaterial({ color: 0x0071e3 });
      for (let i = 0; i < DOTS; i++) {
        const m = new T.Mesh(new T.SphereGeometry(4, 10, 8), dotMat);
        dots.push(m);
        s.scene.add(m);
      }

      const mapV = (v: number) => CY - 85 + ((v - 1) / 23) * 170;
      const mapR = (r: number) => CY - 85 + ((r - 1) / 11) * 170;
      const unmap = (y: number, min: number, max: number) =>
        Math.max(min, Math.min(max, min + ((y - (CY - 85)) / 170) * (max - min)));

      function apply() {
        const { v, r } = st.current;
        const i = v / r;
        const bright = Math.max(0.05, Math.min(1, i / 3.2));
        setRead({ v, r, i, p: v * i });
        vKnob.position.set(-318, mapV(v), 8);
        rKnob.position.set(318, mapR(r), 8);
        halo.material.opacity = 0.05 + 0.3 * bright;
        lampMat.color.setRGB(
          0.54 + (1 - 0.54) * bright,
          0.51 + (0.78 - 0.51) * bright,
          0.42 + (0.2 - 0.42) * bright
        );
      }
      apply();

      s.onPointer((e, type) => {
        const p = s.toWorld(e);
        if (type === "down") {
          if (Math.hypot(p.x - vKnob.position.x, p.y - vKnob.position.y) < 42 ||
              (Math.abs(p.x + 250) < 40 && Math.abs(p.y - CY) < 50)) {
            st.current.drag = "v";
            s.canvas.style.cursor = "grabbing";
          } else if (Math.hypot(p.x - rKnob.position.x, p.y - rKnob.position.y) < 42 ||
                     (Math.abs(p.x) < 70 && Math.abs(p.y - (CY + 118)) < 32)) {
            st.current.drag = "r";
            s.canvas.style.cursor = "grabbing";
          }
        } else if (type === "move" && st.current.drag) {
          if (st.current.drag === "v") st.current.v = Math.round(unmap(p.y, 1, 24));
          else st.current.r = Math.round(unmap(p.y, 1, 12));
          apply();
        } else if (type === "up") {
          st.current.drag = null;
          s.canvas.style.cursor = "grab";
        }
      });

      s.onFrame((dt) => {
        /* carriers move at a speed set by the current */
        st.current.prog = (st.current.prog + dt * 0.075 * (st.current.v / st.current.r)) % 1;
        const n = dots.length;
        for (let i = 0; i < n; i++) {
          const u = (i / n + st.current.prog) % 1;
          const pt = curve.getPointAt(u);
          dots[i].position.set(pt.x, pt.y, 8);
        }
      });
    })().catch(() => {});

    return () => {
      dead = true;
      stage?.dispose();
    };
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: 300, background: "var(--bg-2)" }}>
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-3 top-2.5 flex flex-wrap gap-3 text-[11.5px] mono" style={{ color: "var(--muted)" }}>
        <span>V {read.v} V</span>
        <span>R {read.r} Ω</span>
        <span>I {read.i.toFixed(2)} A</span>
        <span>P {read.p.toFixed(0)} W</span>
      </div>
      <div className="pointer-events-none absolute right-3 bottom-2.5 text-[11.5px]" style={{ color: "var(--muted)" }}>
        drag the cell or the resistor
      </div>
    </div>
  );
}
