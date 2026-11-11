/**
 * scripts/expand-videos.mjs
 *
 * Expands the graph:
 *   1. An economics scaffold (surf-only subject: videos + articles, no papers yet)
 *   2. ~28 new validated videos (3Blue1Brown, Veritasium, Economics Explained,
 *      TED-Ed, Amoeba Sisters, Periodic Videos, Kurzgesagt, AlphaPhoenix,
 *      Steve Mould, The Efficient Engineer) — every ID oembed-verified, duration
 *      parsed from the watch page, 3+ annotations each
 *   3. Tops up existing videos with fewer than 3 annotations
 *
 * Writes use the service-role key. Run WITHOUT --go for a dry plan.
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

async function restInsert(table, rows, prefer = "return=representation") {
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(REST + table, {
        method: "POST",
        headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", Prefer: prefer },
        body: JSON.stringify(rows),
        signal: AbortSignal.timeout(30000),
      });
      const txt = await res.text();
      let body = null;
      try { body = JSON.parse(txt); } catch { /* empty */ }
      if (res.status >= 500) { lastErr = new Error(`status ${res.status}: ${txt.slice(0, 160)}`); await sleep(1500 * (attempt + 1)); continue; }
      return { status: res.status, body: Array.isArray(body) ? body : txt.slice(0, 300) };
    } catch (e) {
      lastErr = e;
      await sleep(1500 * (attempt + 1));
    }
  }
  throw lastErr ?? new Error("restInsert failed");
}

async function restSelect(table, params) {
  const u = new URL(REST + table);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const res = await fetch(u, { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` }, signal: AbortSignal.timeout(30000) });
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { return []; }
}

/* ---------- oembed validation + duration parsing -------------------- */
async function oembed(yid) {
  const u = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${yid}&format=json`;
  const res = await fetch(u, { signal: AbortSignal.timeout(20000) });
  if (res.status !== 200) return null;
  return await res.json();
}

async function duration(yid) {
  // watch pages 429-captcha under load — the innertube player endpoint is stable
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
        body: JSON.stringify({
          context: { client: { clientName: "WEB", clientVersion: "2.20240101.00.00", hl: "en" } },
          videoId: yid,
        }),
        signal: AbortSignal.timeout(25000),
      });
      if (res.status === 200) {
        const j = await res.json();
        const seconds = Number(j?.videoDetails?.lengthSeconds);
        if (Number.isFinite(seconds) && seconds > 0) return seconds;
      }
    } catch { /* retry */ }
    await sleep(1200);
  }
  return null;
}

