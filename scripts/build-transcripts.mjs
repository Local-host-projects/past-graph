/**
 * scripts/build-transcripts.mjs
 *
 * Converts yt-dlp caption files into the lab's transcript format:
 *
 *   scripts/transcripts/raw/<yid>*.vtt   →  <yid>.json + <yid>.txt
 *
 * Auto captions are rolling: each cue repeats the previous line. The parser
 * strips markup, drops exact repeats, and then compacts to one line per ~40 s
 * so a 2.5-hour lecture becomes ~200 readable lines.
 */
import fs from "node:fs";
import path from "node:path";

const RAW = path.join("scripts", "transcripts", "raw");
const OUT = path.join("scripts", "transcripts");
fs.mkdirSync(OUT, { recursive: true });

const toMs = (stamp) => {
  const m = stamp.trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{1,3})$/);
  if (!m) return null;
  const [, h, mm, ss, ms] = m;
  return ((Number(h ?? 0) * 60 + Number(mm)) * 60 + Number(ss)) * 1000 + Number(ms.padEnd(3, "0"));
};
const mmss = (ms) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const clean = (s) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function parseVtt(text) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/);
  const cues = [];
  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    const tIdx = lines.findIndex((l) => l.includes("-->"));
    if (tIdx < 0) continue;
    const [a, b] = lines[tIdx].split("-->");
    const start = toMs(a);
    if (start === null) continue;
    const body = clean(lines.slice(tIdx + 1).join(" "));
    if (!body) continue;
    const prev = cues[cues.length - 1];
    if (prev && prev[1] === body) continue;
    // auto captions often extend the previous line with the same words
    if (prev && body.startsWith(prev[1])) {
      cues[cues.length - 1] = [prev[0], body];
      continue;
    }
    cues.push([start, body]);
  }
  return cues;
}

function compact(cues, everyMs = 40000) {
  const lines = [];
  let bucket = [];
  let bucketStart = cues[0]?.[0] ?? 0;
  for (const [ms, text] of cues) {
    if (ms - bucketStart >= everyMs && bucket.length) {
      lines.push(`[${mmss(bucketStart)}] ${bucket.join(" ")}`);
      bucket = [];
      bucketStart = ms;
    }
    bucket.push(text);
  }
  if (bucket.length) lines.push(`[${mmss(bucketStart)}] ${bucket.join(" ")}`);
  return lines.join("\n");
}

if (!fs.existsSync(RAW)) {
  console.error(`no raw dir at ${RAW} — run yt-dlp first`);
  process.exit(1);
}

const files = fs.readdirSync(RAW).filter((f) => /\.(vtt|srv3|json3)$/i.test(f));
const byYid = new Map();
for (const f of files) {
  const yid = f.split(".")[0];
  if (!/^[\w-]{11}$/.test(yid)) continue;
  const list = byYid.get(yid) ?? [];
  list.push(f);
  byYid.set(yid, list);
}

const report = [];
for (const [yid, list] of byYid) {
  // prefer a manual track over auto-generated: yt-dlp names manual "en" and auto "en-orig"/"en"
  const ranked = [...list].sort((a, b) => {
    const score = (n) => (/\.en\.vtt$/i.test(n) ? 0 : /\.en-orig\./i.test(n) ? 1 : 2);
    return score(a) - score(b);
  });
  let cues = [];
  let used = null;
  for (const f of ranked) {
    const text = fs.readFileSync(path.join(RAW, f), "utf8");
    const parsed = /\.json3$/i.test(f) ? [] : parseVtt(text);
    if (parsed.length > cues.length) { cues = parsed; used = f; }
  }
  if (!cues.length) { report.push(`${yid}  empty`); continue; }
  const dur = cues[cues.length - 1][0] + 4000;
  fs.writeFileSync(path.join(OUT, `${yid}.json`), JSON.stringify({ yid, dur, source: used, cues }));
  fs.writeFileSync(path.join(OUT, `${yid}.txt`), compact(cues) + "\n");
  report.push(`${yid}  ${cues.length} cues · ${(dur / 60000).toFixed(0)} min · ${used}`);
}
console.log(report.join("\n") || "no caption files found");
