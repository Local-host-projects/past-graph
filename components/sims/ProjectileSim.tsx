"use client";

/**
 * Projectile motion — aim by dragging the cannon; release fires.
 * The predicted arc is drawn while you aim, the ball flies on release,
 * and the landing pole marks the range. No play button anywhere.
 */
import { useEffect, useRef, useState } from "react";
import { mountStage, type Stage } from "./stage";

const PX_PER_M = 1.6;
const G = 10;
const PIVOT = { x: -272, y: -120 };

export default function ProjectileSim() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState({ v0: 40, angle: 45, range: 160, apex: 40, air: 5.7 });
  const st = useRef({
    aim: { v0: 40, angle: 45 },
    dragging: false,
    flight: null as null | { v0: number; angle: number; t: number; T: number },
  });

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

      /* ground + metre ticks (every 10 m, long every 50 m) */
      const ground = new T.Mesh(
        new T.PlaneGeometry(2400, 5),
        new T.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.55 })
      );
      ground.position.set(0, PIVOT.y - 2.5, 0);
      s.scene.add(ground);
      const tickMat = new T.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.16 });
      for (let m = -30; m <= 340; m += 10) {
        const big = m % 50 === 0;
        const g = new T.BufferGeometry().setFromPoints([
          new T.Vector3(PIVOT.x + m * PX_PER_M, PIVOT.y - (big ? 18 : 9), 0),
          new T.Vector3(PIVOT.x + m * PX_PER_M, PIVOT.y - 4, 0),
        ]);
        s.scene.add(new T.Line(g, tickMat));
      }

      /* cannon: rotating barrel + base */
      const gun = new T.Group();
      gun.position.set(PIVOT.x, PIVOT.y, 12);
      const barrel = new T.Mesh(
        new T.BoxGeometry(72, 10, 10),
        new T.MeshStandardMaterial({ color: ink, roughness: 0.55 })
      );
      barrel.position.x = 36;
      gun.add(barrel);
      const base = new T.Mesh(
        new T.CylinderGeometry(15, 21, 10, 28),
        new T.MeshStandardMaterial({ color: 0x4a3f33, roughness: 0.5 })
      );
      base.rotation.x = Math.PI / 2;
      gun.add(base);
      s.scene.add(gun);

      /* predicted arc */
      const arcGeo = new T.BufferGeometry();
      const arcPts = new Float32Array(61 * 3);
      arcGeo.setAttribute("position", new T.BufferAttribute(arcPts, 3));
      const arc = new T.Line(arcGeo, new T.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.85 }));
      s.scene.add(arc);

      /* ball + landing pole */
      const ball = new T.Mesh(
        new T.SphereGeometry(7.5, 24, 18),
        new T.MeshStandardMaterial({ color: accent, roughness: 0.35 })
      );
      ball.visible = false;
      s.scene.add(ball);
      const pole = new T.Mesh(
        new T.BoxGeometry(3, 34, 3),
        new T.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.5 })
      );
      pole.visible = false;
      s.scene.add(pole);

      function aimVisual() {
        const { v0, angle } = st.current.aim;
        const th = (angle * Math.PI) / 180;
        gun.rotation.z = th;
        const Tf = (2 * v0 * Math.sin(th)) / G;
        const range = (v0 * v0 * Math.sin(2 * th)) / G;
        const apex = (v0 * v0 * Math.sin(th) ** 2) / (2 * G);
        for (let i = 0; i <= 60; i++) {
          const t = (Tf * i) / 60;
          arcPts[i * 3] = PIVOT.x + v0 * Math.cos(th) * t * PX_PER_M;
          arcPts[i * 3 + 1] = PIVOT.y + (v0 * Math.sin(th) * t - 0.5 * G * t * t) * PX_PER_M;
          arcPts[i * 3 + 2] = 0;
        }
        const attr = arcGeo.attributes.position as import("three").BufferAttribute;
        attr.needsUpdate = true;
        arcGeo.computeBoundingSphere();
        pole.position.set(PIVOT.x + range * PX_PER_M, PIVOT.y + 17, 0);
        return { range, apex, Tf };
      }
      aimVisual();

      function aimAt(px: number, py: number) {
        const dx = px - PIVOT.x;
        const dy = py - PIVOT.y;
        const angle = Math.max(5, Math.min(85, (Math.atan2(dy, dx) * 180) / Math.PI));
        const v0 = Math.max(10, Math.min(45, Math.hypot(dx, dy) / 7));
        st.current.aim = { v0: Math.round(v0), angle: Math.round(angle) };
        const { range, apex, Tf } = aimVisual();
        setRead({ v0: st.current.aim.v0, angle: st.current.aim.angle, range, apex, air: Tf });
      }

      function fire() {
        const { v0, angle } = st.current.aim;
        const th = (angle * Math.PI) / 180;
        const Tf = (2 * v0 * Math.sin(th)) / G;
        st.current.flight = { v0, angle, t: 0, T: Tf };
        ball.visible = true;
        ball.position.set(PIVOT.x + 60, PIVOT.y + 20, 12);
        pole.visible = false;
      }

      s.onPointer((e, type) => {
        const p = s.toWorld(e);
        const near = Math.hypot(p.x - PIVOT.x, p.y - PIVOT.y) < 210;
        if (type === "down" && near) {
          st.current.dragging = true;
          s.canvas.style.cursor = "grabbing";
          aimAt(p.x, p.y);
        } else if (type === "move" && st.current.dragging) {
          aimAt(p.x, p.y);
        } else if (type === "up" && st.current.dragging) {
          st.current.dragging = false;
          s.canvas.style.cursor = "grab";
          fire();
        }
      });

      s.onFrame((dt) => {
        const f = st.current.flight;
        if (!f) return;
        f.t += dt;
        const th = (f.angle * Math.PI) / 180;
        if (f.t >= f.T) {
          const range = (f.v0 * f.v0 * Math.sin(2 * th)) / G;
          ball.visible = false;
          pole.visible = true;
          pole.position.set(PIVOT.x + range * PX_PER_M, PIVOT.y + 17, 0);
          st.current.flight = null;
          return;
        }
        const x = f.v0 * Math.cos(th) * f.t;
        const y = f.v0 * Math.sin(th) * f.t - 0.5 * G * f.t * f.t;
        ball.position.set(PIVOT.x + x * PX_PER_M, PIVOT.y + y * PX_PER_M, 12);
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
        <span>RANGE {read.range.toFixed(0)} m</span>
        <span>APEX {read.apex.toFixed(0)} m</span>
        <span>AIR {read.air.toFixed(1)} s</span>
      </div>
      <div className="pointer-events-none absolute right-3 top-2.5 text-[11.5px] mono" style={{ color: "var(--muted)" }}>
        {read.angle}° · {read.v0} m/s
      </div>
    </div>
  );
}