/* ---------- candidates ---------------------------------------------- */
const CANDIDATES = [
  // 3Blue1Brown — mathematics
  { yid: "WUvTyaaNkzM", subject: "mathematics", topic: "calculus", blurb: "The big idea of calculus: area before slope — one connected chain of ideas." },
  { yid: "9vKqVkMQHKk", subject: "mathematics", topic: "calculus", blurb: "The paradox of the derivative — where the idea actually comes from." },
  { yid: "S0_qX4VJhMQ", subject: "mathematics", topic: "calculus", blurb: "Derivative formulas through geometry: the power rule you can see." },
  { yid: "rfG8ce4nNh0", subject: "mathematics", topic: "calculus", blurb: "Integration and the fundamental theorem — what area has to do with slope." },
  { yid: "YG15m2VwSjA", subject: "mathematics", topic: "calculus", blurb: "Chain rule and product rule, visualised — patterns before formulas." },
  { yid: "HZGCoVF3YvM", subject: "mathematics", topic: "statistics", blurb: "Bayes' theorem as geometry: updating beliefs with pictures, not panic." },
  { yid: "MHXO86wKeDY", subject: "mathematics", topic: "quadratics", blurb: "A simpler view of the quadratic formula — completing the square as the engine." },
  { yid: "T0HyWIFbsHQ", subject: "mathematics", topic: "quadratics", blurb: "Completing the square, proved with a picture — the missing corner is the whole story." },
  // physics — Veritasium / AlphaPhoenix / TED-Ed / Steve Mould / Efficient Engineer
  { yid: "bHIhgxav9LY", subject: "physics", topic: "electricity", blurb: "The biggest misconception about electricity: energy doesn't ride inside the electrons." },
  { yid: "oI_X2cMHNe0", subject: "physics", topic: "electricity", blurb: "How electricity actually works — Veritasium settles the circuit thought experiment." },
  { yid: "2Vrhk5OjBP8", subject: "physics", topic: "electricity", blurb: "1000 metres of wire and a real lab test — the circuit debate settled by measurement." },
  { yid: "BLYoyLcdGPc", subject: "physics", topic: "work-energy", blurb: "Two blocks, one bullet, one counterintuitive answer — rotational energy hides the difference." },
  { yid: "Q10_srZ-pbs", subject: "physics", topic: "modern-physics", blurb: "The closest we've come to a theory of everything — least action underpins all of physics." },
  { yid: "C-FEVzI8oe8", subject: "physics", topic: "dynamics", blurb: "Shear force and bending moment diagrams — the beam's diary, and where it will fail." },
  { yid: "yc2-363MIQs", subject: "physics", topic: "electricity", blurb: "The science of static electricity — charge imbalance finding balance." },
  { yid: "gMAKamGIiMc", subject: "physics", topic: "fluids-heat", blurb: "The levitating liquid pendulum — vibration turns pressure into a supporting cushion." },
  // biology — Kurzgesagt / Bozeman / Amoeba Sisters
  { yid: "hOfRN0KihOU", subject: "biology", topic: "evolution", blurb: "How evolution works — mutation, selection and time with no plan attached." },
  { yid: "R6La6_kIr9g", subject: "biology", topic: "evolution", blurb: "Natural selection, patiently walked through: variation, heritability, survival." },
  { yid: "Qqe4thU-os8", subject: "biology", topic: "genetics", blurb: "DNA replication step by step — each new double helix keeps one old strand." },
  { yid: "oefAI2x2CQM", subject: "biology", topic: "genetics", blurb: "Transcription and translation — the central dogma in one calm walk-through." },
  { yid: "JQByjprj_mA", subject: "biology", topic: "genetics", blurb: "DNA vs RNA — why the working copy deserves limelight too." },
  // chemistry — Periodic Videos / TED-Ed
  { yid: "kqe9tEcZkno", subject: "chemistry", topic: "periodicity-bonding", blurb: "Investigating the periodic table with experiments — Mendeleev's gaps predicted the future." },
  { yid: "WIdWjqZsGgg", subject: "chemistry", topic: "acids-bases", blurb: "Whatever happened to acid rain — the chemistry problem policy actually fixed." },
  // english — TED-Ed
  { yid: "Wn_eBrIDUuc", subject: "english", topic: "lexis-structure", blurb: "Does grammar matter — descriptive vs prescriptive rules, argued cleanly." },
  { yid: "54prMaPn5Ls", subject: "english", topic: "lexis-structure", blurb: "How many verb tenses are there really? Two tenses, endless aspect." },
  // economics — Economics Explained (surf-only scaffold)
  { yid: "hKGwGAHznFQ", subject: "economics", topic: "countries", blurb: "Norway: is it the perfect economy? Oil, sovereignty and the fund that spends it forward." },
  { yid: "Ot4qdCs54ZE", subject: "economics", topic: "policy", blurb: "The Dutch case: why wealth inequality shrugs at tax codes — systems own the gap." },
  { yid: "MsBbOaBcBfw", subject: "economics", topic: "macro-growth", blurb: "Ireland 2020: the fastest-growing economy on paper — what GDP hides behind accounting." },
  { yid: "VUnAr0Msx9c", subject: "economics", topic: "macro-growth", blurb: "The UK's economy mapped honestly — services productivity against stagnant output." },
];

