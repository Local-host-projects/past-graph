import fs from "node:fs";
const env = fs.readFileSync(".env.local", "utf8");
let url = "", key = "";
for (const line of env.split(/\r?\n/)) {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL")) url = line.split("=")[1].trim();
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")) key = line.split("=").slice(1).join("=").trim();
}
const H = { apikey: key, Authorization: "Bearer " + key };
const q = async (table, params = {}) => {
  const u = new URL(url + "/rest/v1/" + table);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const res = await fetch(u, { headers: H, signal: AbortSignal.timeout(30000) });
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { return { raw: txt.slice(0, 200) }; }
};

const vids = await q("videos", { select: "id,title,channel,topic_slug", order: "created_at.asc" });
const anns = await q("video_annotations", { select: "video_id" });
const counts = {};
for (const a of anns) counts[a.video_id] = (counts[a.video_id] || 0) + 1;
let zero = 0, threePlus = 0;
const byChannel = {};
for (const v of vids) {
  byChannel[v.channel] = (byChannel[v.channel] || 0) + 1;
  const n = counts[v.id] || 0;
  if (n >= 3) threePlus++; else zero++;
}
console.log(`videos: ${vids.length} | annotations: ${anns.length} | ≥3 anns: ${threePlus} | <3: ${zero}`);
console.log("channels:", JSON.stringify(byChannel, null, 0));

const econt = await q("topics", { select: "slug,subject_slug", subject_slug: "eq.economics" });
const econv = await q("videos", { select: "id,channel", subject_slug: "eq.economics" });
const econa = await q("articles", { select: "slug,subject_slug", subject_slug: "eq.economics" });
const econq = await q("questions", { select: "id", subject_slug: "eq.economics", limit: 1 });
console.log("econ topics:", econt.length, "econ videos:", econv.length, "econ articles:", econa.length, "econ questions:", Array.isArray(econq) ? econq.length : "?");

// sanity: any annotation with t_end > duration impossible check — sample extremes
const extremes = await q("video_annotations", { select: "t_start,t_end", order: "t_end.desc", limit: 3 });
console.log("largest annotation windows (s):", extremes.map((x) => `${x.t_start}-${x.t_end}`).join(" | "));
