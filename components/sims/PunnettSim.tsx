"use client";

/**
 * Punnett square — tap a parent card to cycle its genotype (AA → Aa → aa).
 * The grid, gametes, colours and the dominant/recessive tally all answer.
 * Tiles are extruded slabs; genotypes are the lab's only 3D text.
 */
import { useEffect, useRef, useState } from "react";
import { mountStage, type Stage } from "./stage";

const GENS = ["AA", "Aa", "aa"] as const;
type Gen = (typeof GENS)[number];

const GAMETES: Record<Gen, [string, string]> = { AA: ["A", "A"], Aa: ["A", "a"], aa: ["a", "a"] };

/** AA × aa → "Aa" with the dominant allele first. */
function combine(a: string, b: string) {
  const up = a === "A" ? a : b === "A" ? b : a;
  const lo = a === "A" ? b : b === "A" ? a : b;
  return up + lo;
}

export default function PunnettSim() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState({ p1: "Aa", p2: "Aa", dom: 75 });
  const st = useRef({ p1: 1, p2: 1 });

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

      function textTex(text: string) {
        const cv = document.createElement("canvas");
        cv.width = 256; cv.height = 128;
        const g = cv.getContext("2d")!;
        g.font = '700 84px -apple-system, system-ui, sans-serif';
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillStyle = "#1d1d1f";
        g.fillText(text, 128, 66);
        const t = new T.CanvasTexture(cv);
        t.anisotropy = 4;
        return t;
      }
      const tex = { AA: textTex("AA"), Aa: textTex("Aa"), aa: textTex("aa") };
      const glyph = { A: textTex("A"), a: textTex("a") };

      /* grid geometry */
      const CELL = 96, GAP = 12;
      const cx = [-54, 54];
      const cy = [-62, 46];

      const cellMat = () => new T.MeshStandardMaterial({ color: 0xe9e3d6, roughness: 0.65 });
      const cells: { mesh: import("three").Mesh; spr: import("three").Sprite }[] = [];
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const mesh = new T.Mesh(new T.BoxGeometry(CELL, CELL, 12), cellMat());
          mesh.position.set(cx[j], cy[i], 0);
          s.scene.add(mesh);
          const spr = new T.Sprite(new T.SpriteMaterial({ map: tex.Aa, transparent: true, depthTest: false }));
          spr.scale.set(72, 36, 1);
          spr.position.set(cx[j], cy[i], 14);
          spr.renderOrder = 20;
          s.scene.add(spr);
          cells.push({ mesh, spr });
        }
      }

      /* gamete headers: top = parent B, left = parent A */
      const headers: { x: number; y: number; top: boolean; idx: number; spr: import("three").Sprite }[] = [];
      const mkHeader = (x: number, y: number, top: boolean, idx: number) => {
        const spr = new T.Sprite(new T.SpriteMaterial({ map: glyph.A, transparent: true, depthTest: false }));
        spr.scale.set(44, 22, 1);
        spr.position.set(x, y, 12);
        spr.renderOrder = 20;
        s.scene.add(spr);
        headers.push({ x, y, top, idx, spr });
      };
      mkHeader(cx[0], 108, true, 0);
      mkHeader(cx[1], 108, true, 1);
      mkHeader(-124, cy[0], false, 0);
      mkHeader(-124, cy[1], false, 1);

      /* parent cards */
      const cardA = new T.Mesh(
        new T.BoxGeometry(150, 46, 12),
        new T.MeshStandardMaterial({ color: 0xf3e6cf, roughness: 0.7 })
      );
      cardA.position.set(0, 165, 4);
      s.scene.add(cardA);
      const sprA = new T.Sprite(new T.SpriteMaterial({ map: tex.Aa, transparent: true, depthTest: false }));
      sprA.scale.set(72, 36, 1);
      sprA.position.set(0, 165, 16);
      sprA.renderOrder = 20;
      s.scene.add(sprA);

      const cardB = new T.Mesh(
        new T.BoxGeometry(110, 150, 12),
        new T.MeshStandardMaterial({ color: 0xf3e6cf, roughness: 0.7 })
      );
      cardB.position.set(-218, -8, 4);
      s.scene.add(cardB);
      const sprB = new T.Sprite(new T.SpriteMaterial({ map: tex.Aa, transparent: true, depthTest: false }));
      sprB.scale.set(72, 36, 1);
      sprB.position.set(-218, -8, 16);
      sprB.renderOrder = 20;
      s.scene.add(sprB);

      function apply() {
        const p1 = GENS[st.current.p1], p2 = GENS[st.current.p2];
        const gA = GAMETES[p1], gB = GAMETES[p2];

        (sprA.material as import("three").SpriteMaterial).map = tex[p1];
        (sprB.material as import("three").SpriteMaterial).map = tex[p2];
        (sprA.material as import("three").SpriteMaterial).needsUpdate = true;
        (sprB.material as import("three").SpriteMaterial).needsUpdate = true;

        for (const h of headers) {
          const g = h.top ? gB[h.idx] : gA[h.idx];
          (h.spr.material as import("three").SpriteMaterial).map = glyph[g as "A" | "a"];
          (h.spr.material as import("three").SpriteMaterial).needsUpdate = true;
        }

        let dom = 0;
        let k = 0;
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const g = combine(gA[i], gB[j]) as Gen;
            const isDom = g.includes("A");
            if (isDom) dom++;
            const cell = cells[k++];
            (cell.mesh.material as import("three").MeshStandardMaterial).color.setHex(isDom ? 0xfbe3d2 : 0xe4ded1);
            (cell.spr.material as import("three").SpriteMaterial).map = tex[g];
            (cell.spr.material as import("three").SpriteMaterial).needsUpdate = true;
          }
        }
        setRead({ p1, p2, dom: (dom / 4) * 100 });
      }
      apply();

      s.onPointer((e, type) => {
        if (type !== "up") return;
        const p = s.toWorld(e);
        if (Math.abs(p.x) < 90 && Math.abs(p.y - 165) < 34) {
          st.current.p1 = (st.current.p1 + 1) % 3;
          apply();
        } else if (Math.abs(p.x + 218) < 70 && Math.abs(p.y + 8) < 92) {
          st.current.p2 = (st.current.p2 + 1) % 3;
          apply();
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
      <div className="pointer-events-none absolute left-3 top-2.5 text-[11.5px] mono" style={{ color: "var(--muted)" }}>
        P1 {read.p1} × P2 {read.p2}
      </div>
      <div className="pointer-events-none absolute right-3 top-2.5 text-[11.5px] mono" style={{ color: "var(--muted)" }}>
        DOMINANT {read.dom.toFixed(0)}% · RECESSIVE {(100 - read.dom).toFixed(0)}%
      </div>
      <div className="pointer-events-none absolute right-3 bottom-2.5 text-[11.5px]" style={{ color: "var(--muted)" }}>
        tap a parent card to cycle it
      </div>
    </div>
  );
}