/* authored annotations for NEW videos: [fraction, title, body] */
const NOTES = {
  "WUvTyaaNkzM": [
    [0.08, "Why area comes first", "The series starts with AREA, not slope — because dividing and compressing slices refunds every later rule."],
    [0.38, "Slices → limit", "Squeeze each slice thinner and the staircase melts into a curve. Result: area under one curve equals one level up."],
    [0.7, "The chain closes", "Derivatives and integrals come from the same shrinking-slice trick. That insight IS the course."],
  ],
  "9vKqVkMQHKk": [
    [0.12, "The paradox", "A secant never quite becomes a tangent — two points can never actually coincide. The fix: shrink the interval, not the points."],
    [0.45, "Δx shrinks", "Keep one end fixed, slide the other closer — the slope settles to a single number."],
    [0.78, "df/dx is born", "The derivative as a limit of average speeds — and why exam answers live in exact fractions of it."],
  ],
  "S0_qX4VJhMQ": [
    [0.1, "Areas give the rules", "Each derivative formula is an area statement in disguise — see the rectangle before the exponent."],
    [0.4, "Power rule", "d/dx xⁿ = n·xⁿ⁻¹ appears as a puff of geometry."],
    [0.72, "Trig shapes", "Cyclic motion gives sin and cos their rolling derivative pattern."],
  ],
  "rfG8ce4nNh0": [
    [0.1, "Two directions, one trick", "Summing slices builds integrals; slicing flows build derivatives — one coin, two faces."],
    [0.42, "Fundamental theorem", "Derivative of the area function returns the curve itself — area and slope are the same story."],
    [0.74, "FTC in practice", "∫ from a to b replaces limit-notation slog with antiderivative difference."],
  ],
  "YG15m2VwSjA": [
    [0.12, "Chain rule as zoom", "Composite motion: outer slope × inner slope — cameras focusing on cameras."],
    [0.45, "Product rule", "(fg)' = f'g + fg' — growing area strips of a rectangle explain every term."],
    [0.75, "Mixing patterns", "Chain + product nesting builds every differentiation question the paper sets."],
  ],
  "HZGCoVF3YvM": [
    [0.1, "Beliefs as areas", "Probability is a rectangle whose width re-balances as evidence arrives."],
    [0.4, "The update rule", "Bayes: prior × likelihood, renormalised — the picture IS the formula."],
    [0.72, "Rare disease trap", "A 99% accurate test ≠ 99% chance you're sick — base rates sit in the result."],
  ],
  "MHXO86wKeDY": [
    [0.1, "Formula you can rebuild", "The quadratic formula isn't a chant — it falls out of completing the square on ax² + bx + c = 0."],
    [0.5, "Half-b finds the centre", "Divide b by 2a and the square completes symmetrically around −b/2a."],
    [0.82, "Roots from symmetry", "± the leftover square root gives both solutions — symmetry does the bookkeeping."],
  ],
  "T0HyWIFbsHQ": [
    [0.12, "The square, literally", "x² + (b/a)x is a square missing a corner — complete it by adding (b/2a)²."],
    [0.5, "Add and subtract", "Add the corner and subtract it elsewhere — value unchanged, algebra visible."],
    [0.8, "Why it always works", "The formula's ± is just walking around the finished square's side length."],
  ],
  "bHIhgxav9LY": [
    [0.14, "The misconception", "Electrons don't carry the energy around a loop — the fields around the wires deliver it."],
    [0.4, "Poynting flow", "Energy flows through space from battery to lamp, crossing at the load — directed by those fields."],
    [0.72, "1-second switch", "Switch 1 metre or 1 light-year from the lamp: the lamp reacts almost instantly."],
  ],
  "oI_X2cMHNe0": [
    [0.1, "Recap of the trap", "The circuit time-scale puzzle: why did the lamp light so fast?"],
    [0.45, "The settling", "Early transients vs steady state — fields establish first, current organises after."],
    [0.76, "Where resistance lives", "The loop's impedance controls how much current settles in — the ohms sim recreates this balance."],
  ],
  "2Vrhk5OjBP8": [
    [0.1, "The setup", "Two light-seconds of wire, one battery, one bulb — the thought experiment built in a warehouse."],
    [0.42, "The measurement", "Scope on the bulb: how fast after switch-on? Measurement ended the internet argument."],
    [0.74, "What it means", "Real physics beats metaphors — the field interpretation carried the day."],
  ],
  "BLYoyLcdGPc": [
    [0.1, "The riddle", "Same bullet, same block — which side rises higher? Guess before physics answers."],
    [0.4, "Energy books", "The off-centre shot adds ROTATION — energy splits that way, hiding from gravity's share differently."],
    [0.7, "Answer", "The stick side rises higher — it recycles the extra energy into upward motion."],
  ],
  "Q10_srZ-pbs": [
    [0.08, "One principle", "Least action: nature prices every possible path and takes the cheapest — projectiles, waves, fields alike."],
    [0.4, "From action to motion", "Euler–Lagrange turns the price tag into F = ma."],
    [0.72, "Einstein's borrow", "The same principle steers gravity's geodesics — the closest unified view we own."],
  ],
  "C-FEVzI8oe8": [
    [0.1, "Beams keep diaries", "Shear force and bending moment diagrams read like a story of internal forces."],
    [0.38, "Signs and jumps", "Downward loads shear down; point moments kink the moment curve."],
    [0.7, "Peaks predict failure", "Max bending moment is where the beam gives way — design lives at the peaks."],
  ],
  "yc2-363MIQs": [
    [0.12, "What static is", "Charge separated by friction and trapped on insulators — the imbalance IS the voltage."],
    [0.45, "Induction", "Bring a charged rod near: the conductor's electrons relocate without contact."],
    [0.75, "The zap", "Air breaks down in a spark — charge balance restored, packet by packet."],
  ],
  "gMAKamGIiMc": [
    [0.12, "The levitating jar", "A pendulum hovers over shaken liquid — pressure and viscosity build the cushion."],
    [0.48, "The trick explained", "Fast vibration averages into a steady upward push — time-averaged forces."],
    [0.78, "Why it matters", "Acoustic levitation and granular physics borrow the same balancing act."],
  ],
  "hOfRN0KihOU": [
    [0.1, "No plan, just pressure", "Mutation writes every draft; selection keeps the readable ones."],
    [0.42, "Time does the rest", "Variation, then differential survival — two steps compounding over billions of years."],
    [0.74, "Proof street", "Fossils, embryos and shared chemistry all converge on one story."],
  ],
  "R6La6_kIr9g": [
    [0.1, "The syllogism", "Variation → heritability → differential reproduction → change. Four clauses, one engine."],
    [0.4, "The finches", "Beak data: drought reshapes beaks within seasons — selection in real time."],
    [0.72, "Drift vs selection", "Luck picks winners in small populations — selection and drift split the work."],
  ],
  "Qqe4thU-os8": [
    [0.1, "Semi-conservative", "Every new double helix keeps one old strand — the archive forwards, never rewrites."],
    [0.4, "Enzyme crew", "Helicase unzips, polymerase writes, ligase glues — a logistics plant."],
    [0.72, "Leading vs lagging", "One strand runs continuous, the other in fragments — direction matters."],
  ],
  "oefAI2x2CQM": [
    [0.1, "Central dogma", "DNA → RNA → protein: the archive, the working copy, the product."],
    [0.44, "Transcription", "RNA polymerase reads the gene into mRNA — nucleotide for nucleotide."],
    [0.74, "Translation", "Ribosomes read codons; tRNA shuttles amino acids; a stop codon ends the belt."],
  ],
  "JQByjprj_mA": [
    [0.12, "Shared backbone", "DNA and RNA differ at one sugar and one base — architecture twins."],
    [0.45, "Jobs split", "DNA archives; RNA runs errands: mRNA, tRNA, rRNA."],
    [0.75, "Why RNA led", "RNA may have run the cell before DNA took the archive desk — the RNA world."],
  ],
  "kqe9tEcZkno": [
    [0.1, "Mendeleev's nerve", "He left gaps and bet his table on unseen elements — gallium answered decades later."],
    [0.42, "Order from chemistry", "Similar reactivity clusters columns: same valence, same behaviour."],
    [0.74, "Lab proof", "Element demonstrations echo the periodic law — patterns you can burn."],
  ],
  "WIdWjqZsGgg": [
    [0.12, "The acid recipe", "SO₂, nitrogen oxides and rainwater make sulfuric and nitric acid — mostly from burning fossil fuels."],
    [0.45, "The kill", "Acidified lakes and leached soils: pH drops below 5 and life exits quietly."],
    [0.75, "The fix", "Scrubbers and emissions caps cut the culprit gases — policy healed the sky."],
  ],
  "Wn_eBrIDUuc": [
    [0.12, "Rules or speakers", "Descriptive grammar records what speakers do; prescriptive decides what they should — both appear in exams."],
    [0.5, "Language drift", "Yesterday's slang becomes today's standard — dictionaries race rather than decree."],
    [0.8, "Why it matters", "Standard forms aid precision; variation isn't error, it's identity."],
  ],
  "54prMaPn5Ls": [
    [0.12, "Two tenses only", "English formally owns past and present — future 'tenses' borrow helper verbs."],
    [0.5, "Aspects do the work", "Simple, progressive, perfect — aspect rides on tense like paint on structure."],
    [0.8, "JAMB takeaway", "Time-reference traps test aspect, not tense — read the timeline first."],
  ],
  "hKGwGAHznFQ": [
    [0.1, "The Norwegian floor", "Sovereign wealth: petroleum income becomes an owned-asset engine, not a spending binge."],
    [0.42, "Policy detail", "Broad-based trust and taxes that fund productivity rather than patch deficits."],
    [0.72, "Is it perfect?", "Wage inflation and a narrow export base are the honest caveats."],
  ],
  "Ot4qdCs54ZE": [
    [0.1, "The puzzle", "High taxes, striking inequality: the Dutch case argues wealth policy ≠ income policy."],
    [0.45, "Where inequality hides", "Pensions, housing wealth, family business — the gap lives outside paychecks."],
    [0.76, "Design takeaway", "Systems, not single tools, decide distribution."],
  ],
  "MsBbOaBcBfw": [
    [0.1, "Paper hero", "Ireland 2020: headline growth that accountants built — GDP had a party."],
    [0.42, "Why GDP flatters", "Multinationals book profit where they register, not where they employ."],
    [0.72, "Read GDP sideways", "Pair headline growth with per-capita income and productivity before you cheer."],
  ],
  "VUnAr0Msx9c": [
    [0.1, "The UK diagnosis", "A services giant with a productivity limp — finance wins, high street loses."],
    [0.44, "The trade question", "Trade frictions plus low investment compound quietly over years."],
    [0.76, "What to watch", "Real wages and productivity, not headlines, tell the recovery."],
  ],
};

