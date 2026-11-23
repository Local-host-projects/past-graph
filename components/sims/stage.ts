"use client";

/**
 * Shared Three.js stage for the sims lab.
 *
 * Every sim is an orthographic, directly-interactive board: the pointer
 * manipulates the model itself (no play/pause). Ortho keeps hit-testing
 * linear -- screen pixels map to world units with one multiply -- while
 * layered meshes and lighting still give depth.
 *
 * three is dynamic-imported so the watch page and feed never pay for it
 * unless a sim is actually on screen.
 */

export type Three = typeof import("three");

/** Visible world height in units; width follows the container's aspect. */
export const WORLD_H = 380;
/** The lab is laid out for at least this much horizontal world (rails, cannon). */
const MIN_WORLD_W = 700;

export type Stage = Awaited<ReturnType<typeof mountStage>>;

export async function mountStage(host: HTMLElement) {
  const T = (await import("three")) as Three;

  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  canvas.style.touchAction = "none";
  canvas.style.cursor = "grab";
  host.appendChild(canvas);

  const scene = new T.Scene();
  scene.add(new T.AmbientLight(0xfff6e8, 1.35));
  const key = new T.DirectionalLight(0xffffff, 1.5);
  key.position.set(-120, 260, 400);
  scene.add(key);
  const rim = new T.DirectionalLight(0xffd9a0, 0.5);
  rim.position.set(320, -120, 180);
  scene.add(rim);

  let cam: import("three").OrthographicCamera | null = null;
  let frame: ((dt: number, t: number) => void) | null = null;
  let resizeFn: ((w: number, h: number) => void) | null = null;
  let pointer: ((e: PointerEvent, type: "down" | "move" | "up") => void) | null = null;
  let w = 1, h = 1;
  let dead = false;

  const measure = () => {
    w = Math.max(1, host.clientWidth);
    h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    if (cam) fitOrtho(T, cam, w / h);
    resizeFn?.(w, h);
  };
  const ro = new ResizeObserver(() => measure());
  ro.observe(host);
  measure();

  const down = (e: PointerEvent) => { try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic pointers */ } pointer?.(e, "down"); };
  const move = (e: PointerEvent) => pointer?.(e, "move");
  const up = (e: PointerEvent) => pointer?.(e, "up");
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  let last = performance.now();
  const t0 = last;
  let raf = 0;
  const tick = (now: number) => {
    if (dead) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    frame?.(dt, (now - t0) / 1000);
    if (cam) renderer.render(scene, cam);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    T, scene, renderer, canvas,
    size: () => ({ w, h }),
    setCamera(c: import("three").OrthographicCamera) {
      cam = c;
      fitOrtho(T, c, w / h);
    },
    onFrame(fn: (dt: number, t: number) => void) { frame = fn; },
    onResize(fn: (w: number, h: number) => void) { resizeFn = fn; },
    onPointer(fn: (e: PointerEvent, type: "down" | "move" | "up") => void) { pointer = fn; },
    /** Pointer -> world units, via the ortho frustum. */
    toWorld(e: PointerEvent): { x: number; y: number } {
      const c = cam!;
      const r = canvas.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width;
      const fy = (e.clientY - r.top) / r.height;
      return { x: c.left + fx * (c.right - c.left), y: c.top + fy * (c.bottom - c.top) };
    },
    dispose() {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      scene.traverse((o) => {
        const any = o as unknown as {
          geometry?: { dispose: () => void };
          material?: { map?: { dispose: () => void }; dispose: () => void } | { map?: { dispose: () => void }; dispose: () => void }[];
        };
        any.geometry?.dispose();
        const mats = Array.isArray(any.material) ? any.material : any.material ? [any.material] : [];
        for (const m of mats) { m.map?.dispose(); m.dispose(); }
      });
      renderer.dispose();
      canvas.remove();
    },
  };
}

/** Fit an ortho frustum to the container aspect, guaranteeing MIN_WORLD_W. */
export function fitOrtho(T: Three, cam: import("three").OrthographicCamera, aspect: number) {
  const worldH = Math.max(WORLD_H, MIN_WORLD_W / aspect);
  const halfH = worldH / 2;
  const halfW = halfH * aspect;
  cam.left = -halfW;
  cam.right = halfW;
  cam.top = halfH;
  cam.bottom = -halfH;
  cam.near = 0.1;
  cam.far = 2000;
  cam.position.set(0, 0, 800);
  cam.updateProjectionMatrix();
}

/**
 * A text label as a sprite (the only 3D text in the lab: genotype chips).
 * `size` is the world-unit height of the glyphs.
 */
export function makeLabel(
  T: Three,
  text: string,
  opts: { color?: string; size?: number; weight?: number; bg?: string | null } = {}
) {
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 128;
  const g = cv.getContext("2d")!;
  if (opts.bg) { g.fillStyle = opts.bg; g.fillRect(0, 0, 512, 128); }
  g.font = `${opts.weight ?? 700} 68px -apple-system, system-ui, "Segoe UI", sans-serif`;
  g.fillStyle = opts.color ?? "#1d1d1f";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 256, 66);
  const tex = new T.CanvasTexture(cv);
  tex.anisotropy = 4;
  const spr = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  const size = opts.size ?? 20;
  spr.scale.set(size * 4, size, 1);
  spr.renderOrder = 20;
  return spr;
}

/** Rounded-rectangle path points (for circuit wires etc.). */
export function roundedRectPoints(T: Three, hx: number, hy: number, r: number, seg = 8) {
  const pts: import("three").Vector2[] = [];
  const corners: [number, number, number][] = [
    [hx - r, hy - r, 0], [-hx + r, hy - r, Math.PI / 2],
    [-hx + r, -hy + r, Math.PI], [hx - r, -hy + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      pts.push(new T.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
    }
  }
  return pts;
}

/** Perspective-free depth: a thin extruded slab from a shape. */
export function slab(T: Three, w: number, h: number, depth: number, color: number, opacity = 1) {
  const geo = new T.BoxGeometry(w, h, depth);
  const mat = new T.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.05, transparent: opacity < 1, opacity });
  const m = new T.Mesh(geo, mat);
  m.castShadow = false;
  return m;
}
