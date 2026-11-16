/**
 * Premium curation — which shelf each piece sits on.
 *
 * The DB has no is_free column on videos/articles/sims (and can't get one
 * without a migration), so the grouping lives here: a stable allowlist keyed
 * by youtube_id / slug. Questions carry is_free in the DB already.
 *
 * The split follows the packaging: the free shelf is the onramp (core
 * explainers, the recent-years papers, the starter sims); premium is the
 * deep archive — long-form deep-dives, the harder second-order pieces, the
 * advanced sims.
 */

export const PREMIUM_VIDEO_IDS = new Set<string>([
  /* 3Blue1Brown — Essence of calculus, chapters 2–5 (the deep arc) */
  "9vKqVkMQHKk",
  "S0_qX4VJhMQ",
  "rfG8ce4nNh0",
  "YG15m2VwSjA",
  /* physics deep-dives */
  "bHIhgxav9LY", // Veritasium — the electricity misconception
  "oI_X2cMHNe0", // Veritasium — how electricity actually works
  "2Vrhk5OjBP8", // AlphaPhoenix — 1000 m of wire
  "Q10_srZ-pbs", // Veritasium — closest to a theory of everything
  "C-FEVzI8oe8", // Efficient Engineer — shear force & bending moments
  "gMAKamGIiMc", // Steve Mould — levitating liquid pendulum
  /* biology deep-dives */
  "hOfRN0KihOU", // Kurzgesagt — how evolution works
  "Qqe4thU-os8", // Amoeba Sisters — DNA replication
  "oefAI2x2CQM", // Amoeba Sisters — protein synthesis
  /* chemistry deep-dives */
  "w1njGAkc8og", // percent yield
  "kqe9tEcZkno", // Royal Institution — periodic table experiments
  /* english masterclass */
  "n-11FijFAmM", // all 12 tenses in 2.5 hours
  /* economics country studies */
  "Ot4qdCs54ZE",
  "MsBbOaBcBfw",
  "VUnAr0Msx9c",
]);

export const PREMIUM_ARTICLE_SLUGS = new Set<string>([
  "why-derivatives-are-local",
  "chain-rule-visually",
  "fundamental-theorem-explained",
  "half-life-and-decay-constant",
  "solubility-and-common-ion",
  "genetics-beyond-mendel",
  "protein-synthesis-exam-view",
  "electric-fields-and-potential",
  "elasticity-and-bending",
  "market-intervention",
  "inflation-and-policy",
  "tense-system-deep-map",
]);

export const PREMIUM_SIM_SLUGS = new Set<string>(["snells-law"]);

export function isPremiumVideo(youtubeId: string | undefined | null): boolean {
  return Boolean(youtubeId && PREMIUM_VIDEO_IDS.has(youtubeId));
}
export function isPremiumArticle(slug: string): boolean {
  return PREMIUM_ARTICLE_SLUGS.has(slug);
}
export function isPremiumSim(slug: string): boolean {
  return PREMIUM_SIM_SLUGS.has(slug);
}
