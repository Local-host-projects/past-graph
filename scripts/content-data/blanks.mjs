/**
 * scripts/content-data/blanks.mjs
 *
 * Annotation blanks — the token-tray question kind (kind: "blanks").
 * The stem carries slots marked ___1___, ___2___, …; `opts` is the word bank
 * (labels are assigned A, B, C… by expand-content.mjs in token order) and
 * `ans` is the comma-joined LABELS in slot order ("B,A,D,C").
 *
 * Tokens are single-use in the UI; distractor tokens beyond the slot count
 * are deliberate — the arrangement is the work. Renderer: BlankView.tsx,
 * grading: kind-aware in /api/attempt.
 */
export const blanksQs = [
  {
    subject: "biology", topic: "genetics", d: 2,
    stem: "In the cross Bb × Bb, the probability that an offspring shows the recessive phenotype is ___1___, while the probability that it carries at least one dominant allele B is ___2___.",
    opts: ["3/4", "1/4", "9/16", "1/2"],
    ans: "B,A",
    expl: "Bb × Bb gives 1 BB : 2 Bb : 1 bb. The recessive phenotype (bb) is 1/4; carrying at least one B (BB or Bb) is 3/4 — the two probabilities are complements, which is the trap the distractors play on.",
  },
  {
    subject: "biology", topic: "cellular-processes", d: 2,
    stem: "In aerobic respiration, glycolysis occurs in the ___1___, the Krebs cycle runs in the ___2___, and the final electron acceptor of the transport chain is ___3___.",
    opts: ["oxygen", "cytoplasm", "mitochondrial matrix", "lactic acid"],
    ans: "B,C,A",
    expl: "Glycolysis is cytoplasmic, the Krebs cycle runs in the mitochondrial matrix, and oxygen accepts the electrons at the chain's end (forming water). Lactic acid belongs to anaerobic pathways — a distractor.",
  },
  {
    subject: "biology", topic: "ecology", d: 1,
    stem: "In the food chain grass → grasshopper → lizard → hawk, the grasshopper occupies the ___1___ trophic level and feeds as a ___2___ consumer.",
    opts: ["primary", "first", "second", "tertiary"],
    ans: "C,A",
    expl: "Grass (producer) is level one; the grasshopper eats it, so it sits at the second trophic level and is a primary consumer. Level labels and consumer labels offset by one — that offset is the whole question.",
  },
  {
    subject: "chemistry", topic: "redox-electrochem", d: 2,
    stem: "During the electrolysis of molten sodium chloride, the Na⁺ ions are discharged at the ___1___, where ___2___ takes place.",
    opts: ["oxidation", "cathode", "anode", "reduction"],
    ans: "B,D",
    expl: "Positive Na⁺ ions migrate to the negative cathode and gain electrons — gain is reduction. Oxidation happens at the anode to Cl⁻. Anode/cathode and oxidation/reduction pair together; mixing the pairs is the classic error.",
  },
  {
    subject: "chemistry", topic: "acids-bases", d: 2,
    stem: "A solution of pH 3 has a hydrogen ion concentration ___1___ times that of a solution of pH 5, while an alkali dissolved in water releases ___2___ ions.",
    opts: ["hydroxide", "10", "hydronium", "100"],
    ans: "D,A",
    expl: "pH is logarithmic: two units apart means 10² = 100× difference in [H⁺]. Alkalis release OH⁻ (hydroxide) ions in water. The single-step '10' distractor catches students who forget the exponent applies to the difference.",
  },
  {
    subject: "physics", topic: "electricity", d: 1,
    stem: "A current of 2 A flows through a 5 Ω resistor: the potential difference across it is ___1___ V, and the power it dissipates is ___2___ W.",
    opts: ["20", "10", "2.5", "40"],
    ans: "B,A",
    expl: "V = IR = 2 × 5 = 10 V, and P = I²R = 4 × 5 = 20 W. The distractors come from misplacing I or I² — compute both from the same pair of numbers and the arrangement locks in.",
  },
  {
    subject: "physics", topic: "light-optics", d: 1,
    stem: "A ray travelling from air (n = 1.0) into glass (n = 1.5) obeys ___1___' law at the boundary, and it bends ___2___ the normal because glass is optically denser.",
    opts: ["towards", "Snell", "away", "Ohm"],
    ans: "B,A",
    expl: "Refraction at a boundary is Snell's law (n₁ sin θ₁ = n₂ sin θ₂). Entering a denser medium slows the light, so the ray bends towards the normal. The possessive in the stem fixes the slot order.",
  },
  {
    subject: "physics", topic: "waves-sound", d: 2,
    stem: "A wave of frequency 50 Hz travels through air at 340 m/s: its wavelength is ___1___ m and its period is ___2___ s.",
    opts: ["0.02", "6.8", "340", "0.05"],
    ans: "B,A",
    expl: "λ = v/f = 340/50 = 6.8 m, and T = 1/f = 1/50 = 0.02 s. The distractor 0.05 is the frequency inverted wrongly (f/1 instead of 1/f) — period and frequency are reciprocals, never equals.",
  },
  {
    subject: "mathematics", topic: "progressions", d: 2,
    stem: "For the arithmetic progression 3, 7, 11, …, the 10th term is ___1___ and the sum of the first 10 terms is ___2___.",
    opts: ["195", "39", "210", "43"],
    ans: "B,C",
    expl: "a = 3, d = 4. T₁₀ = a + 9d = 3 + 36 = 39. S₁₀ = 10/2 × (2a + 9d) = 5 × 42 = 210. The common wrong answer 43 comes from using (n + 1)d; 195 is S₁₅'s shape — both check the formula, not luck.",
  },
  {
    subject: "mathematics", topic: "calculus", d: 2,
    stem: "If y = x³ − 3x, then dy/dx evaluated at x = 2 is ___1___, and the second derivative there is ___2___.",
    opts: ["6", "9", "3", "12"],
    ans: "B,D",
    expl: "dy/dx = 3x² − 3, which at x = 2 gives 9. The second derivative is d²y/dx² = 6x, giving 12 at x = 2. The distractors are the undifferentiated coefficient (3) and the first derivative's coefficient (6).",
  },
  {
    subject: "economics", topic: "policy", d: 2,
    stem: "When the market price rises above equilibrium, quantity supplied exceeds quantity demanded, creating ___1___, and that excess tends to push the price ___2___.",
    opts: ["excess demand", "fall", "excess supply", "rise"],
    ans: "C,B",
    expl: "Above equilibrium, sellers offer more than buyers take — an excess supply (surplus). Unsold stock pressures sellers to cut prices, so price falls back toward equilibrium. The pairs flip exactly at the equilibrium price.",
  },
  {
    subject: "economics", topic: "macro-growth", d: 2,
    stem: "GDP counts output produced ___1___ a country's borders; adding net factor income from abroad converts it to ___2___, while subtracting depreciation gives ___3___.",
    opts: ["GNP", "within", "NNP", "outside"],
    ans: "B,A,C",
    expl: "GDP is geographic — produced within the borders. GDP + net factor income from abroad = GNP; GNP − depreciation = NNP (net national product). The chain is one subtraction and one addition away from GDP.",
  },
  {
    subject: "english", topic: "lexis-structure", d: 1,
    stem: "The students refused to ___1___ the dishonest act, and the principal commended them for their ___2___.",
    opts: ["condone", "integrity", "concur", "laxity"],
    ans: "A,B",
    expl: "Condone takes a direct object — to condone the act is to overlook or excuse it; the refusal is principled. Concur needs 'with' and means agree, not excuse. Integrity is the quality the principal commends.",
  },
  {
    subject: "english", topic: "antonyms-synonyms", d: 1,
    stem: "The chairman's address was ___1___, yet the hall listened with ___2___ because every sentence carried weight.",
    opts: ["applause", "verbose", "terse", "attention"],
    ans: "B,D",
    expl: "Verbose — wordy — contrasts with the 'yet' clause: despite the length, the weight of each sentence held the hall's attention. Terse would contradict 'every sentence carried weight' being surprising.",
  },
];