/* top-up notes for EXISTING videos with <3 annotations: [fraction, title, body, kind?] */
const EXISTING_NOTES = [
  {
    t: "Plotting projectile displacement",
    list: [
      [0.1, "Displacement is the parabola", "Constant downward pull bends straight motion into a curve — the position plot bows accordingly."],
      [0.45, "Velocity is its slope", "The velocity-slope hits zero exactly at the top of the parabola — the same instant read twice."],
      [0.75, "Acceleration stays flat", "Gravity never blinks: the flat line pays for every bounce.", "sim"],
    ],
  },
  { t: "Kinematics In One Dimension", list: [[0.8, "Unit discipline", "m/s and m/s² are different objects — dimensional checks win the free marks."]] },
  { t: "Electric charge and electric force", list: [[0.5, "Coulomb's inverse square", "Double the distance between two charges: the force falls to a quarter. No negotiation."]] },
  { t: "Electric fields (part 1)", list: [[0.55, "Field-direction habit", "Field lines point where a POSITIVE test charge would feel force — negatives point home."]] },
  { t: "Conservation of electric charge", list: [[0.6, "Track the books", "Charge is never created nor destroyed — only transferred. Balance every event like a ledger."]] },
  { t: "Stoichiometry Basic Introduction", list: [[0.42, "Balance first, always", "Every mole arithmetic rides on the balanced equation — balance is the spine."]] },
  { t: "Stoichiometry Mole to Mole Conversions", list: [[0.45, "The ratio is the bridge", "Coefficients are the bridge: moles cross between substances; grams wait on the far bank."]] },
  { t: "Introduction to Moles", list: [[0.5, "A chemist's dozen", "One mole of anything counts 6.02×10²³ of it — Avogadro normalises batches."]] },
  { t: "Converting Between Grams and Moles", list: [[0.55, "Divide down, multiply back", "grams → moles: ÷ molar mass. moles → grams: × molar mass. One ladder, two directions."]] },
  { t: "How To Calculate Percent Yield", list: [[0.5, "Actual ÷ theoretical", "yield % = actual ÷ theoretical × 100 — spills and side reactions live in the gap."]] },
  {
    t: "Cell Organelles and Structures Review",
    list: [
      [0.3, "Plant vacuole, pressure-filled", "The plant vacuole stores water and pitches turgor — a balloon with structural opinions."],
      [0.7, "The ATP accountant", "The mitochondrion prices all cell work in ATP along its folded inner membrane."],
    ],
  },
];

