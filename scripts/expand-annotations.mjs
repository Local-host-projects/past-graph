/**
 * scripts/expand-annotations.mjs
 *
 * Replaces the placeholder annotations (3 notes, 40 s each, placed at
 * fractions of the duration) with transcript-timed annotations for the long
 * videos — the ones where fraction placement leaves an hour of dead timeline.
 *
 *   node scripts/expand-annotations.mjs          # dry plan
 *   node scripts/expand-annotations.mjs --go     # replace in the DB
 *
 * Source: scripts/content-data/annotations-deep.mjs
 * Provenance: scripts/transcripts/<yid>.txt (fetched by fetch-transcripts.mjs)
 *
 * Idempotent: every yid in DEEP is deleted-then-inserted, so re-running after
 * an edit always lands on exactly the authored set. Unknown sim/article slugs
 * are dropped rather than allowed to break the insert.
 */
import fs from "node:fs";

const env = fs.readFileSync(".env.local", "utf8");
const envGet = (name) => {
  const line = env.split(/\r?\n/).find((l) => l.startsWith(name + "="));
  return line ? line.slice(name.length + 1).trim() : "";
};
const URL_BASE = envGet("NEXT_PUBLIC_SUPABASE_URL");
const SERVICE = envGet("SUPABASE_SERVICE_ROLE_KEY");
const GO = process.argv.includes("--go");

if (!URL_BASE || !SERVICE) { console.error("missing env"); process.exit(1); }

const REST = URL_BASE + "/rest/v1/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const H = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

async function rest(method, table, { query = "", body, prefer } = {}) {
  const headers = { ...H };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (prefer) headers.Prefer = prefer;
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(REST + table + query, {
        method, headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
      const txt = await res.text();
      let parsed = null;
      try { parsed = JSON.parse(txt); } catch { /* empty */ }
      if (res.status >= 500) { lastErr = new Error(`${table} ${res.status}: ${txt.slice(0, 160)}`); await sleep(1200 * (attempt + 1)); continue; }
      if (res.status >= 400) throw new Error(`${table} ${res.status}: ${txt.slice(0, 300)}`);
      return parsed ?? [];
    } catch (e) {
      lastErr = e;
      if (String(e).includes("400") || String(e).includes("404")) throw e;
      await sleep(1200 * (attempt + 1));
    }
  }
  throw lastErr;
}

const { DEEP } = await import("./content-data/annotations-deep.mjs");

const ids = Object.keys(DEEP);
const [videos, sims, articles] = await Promise.all([
  rest("GET", "videos", { query: `?select=id,youtube_id,title,topic_slug&youtube_id=in.(${ids.map((i) => `"${i}"`).join(",")})` }),
  rest("GET", "sims", { query: "?select=slug,topic_slug" }),
  rest("GET", "articles", { query: "?select=slug,topic_slug" }),
]);
const byYid = Object.fromEntries(videos.map((v) => [v.youtube_id, v]));
const simSlugs = new Set(sims.map((s) => s.slug));
const articleSlugs = new Set(articles.map((a) => a.slug));

console.log(`== annotations: ${ids.length} videos authored · ${GO ? "WRITES ON" : "dry run"} ==`);

let wrote = 0, notes = 0, missing = [];
for (const yid of ids) {
  const video = byYid[yid];
  if (!video) { missing.push(yid); continue; }
  const rows = [];
  const seen = new Set();
  for (const a of DEEP[yid]) {
    const t_start = Math.max(0, Math.round(a.t));
    const t_end = Math.max(t_start + 5, Math.round(a.end ?? a.t + 45));
    if (seen.has(t_start)) { console.log(`  ! ${yid} duplicate t=${t_start} (${a.title})`); continue; }
    seen.add(t_start);
    let kind = a.kind ?? "note";
    let sim_slug = a.sim ?? null;
    let article_slug = a.article ?? null;
    if (kind === "sim" && (!sim_slug || !simSlugs.has(sim_slug))) { kind = "note"; sim_slug = null; }
    if (kind === "article" && (!article_slug || !articleSlugs.has(article_slug))) { kind = "note"; article_slug = null; }
    rows.push({ video_id: video.id, t_start, t_end, title: a.title, body: a.body, kind, sim_slug, article_slug });
  }
  if (!rows.length) continue;
  notes += rows.length;
  if (!GO) {
    const span = Math.max(...rows.map((r) => r.t_end));
    console.log(`plan: ${yid} → ${rows.length} annotations, last ends ${Math.floor(span / 60)}:${String(span % 60).padStart(2, "0")} (${video.title.slice(0, 44)})`);
    continue;
  }
  await rest("DELETE", "video_annotations", { query: `?video_id=eq.${video.id}` });
  await rest("POST", "video_annotations", { body: rows, prefer: "return=minimal" });
  wrote++;
  console.log(`ok: ${yid} → ${rows.length} annotations (${video.title.slice(0, 44)})`);
  await sleep(250);
}

if (missing.length) console.log(`not in db (skipped): ${missing.join(", ")}`);
console.log(`\n${GO ? `replaced ${wrote} videos, ${notes} annotations` : `would write ${notes} annotations across ${ids.length - missing.length} videos`}`);
