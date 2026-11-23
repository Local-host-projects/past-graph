/**
 * scripts/fetch-transcripts.mjs
 *
 * Pulls caption cues off YouTube (no API key) for the long videos whose
 * annotations need real timestamps instead of fractions of duration.
 *
 *   node scripts/fetch-transcripts.mjs n-11FijFAmM kqe9tEcZkno ...
 *
 * Writes:
 *   scripts/transcripts/<yid>.json  full cue list { yid, title, dur, cues:[[ms,text]] }
 *   scripts/transcripts/<yid>.txt   compact "[mm:ss] text" every ~40 s (commit this)
 *
 * The json is gitignored; the txt is the provenance we keep in the repo.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join("scripts", "transcripts");
fs.mkdirSync(OUT, { recursive: true });

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const ids = process.argv.slice(2).filter((a) => /^[\w-]{11}$/.test(a));
if (!ids.length) {
  console.error("usage: node scripts/fetch-transcripts.mjs <youtube_id> ...");
  process.exit(1);
}

const entity = (s) =>
  s
    .replace(/&amp;#39;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;quot;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&amp;lt;/g, "<")
    .replace(/&lt;/g, "<")
    .replace(/&amp;gt;/g, ">")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const mmss = (ms) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

async function watchPage(yid) {
  const res = await fetch(`https://www.youtube.com/watch?v=${yid}&hl=en`, {
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
    signal: AbortSignal.timeout(30000),
  });
  if (res.status !== 200) throw new Error(`watch page ${res.status}`);
  return res.text();
}

function parseCues(json) {
  const cues = [];
  for (const ev of json?.events ?? []) {
    if (!ev.segs) continue;
    const text = entity(ev.segs.map((s) => s.utf8 ?? "").join(""));
    if (!text) continue;
    cues.push([ev.tStartMs ?? 0, text]);
  }
  return cues;
}

async function captions(yid) {
  const html = await watchPage(yid);
  const m = html.match(/"captionTracks":(\[.*?\])/);
  if (!m) return null;
  let tracks;
  try {
    tracks = JSON.parse(m[1].replace(/\\u0026/g, "&").replace(/\\"/g, '"'));
  } catch {
    tracks = JSON.parse(m[1].replace(/\\u0026/g, "&"));
  }
  if (!Array.isArray(tracks) || !tracks.length) return null;
  // prefer a manual English track, then any English, then whatever exists
  const pick =
    tracks.find((t) => t.languageCode === "en" && !t.kind) ??
    tracks.find((t) => t.languageCode?.startsWith("en")) ??
    tracks[0];
  const url = pick.baseUrl + "&fmt=json3";
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
    signal: AbortSignal.timeout(30000),
  });
  if (res.status !== 200) throw new Error(`caption fetch ${res.status}`);
  const body = await res.text();
  if (!body.trim()) return null;
  return { json: JSON.parse(body), kind: pick.kind ?? "manual", lang: pick.languageCode };
}

function compact(cues, everyMs = 40000) {
  const lines = [];
  let bucket = [];
  let bucketStart = cues[0]?.[0] ?? 0;
  for (const [ms, text] of cues) {
    if (ms - bucketStart >= everyMs) {
      if (bucket.length) lines.push(`[${mmss(bucketStart)}] ${bucket.join(" ")}`);
      bucket = [];
      bucketStart = ms;
    }
    bucket.push(text);
  }
  if (bucket.length) lines.push(`[${mmss(bucketStart)}] ${bucket.join(" ")}`);
  return lines.join("\n");
}

const summary = [];
for (const yid of ids) {
  const jsonPath = path.join(OUT, `${yid}.json`);
  const txtPath = path.join(OUT, `${yid}.txt`);
  if (fs.existsSync(txtPath) && fs.existsSync(jsonPath)) {
    summary.push(`${yid}  cached`);
    continue;
  }
  try {
    const got = await captions(yid);
    if (!got) { summary.push(`${yid}  NO CAPTIONS`); continue; }
    const cues = parseCues(got.json);
    if (!cues.length) { summary.push(`${yid}  empty cues`); continue; }
    const dur = cues[cues.length - 1][0] + 4000;
    const titleMatch = (await watchPage(yid)).match(/<title>([^<]*)<\/title>/);
    const title = entity((titleMatch?.[1] ?? yid).replace(/ - YouTube$/, ""));
    fs.writeFileSync(jsonPath, JSON.stringify({ yid, title, dur, kind: got.kind, lang: got.lang, cues }));
    fs.writeFileSync(txtPath, compact(cues) + "\n");
    summary.push(`${yid}  ${cues.length} cues · ${(dur / 60000).toFixed(0)} min · ${got.kind} · ${title.slice(0, 50)}`);
  } catch (e) {
    summary.push(`${yid}  FAILED: ${String(e).slice(0, 90)}`);
  }
  await new Promise((r) => setTimeout(r, 800));
}
console.log(summary.join("\n"));