const GENERIC_TOPUP = ["Every projectile is two 1-D problems in disguise — split the axes first.", "Ohm's law is a slope law: read the V-I graph, not the gadget.", "Balance before arithmetic — the balanced equation is the spine.", "Structure predicts function: each organelle's shape answers one job.", "The discriminant decides the story: two roots, one tangent, or none."];

/* ---------- run ------------------------------------------------------ */
console.log("== expanding the graph ==", GO ? "(WRITES ON)" : "(dry run)");

const simsRows = await restSelect("sims", { select: "slug,kind,topic_slug" });
const articleRows = await restSelect("articles", { select: "slug,topic_slug" });
const simByTopic = Object.fromEntries(simsRows.map((s) => [s.topic_slug, s.slug]));
const articleByTopic = Object.fromEntries(articleRows.map((a) => [a.topic_slug, a.slug]));

// 1. economics scaffold
if (GO) {
  const sub = await restSelect("subjects", { select: "slug,name", limit: 50 });
  if (!sub.some((s) => s.slug === "economics")) {
    const colors = ["#c8f55b", "#ff6320", "#8fd0f2", "#f2b98f", "#b8a1e8"];
    const r = await restInsert("subjects", [{ slug: "economics", name: "Economics", blurb: "Cases and videos first — papers arrive later.", color: colors[sub.length % colors.length] }]);
    console.log("subjects insert:", r.status, Array.isArray(r.body) ? "ok" : JSON.stringify(r.body));
  } else console.log("economics subject already exists");
  const topics = await restSelect("topics", { select: "slug", limit: 100 });
  const haveTop = new Set(topics.map((t) => t.slug));
  const ECON_TOPICS = [
    { subject_slug: "economics", slug: "macro-growth", name: "Growth & GDP", blurb: "What growth is made of, and where the numbers lie." },
    { subject_slug: "economics", slug: "countries", name: "Economies of Countries", blurb: "Real national case studies — growth by example." },
    { subject_slug: "economics", slug: "policy", name: "Policy & Trade-offs", blurb: "Tax, spending and trade — who the levers move." },
  ];
  const newTop = ECON_TOPICS.filter((t) => !haveTop.has(t.slug));
  if (newTop.length) {
    const r = await restInsert("topics", newTop);
    console.log("econ topics inserted:", r.status);
    const ECON_ARTICLES = [
      {
        slug: "what-gdp-measures", subject_slug: "economics", topic_slug: "macro-growth", read_min: 4,
        title: "What GDP actually measures (and what it hides)",
        summary: "The scoreboard everyone quotes and few read: consumption, investment, government, net exports — and the quiet leaks between them.",
        body: `GDP is one thing only: the market value of goods and services produced inside a border in a given period. Everything else you have heard about it is sentiment.

## The four taps
Consumption ($C$) is households buying groceries, data and rent. Investment ($I$) is firms buying machines and builders pouring new housing. Government ($G$) is salaries, services and roads. Net exports ($NX$, exports minus imports) is the plumbing: a country can consume more than it produces, and the difference shows up as trade in the opposite direction. The identity closes the loop: $GDP = C + I + G + NX$ — every naira spent must land in one of the four tubs.

## What it hides
GDP counts priced transactions, so it up-ranks a busy market over quiet homework. It misses leisure, nature's bookkeeping and unpaid work at home. It measures flow, not the stock of comfort: a country can post rising GDP while its paychecks stall — the way Ireland's 2020 headline outgrew its wages.

## Reading it like an adult
- Divide by population: per-capita beats headline.
- Subtract what leaves: GNI and median wages humble the ledger.
- Ask what the price level did: real beats nominal.

Exam takeaway: definitions, components and the honest caveats — that trio answers every GDP item the paper has ever set.`,
      },
      {
        slug: "why-sovereign-funds-work", subject_slug: "economics", topic_slug: "countries", read_min: 4,
        title: "Why sovereign funds work — and why they often don't",
        summary: "Norway turned oil into an owned-asset engine; others spent the rent. The difference is a rule, not luck.",
        body: `A sovereign wealth fund is a rule that converts a wasting asset into a durable one. Norway's version is simple: petroleum income goes into the fund, the fund buys a stake in the world's productive companies, and the budget may spend only the expected return — historically pegged near $3\\%$ of the pot per year.

## The two failure modes
- Spend now: petro-rents fund today's wages; tomorrow's bill arrives with an empty drawer.
- Save dumbly: money parked as influence rather than income-producing assets buys applause, not returns.

## The design levers
- Institutional trust: audits, published statements, a low-corruption face.
- Diversified holdings with real ownership claims, not loans that buy silence.
- A spending rule that separates volatile income from the daily budget.

Nigeria's excess crude account and the NSIA speak the same grammar with thinner teeth. A fund is constitutional discipline wearing a money suit — the nation that writes the rule strongest stops being a renter of its own luck.`,
      },
    ];
    const ra = await restInsert("articles", ECON_ARTICLES);
    console.log("econ articles inserted:", ra.status);
  }
} else {
  console.log("econ scaffold: would add economics subject + 3 topics + 2 articles");
}

