"use client";

/**
 * Wave motion — grab the amplitude knob (up/down) and the wavelength knob
 * (along the ruler at the bottom). The wave is always travelling: motion is
 * the default state of a wave, not a playback control.
 *
 * Display physics: the visible span is 3 m of medium at 340 m/s, so
 * f = 340 / wavelength is a real sound-wave relationship.
 */
import { useEffect, useRef, useState } from "react";
import { mountStage, type Stage } from "./stage";

const SPAN = 300;           // wave drawn from -SPAN..SPAN
const UNITS_PER_M = 200;    // wavelength display scale
const SPEED_W = 168;        // phase velocity, world units/s
const SOUND = 340;          // m/s for the frequency readout

export default function WaveSim() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState({ lambda: 1.4, freq: 243, amp: 52 });
  const st = useRef({
    amp: 52, lam: 280, phase: 0,
    drag: null as null | "amp" | "lam",
    startX: 0, startLam: 280,
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
      const muted = 0x8a8378;

      /* centre line */
      const mid = new T.Line(
        new T.BufferGeometry().setFromPoints([new T.Vector3(-SPAN, 0, 0), new T.Vector3(SPAN, 0, 0)]),
        new T.LineDashedMaterial({ color: ink, transparent: true, opacity: 0.18, dashSize: 8, gapSize: 8 })
      );
      mid.computeLineDistances();
      s.scene.add(mid);

      /* the wave itself */
      const N = 150;
      const waveGeo = new T.BufferGeometry();
      const pos = new Float32Array((N + 1) * 3);
      waveGeo.setAttribute("position", new T.BufferAttribute(pos, 3));
      const wave = new T.Line(waveGeo, new T.LineBasicMaterial({ color: accent }));
      s.scene.add(wave);

      /* amplitude rail (left): knob height = peak amplitude */
      const railMat = new T.MeshBasicMaterial({ color: muted, transparent: true, opacity: 0.35 });
      const ampRail = new T.Mesh(new T.BoxGeometry(2, 210, 2), railMat);
      ampRail.position.set(-318, 0, 0);
      s.scene.add(ampRail);
      const ampKnob = new T.Mesh(
        new T.SphereGeometry(11, 20, 16),
        new T.MeshStandardMaterial({ color: accent, roughness: 0.4 })
      );
      ampKnob.position.set(-318, st.current.amp, 8);
      s.scene.add(ampKnob);

      /* wavelength ruler (bottom): knob position = wavelength */
      const lamRail = new T.Mesh(new T.BoxGeometry(620, 2, 2), railMat);
      lamRail.position.set(0, -172, 0);
      s.scene.add(lamRail);
      const lamTicks = new T.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.2 });
      for (let i = 0; i <= 10; i++) {
        const x = -310 + i * 62;
        s.scene.add(new T.Line(
          new T.BufferGeometry().setFromPoints([new T.Vector3(x, -172, 0), new T.Vector3(x, i % 5 === 0 ? -160 : -165, 0)]),
          lamTicks
        ));
      }
      const lamKnob = new T.Mesh(
        new T.SphereGeometry(11, 20, 16),
        new T.MeshStandardMaterial({ color: ink, roughness: 0.4 })
      );
      lamKnob.position.set(-318 + st.current.lam, -172, 8);
      s.scene.add(lamKnob);

      const lamToX = (lam: number) => -318 + lam;
      const xToLam = (x: number) => Math.max(60, Math.min(600, x + 318));

      function readout() {
        const lambda = st.current.lam / UNITS_PER_M;
        setRead({ lambda, freq: SOUND / lambda, amp: Math.round(st.current.amp) });
        ampKnob.position.y = st.current.amp;
        lamKnob.position.x = lamToX(st.current.lam);
      }
      readout();

      s.onPointer((e, type) => {
        const p = s.toWorld(e);
        if (type === "down") {
          if (Math.hypot(p.x - ampKnob.position.x, p.y - ampKnob.position.y) < 40) {
            st.current.drag = "amp";
            s.canvas.style.cursor = "grabbing";
          } else if (Math.hypot(p.x - lamKnob.position.x, p.y - lamKnob.position.y) < 44) {
            st.current.drag = "lam";
            st.current.startX = p.x;
            st.current.startLam = st.current.lam;
            s.canvas.style.cursor = "grabbing";
          }
        } else if (type === "move" && st.current.drag) {
          if (st.current.drag === "amp") {
            st.current.amp = Math.max(8, Math.min(95, p.y));
          } else {
            /* stretch: drag right lengthens the wave, drag left shortens it */
            const k = 1 + (p.x - st.current.startX) / 240;
            st.current.lam = Math.max(60, Math.min(600, st.current.startLam * k));
          }
          readout();
        } else if (type === "up") {
          st.current.drag = null;
          s.canvas.style.cursor = "grab";
        }
      });

      s.onFrame((dt) => {
        st.current.phase += (dt * 2 * Math.PI * SPEED_W) / st.current.lam;
        const k = (2 * Math.PI) / st.current.lam;
        const t0 = st.current.phase;
        for (let i = 0; i <= N; i++) {
          const x = -SPAN + (i / N) * 2 * SPAN;
          pos[i * 3] = x;
          pos[i * 3 + 1] = st.current.amp * Math.sin(k * (x + SPAN) - t0);
          pos[i * 3 + 2] = 0;
        }
        (waveGeo.attributes.position as import("three").BufferAttribute).needsUpdate = true;
        waveGeo.computeBoundingSphere();
      });
    })().catch((err) => console.error("[wave sim] mount failed", err));

    return () => {
      dead = true;
      stage?.dispose();
    };
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: 300, background: "var(--bg-2)" }}>
      <div ref={hostRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-3 top-2.5 flex flex-wrap gap-3 text-[11.5px] mono" style={{ color: "var(--muted)" }}>
        <span>λ {read.lambda.toFixed(2)} m</span>
        <span>f {read.freq.toFixed(0)} Hz</span>
        <span>AMP {read.amp}</span>
      </div>
      <div className="pointer-events-none absolute right-3 bottom-2.5 text-[11.5px]" style={{ color: "var(--muted)" }}>
        stretch ↕ amp · ↔ wavelength
      </div>
    </div>
  );
}
