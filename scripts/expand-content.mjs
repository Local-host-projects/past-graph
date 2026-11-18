/**
 * scripts/expand-content.mjs
 *
 * Expands the practice + reading layer:
 *   1. Economics papers 2021–2025 (the subject had ZERO questions) + constructives
 *   2. Top-ups for thin subjects: physics, chemistry, biology, mathematics
 *   3. 22 articles (12 premium-shelf + 10 free) and 3 new sims rows
 *   4. 14 annotation blanks (kind: "blanks" — token-tray fill-ins)
 *
 * Duplicate-stem guard: questions whose exact stem already exists are
 * skipped, so reruns are safe. Articles/sims upsert on slug.
 *
 * Run WITHOUT --go for a dry plan.
 */
import fs from "node:fs";
import crypto from "node:crypto";

import { econPapers, econMulti } from "./content-data/econ.mjs";
import { singles as physSingles, multis as physMultis } from "./content-data/physics.mjs";
import { singles as chemSingles } from "./content-data/chem.mjs";
import { singles as bioSingles } from "./content-data/bio.mjs";
import { singles as mathSingles } from "./content-data/math.mjs";
import { premiumArticles } from "./content-data/articles-premium.mjs";
import { freeArticles, newSims } from "./content-data/articles-free.mjs";
import { blanksQs } from "./content-data/blanks.mjs";

const env = fs.readFileSync(".env.local", "utf8");
const envGet = (name) => {
  const line = env.split(/\r?\n/).find((l) => l.startsWith(name + "="));
  return line ? line.slice(name.length + 1).trim() : "";
};
const REST = envGet("NEXT_PUBLIC_SUPABASE_URL") + "/rest/v1";
const SERVICE = envGet("SUPABASE_SERVICE_ROLE_KEY");
const GO = process.argv.includes("--go");
if (!REST || !SERVICE) { console.error("missing env"); process.exit(1); }
const H = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "content-type": "application/json" };

/* ------------------------------------------------------------ helpers */
const OPTS = (arr) => arr.map((text, i) => ({ label: String.fromCharCode(65 + i), text }));
const uid = () => crypto.randomUUID();

const addQ = (subject, year, qnum, q) => questions.push({
  subject, year, qnum, topic: q.topic, stem: q.stem, opts: q.opts, ans: q.ans,
  expl: q.expl, f: Boolean(q.f), d: q.d ?? 2, steps: q.steps ?? null,
  kind: q.kind === "blanks" ? "blanks" : q.steps ? "multi" : "single",
});
const questions = [];

/* The questions table hard-requires: year 2000–2025, qnum unique per
   subject-year, is_free GENERATED from (year >= 2021) — never insert it. */
const YEARS = Array.from({ length: 26 }, (_, i) => 2000 + i);
const yearCursor = {};
const nextYear = (subject) => {
  if (yearCursor[subject] === undefined) yearCursor[subject] = 0;
  return YEARS[yearCursor[subject]++ % YEARS.length];
};

/* econ papers keep their authored years (2021–2025 — the free shelf);
   the constructives ride the last paper */
for (const paper of econPapers) {
  paper.qs.forEach((q, i) => addQ("economics", paper.year, i + 1, q));
}
econMulti.forEach((q, i) => addQ("economics", 2025, 21 + i, q));
/* banks: spread round-robin across the whole archive (premium keeps depth) */
const bank = (subject, list) => list.forEach((q) => addQ(subject, nextYear(subject), null, q));
bank("physics", physSingles);
bank("physics", physMultis);
bank("chemistry", chemSingles);
bank("biology", bioSingles);
bank("mathematics", mathSingles);

/* annotation blanks: token-tray fill-ins across the syllabus — each carries
   its own subject; they ride nextYear() like the other banks */
blanksQs.forEach((q) => addQ(q.subject, nextYear(q.subject), null, q));

const articleRows = [...premiumArticles, ...freeArticles];

/* ------------------------------------------------------------ dedupe vs DB */
async function fetchAll(url) {
  const out = [];
  const size = 1000;
  for (let off = 0; ; off += size) {
    const r = await fetch(`${url}&limit=${size}&offset=${off}`, { headers: H });
    const chunk = await r.json();
    if (!Array.isArray(chunk) || !chunk.length) break;
    out.push(...chunk);
    if (chunk.length < size) break;
  }
  return out;
}

const existingStems = new Set(
  (await fetchAll(`${REST}/questions?select=stem&stem=not.is.null`)).map((r) => r.stem.trim())
);
const plan = questions.filter((q) => {
  if (existingStems.has(q.stem.trim())) return false;
  existingStems.add(q.stem.trim()); // also dedupes within the plan
  return true;
});

const existingSlugs = new Set((await fetchAll(`${REST}/articles?select=slug`)).map((a) => a.slug));
const newArticles = articleRows.filter((a) => !existingSlugs.has(a.slug));