// 2. validate + insert new videos
const existing = await restSelect("videos", { select: "id,youtube_id,topic_slug,title", order: "created_at.asc" });
const haveYids = new Set(existing.map((v) => v.youtube_id));
console.log("\nvideos in db:", existing.length);

let ok = 0, fail = 0;
for (const c of CANDIDATES) {
  if (haveYids.has(c.yid)) { console.log("skip (already in db):", c.yid); continue; }
  const oe = await oembed(c.yid);
  if (!oe) { console.log("DROP (oembed failed):", c.yid, c.topic); fail++; continue; }
  const dur = await duration(c.yid);
  if (!dur) { console.log("DROP (no duration):", c.yid, oe.title); fail++; continue; }
  const channel = oe.author_name || "YouTube";
  console.log(`ok: ${c.yid} · ${channel} · ${Math.round(dur / 60)}min · ${oe.title.slice(0, 56)} → ${c.topic}`);

  if (GO) {
    const ins = await restInsert("videos", [{ subject_slug: c.subject, topic_slug: c.topic, youtube_id: c.yid, title: oe.title, channel, blurb: c.blurb }]);
    if (!Array.isArray(ins.body) || !ins.body.length) { console.log("  insert failed:", ins.status, JSON.stringify(ins.body).slice(0, 200)); fail++; continue; }
    const vid = ins.body[0].id;
    const base = NOTES[c.yid] ?? [];
    const annRows = [];
    for (const [frac, title, body] of base) {
      const st = Math.max(5, Math.min(dur - 12, Math.floor(dur * frac)));
      const en = Math.min(dur - 2, st + 40);
      if (en <= st + 4) continue;
      annRows.push({ video_id: vid, t_start: st, t_end: en, title, body, kind: "note", sim_slug: null, article_slug: null });
    }
    if (c.subject === "physics" && simByTopic[c.topic]) {
      const st = Math.floor(dur * 0.5);
      const en = Math.min(dur - 2, st + 40);
      if (en > st + 4) annRows.push({ video_id: vid, t_start: st, t_end: en, title: "Play it beside the video", body: "Open the matching simulation and nudge the same variables the narrator changes.", kind: "sim", sim_slug: simByTopic[c.topic], article_slug: null });
    }
    if (articleByTopic[c.topic]) {
      const st = Math.floor(dur * 0.3);
      const en = Math.min(dur - 2, st + 40);
      if (en > st + 4) annRows.push({ video_id: vid, t_start: st, t_end: en, title: "Read the 1-pager on it", body: "A four-minute written version of this idea, same notation as the paper questions.", kind: "article", article_slug: articleByTopic[c.topic], sim_slug: null });
    }
    if (annRows.length) {
      const r = await restInsert("video_annotations", annRows, "return=minimal");
      console.log(`  annotations inserted: ${annRows.length} (status ${r.status})`);
    }
    ok++;
    await sleep(350);
  }
}
console.log("\nnew videos validated:", ok, "dropped:", fail);

