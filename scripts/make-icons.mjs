/**
 * PWA icon generator — pure Node (zlib PNG writer), no canvas dependency.
 * Art: the Past Graph rising line in exam-hall colors on a cream tile.
 * Run: node scripts/make-icons.mjs
 */
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

const CREAM = [245, 240, 228];
const INK = [32, 26, 17];
const ZEST = [255, 99, 32];
const LEAF = [200, 245, 91];

/* ------------------------- PNG encoding ------------------------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * width * 4, width * 4).copy(
      raw,
      y * (width * 4 + 1) + 1
    );
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ------------------------- raster art ------------------------- */
/* Rising line points, normalized 0..1 (x right, y down). */
const PTS = [
  [0.21, 0.74],
  [0.43, 0.55],
  [0.61, 0.45],
  [0.83, 0.21],
];

/**
 * Render one icon at `size` px. Supersample S×S per pixel for antialiasing.
 * design: { fullBleed?: bool, artScale?: number }
 *   fullBleed  -> opaque cream to the edges (apple-touch / maskable)
 *   artScale   -> shrink art into the maskable safe zone
 */
function render(size, design, S) {
  const out = Buffer.alloc(size * size * 4);
  const scale = design.artScale ?? 1;
  const off = (1 - scale) / 2;
  const P = PTS.map(([x, y]) => [(off + x * scale) * size, (off + y * scale) * size]);
  const lineHalf = 7.5 * scale * (size / 192); // proportional line width
  const nodes = P.map((p) => ({ p, r: 0.068 * size * scale, c: ZEST }));
  nodes[nodes.length - 1] = {
    p: P[P.length - 1],
    r: 0.10 * size * scale,
    c: LEAF,
    ring: 0.034 * size * scale,
    rc: INK,
  };
  const pad = Math.round(size * 0.115);
  const rad = Math.round(size * 0.19);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      let n = 0;
      for (let sy = 0; sy < S; sy++) {
        for (let sx = 0; sx < S; sx++) {
          const x = px + (sx + 0.5) / S;
          const y = py + (sy + 0.5) / S;
          /* tile coverage */
          let base = null;
          if (design.fullBleed) base = CREAM;
          else if (x >= pad && x <= size - pad && y >= pad && y <= size - pad) {
            const cx2 = Math.max(pad + rad - x, x - (size - pad - rad), 0);
            const cy2 = Math.max(pad + rad - y, y - (size - pad - rad), 0);
            if (Math.hypot(cx2, cy2) <= rad) base = CREAM;
          }
          if (base) {
            let ink = false, ring = false, leaf = false, zest = false;
            for (let s = 0; s < P.length - 1; s++) {
              const [x1, y1] = P[s], [x2, y2] = P[s + 1];
              const dx = x2 - x1, dy = y2 - y1;
              const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
              const tt = Math.max(0, Math.min(1, t));
              const d = Math.hypot(x - (x1 + tt * dx), y - (y1 + tt * dy));
              if (d < lineHalf) ink = true;
            }
            for (const nd of nodes) {
              const d = Math.hypot(x - nd.p[0], y - nd.p[1]);
              if (nd.ring && d > nd.r && d <= nd.r + nd.ring) ring = true;
              if (d <= nd.r) nd.c === LEAF ? (leaf = true) : (zest = true);
            }
            const col = ring ? INK : leaf ? LEAF : zest ? ZEST : ink ? INK : base;
            r += col[0]; g += col[1]; b += col[2]; a += 255;
          }
          n++;
        }
      }
      const k = (py * size + px) * 4;
      out[k] = Math.round(r / n);
      out[k + 1] = Math.round(g / n);
      out[k + 2] = Math.round(b / n);
      out[k + 3] = Math.round(a / n);
    }
  }
  return out;
}

const outDir = path.join(process.cwd(), "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const jobs = [
  { file: "icon-192.png", size: 192, design: {}, S: 3 },
  { file: "icon-512.png", size: 512, design: {}, S: 2 },
  { file: "apple-touch-icon.png", size: 180, design: { fullBleed: true }, S: 3 },
  { file: "icon-maskable-512.png", size: 512, design: { fullBleed: true, artScale: 0.74 }, S: 2 },
];

for (const j of jobs) {
  const png = encodePNG(j.size, j.size, render(j.size, j.design, j.S));
  fs.writeFileSync(path.join(outDir, j.file), png);
  console.log(`${j.file}: ${png.length} bytes`);
}
console.log("done");