/* continue qnum numbering per subject-year (unique constraint) */
const triplets = await fetchAll(`${REST}/questions?select=subject_slug,year,qnum`);
const maxQnum = {};
for (const t of triplets) {
  const k = `${t.subject_slug}|${t.year}`;
  maxQnum[k] = Math.max(maxQnum[k] ?? 0, t.qnum);
}

/* ------------------------------------------------------------ dry plan */
const bySubjectYear = {};
for (const q of plan) {
  if (q.qnum === null) {
    const k = `${q.subject}|${q.year}`;
    maxQnum[k] = (maxQnum[k] ?? 0) + 1;
    q.qnum = maxQnum[k];
  }
}
for (const q of plan) {
  const key = `${q.subject} ${q.year}`;
  bySubjectYear[key] = bySubjectYear[key] ?? { n: 0, topics: {} };
  bySubjectYear[key].n++;
  bySubjectYear[key].topics[q.topic] = (bySubjectYear[key].topics[q.topic] ?? 0) + 1;
}
console.log("── dry plan ─────────────────────────────────────");
for (const [k, v] of Object.entries(bySubjectYear).sort()) {
  console.log(`${k.padEnd(20)} ${String(v.n).padStart(2)} questions  free:${Number(k.slice(-4)) >= 2021 ? "yes" : "no "}  topics: ${Object.entries(v.topics).map(([t, c]) => `${t}×${c}`).join(", ")}`);
}
console.log(`questions total: ${plan.length}  (is_free is GENERATED: year >= 2021)`);
console.log(`articles: ${newArticles.length} new (${articleRows.length - newArticles.length} already present) — premium: ${premiumArticles.length}, free: ${freeArticles.length}`);
console.log(`sims: ${newSims.length} → ${newSims.map((s) => s.slug).join(", ")}`);
if (!GO) { console.log("dry run only — pass --go to write."); process.exit(0); }

/* ------------------------------------------------------------ write */
const qRows = plan.map((q) => ({
  id: uid(),
  subject_slug: q.subject,
  topic_slug: q.topic,
  year: q.year,
  qnum: q.qnum,
  stem: q.stem,
  options: OPTS(q.opts),
  answer: q.ans,
  explanation: q.expl,
  kind: q.kind,
  steps: q.steps,
  difficulty: q.d,
  /* is_free is a generated column — the DB derives it from year >= 2021 */
}));

let ok = 0, fail = 0;
for (let i = 0; i < qRows.length; i += 100) {
  const chunk = qRows.slice(i, i + 100);
  const r = await fetch(`${REST}/questions`, {
    method: "POST", headers: { ...H, Prefer: "return=minimal,resolution=ignore-duplicates" },
    body: JSON.stringify(chunk),
  });
  if (r.ok) ok += chunk.length; else { fail += chunk.length; console.error(`questions batch @${i}:`, r.status, (await r.text()).slice(0, 300)); }
}
console.log(`questions inserted: ${ok} (failed: ${fail})`);
if (fail && plan.some((q) => q.kind === "blanks")) {
  console.log("");
  console.log("⚠ some question inserts failed — if the error mentions questions_kind_check,");
  console.log("  run supabase/upgrade.sql in the Supabase SQL editor (it widens the kind");
  console.log("  check to allow 'blanks'), then rerun: node scripts/expand-content.mjs --go");
}

const artRows = newArticles.map((a) => ({
  slug: a.slug, subject_slug: a.subject, topic_slug: a.topic,
  title: a.title, summary: a.summary, body: a.body, read_min: a.read_min,
}));
let artOk = 0;
for (const a of artRows) {
  const r = await fetch(`${REST}/articles?on_conflict=slug`, {
    method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(a),
  });
  if (r.ok) artOk++; else console.error(`article ${a.slug}:`, r.status, (await r.text()).slice(0, 300));
}
console.log(`articles upserted: ${artOk}`);

let simOk = 0, simBlocked = false;
for (const s of newSims) {
  const r = await fetch(`${REST}/sims?on_conflict=slug`, {
    method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ slug: s.slug, topic_slug: s.topic, kind: s.kind, title: s.title, blurb: s.blurb }),
  });
  if (r.ok) simOk++;
  else {
    simBlocked = true;
    console.error(`sim ${s.slug}:`, r.status, (await r.text()).slice(0, 200));
  }
}
console.log(`sims upserted: ${simOk}`);
if (simBlocked) {
  console.log("");
  console.log("⚠ sims blocked by the DB kind check (sims_kind_check).");
  console.log("  Run supabase/upgrade.sql in the Supabase SQL editor (it now");
  console.log("  allows punnett/demand/snell), then rerun: node scripts/expand-content.mjs --go");
}
console.log("done.");