// 3. top up existing videos with <3 annotations
if (GO) {
  const anns = await restSelect("video_annotations", { select: "video_id" });
  const count = {};
  for (const a of anns) count[a.video_id] = (count[a.video_id] ?? 0) + 1;
  for (const v of existing) {
    if ((count[v.id] ?? 0) >= 3) continue;
    const dur = await duration(v.youtube_id);
    if (!dur) { console.log("top-up skip (no duration):", v.title.slice(0, 44)); continue; }
    const match = EXISTING_NOTES.find((n) => v.title.includes(n.t));
    const items = match ? match.list : null;
    const rows = [];
    const pushRow = (frac, title, body, kind) => {
      const st = Math.max(8, Math.min(dur - 14, Math.floor(dur * frac)));
      const en = Math.min(dur - 3, st + 40);
      if (en <= st + 4) return;
      if ((count[v.id] ?? 0) + rows.length >= 3) return;
      rows.push({ video_id: v.id, t_start: st, t_end: en, title, body, kind: kind === "sim" && simByTopic[v.topic_slug] ? "sim" : "note", sim_slug: kind === "sim" ? simByTopic[v.topic_slug] ?? null : null, article_slug: null });
    };
    if (items) for (const [frac, title, body, kind] of items) pushRow(frac, title, body, kind);
    if (rows.length < 3 - (count[v.id] ?? 0)) {
      const usedTitles = new Set(rows.map((r) => r.title));
      for (let i = 0; i < GENERIC_TOPUP.length && rows.length < 3 - (count[v.id] ?? 0); i++) {
        const body = GENERIC_TOPUP[i];
        const title = body.slice(0, 34).replace(/ —.*$/, "");
        if (usedTitles.has(title)) continue;
        pushRow([0.2, 0.5, 0.8][i % 3], title, body);
      }
    }
    if (rows.length) {
      const r = await restInsert("video_annotations", rows, "return=minimal");
      console.log(`top-up: +${rows.length} → ${v.title.slice(0, 44)} (status ${r.status})`);
    }
    await sleep(350);
  }
} else {
  console.log("top-up: would bring existing videos to ≥3 annotations");
}

console.log("\ndone.");
