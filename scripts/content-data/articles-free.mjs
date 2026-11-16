/**
 * The 10 free-shelf articles + the 3 new sims rows.
 * Free pieces include companions for each new sim so the graph links hold.
 */
export const freeArticles = [
  {
    slug: "snells-law-in-one-page", subject: "physics", topic: "light-optics",
    title: "Snell's Law in One Page", summary: "Why light bends entering glass, how the critical angle appears, and when total internal reflection takes over — the refraction toolkit on one page.",
    read_min: 5,
    body: `Light changes speed between media. That speed change is the whole story of refraction.\n\n## The law\nn₁ sin θ₁ = n₂ sin θ₂, where n = c/v is the refractive index (how many times slower light travels in the medium than in vacuum).\n\n- Denser medium (higher n) → ray bends TOWARD the normal\n- Ray along the normal (θ₁ = 0) → no bending at all\n\n## The critical angle\nTravelling from dense to light (glass to air), the refracted ray skims along the boundary at some incident angle — the critical angle θc.\n\nsin θc = n₂/n₁ (for glass-to-air with n = 1.5: θc ≈ 41.8°)\n\nBeyond θc, no ray escapes at all: total internal reflection, a perfect mirror. That is the physics inside optical fibres, prism binoculars, and the sparkle of a cut diamond (n = 2.42, θc ≈ 24°).\n\n## Exam moves\n1. Always convert the ray's given angle to the angle WITH THE NORMAL first\n2. Going dense → light: check TIR before applying Snell's law\n3. Apparent depth: real depth / n — the coin-in-the-bucket classic\n\n## Try it live\nOpen the Snell's Law sim: drag the incident angle past the critical angle and watch the refracted ray refuse to leave the glass.`,
  },
  {
    slug: "punnett-square-worked", subject: "biology", topic: "genetics",
    title: "The Punnett Square, Worked", summary: "A two-minute route from parents' genotypes to offspring probabilities — the grid method that answers every Mendelian ratio question.",
    read_min: 5,
    body: `The punnett square is bookkeeping for alleles: one parent's gametes down the side, the other's across the top, every box a possible child.\n\n## The method\n1. Write each parent's genotype and split it into gametes (a Tt parent gives T and t)\n2. Fill the grid — each box joins one gamete from each side\n3. Count phenotypes and genotypes as ratios or percentages\n\n## The two classics\n- Tt × Tt → TT, Tt, Tt, tt: phenotype 3 tall : 1 short; genotype 1:2:1\n- Tt × tt → Tt, Tt, tt, tt: 1:1 — the test-cross ratio\n\n## Speed rules\n- Any child with at least one capital letter shows the dominant trait\n- Heterozygote × heterozygote always gives 3:1; carrier × carrier for a recessive disorder gives 25% affected\n- Two genes at once (dihybrid TtYy × TtYy) gives 9:3:3:1 — build a 4×4 grid the same way\n\n## Common slips\n- Splitting gametes wrong: Tt gives T AND t — never two identical gametes\n- Reading genotype ratio as phenotype ratio: Tt and TT look identical but the 1:2:1 underneath is not the 3:1 on top\n\n## Try it live\nThe Punnett Square sim redraws the grid as you dial each parent's genotype — watch the trait percentage move from 0% (aa × aa) to 100% (AA × any).`,
  },
  {
    slug: "market-equilibrium-basics", subject: "economics", topic: "policy",
    title: "Market Equilibrium: The Basics", summary: "Demand, supply, and the price that reconciles them — plus the shift-versus-slide distinction that decides half of all market questions.",
    read_min: 5,
    body: `Every market has two schedules. Demand slopes down (cheaper → buyers take more); supply slopes up (dearer → sellers offer more). Where they cross: equilibrium price and quantity.\n\n## Movement vs shift — the one distinction\n- The PRICE changes → movement ALONG a curve (slide)\n- Income, tastes, input costs, technology, other prices change → the whole curve SHIFTS\n\n- Demand shifts right → price and quantity both rise\n- Supply shifts left (cost rise) → price rises, quantity falls\n- Both at once → follow the curves; price and quantity may move oppositely\n\n## Reading disturbances\n- Harvest failure: supply left → dearer, less sold\n- Fashion boom: demand right → dearer, more sold\n- Subsidy or better technology: supply right → cheaper, more sold\n\n## Why equilibrium is stable\nAbove it, unsold stock pushes sellers to cut; below it, queues push buyers to bid up. The price gravitates back unless the law pins it — ceilings and floors are where shortages and surpluses begin.\n\n## Try it live\nThe Market Equilibrium sim: slide demand, supply, and a per-unit tax. Watch the intersection move, the surplus triangles resize, and the equilibrium readout track every slider.`,
  },
  {
    slug: "electrolysis-by-the-numbers", subject: "chemistry", topic: "redox-electrochem",
    title: "Electrolysis by the Numbers", summary: "Faraday's first law as a three-line calculation — charge, moles of electrons, moles of product — applied to the standard exam problems.",
    read_min: 6,
    body: `Electrolysis is a charge-for-electrons transaction: the amount of product depends on the charge passed.\n\n## The three lines\n1. Charge: Q = It (current in amperes × seconds — convert minutes!)\n2. Moles of electrons: n(e⁻) = Q/F, with F = 96,500 C per mole\n3. Moles of product: divide by the ion's charge — Ag⁺ needs 1 e⁻, Cu²⁺ needs 2, Al³⁺ needs 3\n\n## Worked\n- 0.5 A for 965 s: Q = 482.5 C → 0.005 mol e⁻ → 0.005 mol Ag (1 e⁻) = 0.54 g\n- Same charge deposits only 0.005/2 = 0.0025 mol Cu = 0.16 g\n- Same charge again for Al³⁺: 0.00167 mol × 27 = 0.045 g\n\nSame charge, three products, three masses — the ion charge is the lever.\n\n## Electrode rules\n- Cathode (−): reduction — cations gain electrons; in solution, H⁺/Na⁺ compete (reactivity decides)\n- Anode (+): oxidation — anions lose electrons; halides give halogens, sulphates/nitrates give O₂ instead\n- Active electrodes complicate: copper anodes dissolve themselves\n\n## Exam checks\n- Always convert time to seconds before multiplying\n- Mass = moles × molar mass — quote the RAM you used\n- Gas volumes at s.t.p.: moles × 22.4 dm³`,
  },
  {
    slug: "rates-equilibrium-shifts", subject: "chemistry", topic: "rates-equilibrium",
    title: "Rates and Equilibrium Shifts", summary: "Collision theory explains the rate; Le Chatelier predicts the shift. Two rules, one page — and the pressure trap that catches everyone.",
    read_min: 5,
    body: `Two different questions live in this topic: how FAST (kinetics) and WHICH WAY (equilibrium).\n\n## Speeding a reaction (collision theory)\n- More concentration/pressure → more collisions per second\n- Higher temperature → faster particles AND more exceeding activation energy (the dominant effect)\n- Catalyst → lower-energy pathway, no change to the position of equilibrium\n- Surface area (powder vs lump) → more exposed collision sites\n\n## Le Chatelier: the shift rule\nDisturb an equilibrium and it moves to CANCEL the disturbance.\n\nFor N₂ + 3H₂ ⇌ 2NH₃, ΔH negative:\n- Squeeze (higher pressure) → shifts to the side with FEWER gas moles → right, more ammonia\n- Heat → shifts endothermic direction → left, less ammonia (why the Haber process runs moderately hot with a catalyst instead)\n- Add more N₂ → shifts right to consume it\n\n## The pressure trap\nPressure only matters when the gas MOLECULE COUNT differs across the equation. For H₂ + I₂ ⇌ 2HI: 2 moles gas on each side — pressure changes shift NOTHING. Exams plant this trap every year.\n\n## Reading Kc\n- Kc = [products]^coefficients / [reactants]^coefficients\n- Kc changes ONLY with temperature\n- Adding catalyst, changing pressure or concentration: position moves, Kc stays\n\nAnswer rate questions with collisions; answer direction questions with Le Chatelier — never swap the tools.`,
  },
  {
    slug: "surds-clean-up", subject: "mathematics", topic: "number-surds",
    title: "Surds, Cleaned Up", summary: "Collecting, rationalising and comparing surds — the three moves that turn messy radicals into exam answers.",
    read_min: 5,
    body: `A surd is an irrational root left symbolic — √2, 3√5 — kept exact rather than punched into decimals.\n\n## The three moves\n1. Collect: √50 + √18 = 5√2 + 3√2 = 8√2. Factor out perfect squares first: √50 = √(25×2).\n2. Multiply/divide: √a × √b = √(ab). (√3 + √2)² = 5 + 2√6 — expand like brackets, don't square each term alone.\n3. Rationalise: multiply top and bottom by the conjugate.\n\n- 1/(1+√2) × (1−√2)/(1−√2) = (1−√2)/(1−2) = √2 − 1\n- 1/(2+√3) = 2−√3 (denominator becomes 4−3 = 1 — a gift)\n\n## Exam patterns\n- "Simplify 6/√3": × √3/√3 → 2√3\n- Comparing sizes: put both on a common root — √5 vs 2√3 = √12, so 2√3 is larger\n- Nested: √(x²y⁴) = xy²√… check powers before panicking\n\n## Traps\n- √(a+b) is NOT √a + √b — the distribution myth dies here\n- 2√3 means 2 × √3, not √6\n- Rationalising with the WRONG sign: use a − b√n against a + b√n, the conjugate, not a copy\n\nEvery surd question is one of the three moves in disguise. Name the move, execute, move on.`,
  },
  {
    slug: "arithmetic-geometric-in-practice", subject: "mathematics", topic: "progressions",
    title: "AP and GP in Practice", summary: "Arithmetic and geometric progressions: the four formulas, how to tell which sequence you're in, and the sum-to-infinity condition.",
    read_min: 6,
    body: `Two growth patterns cover nearly every sequence question: add a constant (AP) or multiply by a constant (GP).\n\n## Identify first\n- Differences constant → AP: Tₙ = a + (n−1)d\n- Ratios constant → GP: Tₙ = arⁿ⁻¹\n- "Terms of AP/GP": test both — subtract consecutive terms, then divide them\n\n## The four formulas\n- AP nth term: a + (n−1)d\n- AP sum: Sₙ = n/2 [2a + (n−1)d] = n/2 (first + last)\n- GP nth term: arⁿ⁻¹\n- GP sum: Sₙ = a(rⁿ − 1)/(r − 1), r ≠ 1\n\n## Sum to infinity (GP only)\nWhen |r| < 1: S∞ = a/(1 − r).\n\n- 8 + 4 + 2 + … → r = ½ → S∞ = 16\n- The condition |r| < 1 is the answer to "for what values of x does the sum exist"\n\n## Exam workhorses\n- Three consecutive AP terms: call them (a−d), a, (a+d) — sums become trivial\n- Three consecutive GP terms: a/r, a, ar — products become trivial\n- "The sum of the first n terms is Sₙ = 3n² + n" → Tₙ = Sₙ − Sₙ₋₁ = 6n − 2: an AP hiding in a formula\n\n## Traps\n- GP formula sign: r < 1 makes (rⁿ − 1)/(r − 1) positive — algebra saves you\n- Counting terms: 5 to 40 step 3 → n = (40−5)/3 + 1 = 12, not 11\n- Sum vs product phrasing in three-term problems — re-read before solving`,
  },
  {
    slug: "sound-speed-and-the-wave-equation", subject: "physics", topic: "waves-sound",
    title: "Sound, Speed and the Wave Equation", summary: "v = fλ answers half the sound questions; the properties of the medium answer the other half. Pitch, loudness and echo in one pass.",
    read_min: 5,
    body: `Sound is a longitudinal wave — compressions travelling through a medium. One equation ties it together.\n\n## v = fλ\n- f is the source's frequency (pitch), λ is the crest spacing, v is set by the MEDIUM\n- Air at room temperature: ~330–350 m/s. Water: ~1500. Steel: ~5000 — tighter bonding transmits faster\n- Speed rises with temperature in air (~0.6 m/s per °C)\n\n## What the source does vs what the medium does\n- The source sets frequency; the medium sets speed; the wavelength adjusts: λ = v/f\n- Crossing into a new medium: frequency unchanged, speed and wavelength change\n\n## The three sound properties\n- Pitch ↔ frequency\n- Loudness ↔ amplitude (intensity falls as 1/r² from a point source)\n- Quality/timbre ↔ waveform (why flute and voice differ on the same note)\n\n## Echo arithmetic\nThe pulse travels THERE AND BACK.\n- Speed = 2d/t: wall 165 m away, echo in 1 s → v = 330 m/s\n- To hear a distinct echo, the obstacle must sit beyond ~17 m (0.1 s persistence of hearing)\n\n## Exam checks\n- Ultrasonics: above 20 kHz; infrasound: below 20 Hz — human range 20 Hz to 20 kHz\n- Echo questions: ALWAYS double the distance before dividing\n- "Why can't sound travel in vacuum?" — no medium, no compressions, no wave`,
  },
  {
    slug: "oral-english-minimal-pairs", subject: "english", topic: "oral-forms",
    title: "Oral English: Minimal Pairs", summary: "The vowel and consonant contrasts JAMB's oral paper keeps testing — how to hear the difference and pick reliably under exam conditions.",
    read_min: 6,
    body: `Oral English questions compare two or three words that differ by ONE sound. You don't need an accent — you need the contrasts.\n\n## The vowel pairs that recur\n- /iː/ vs /ɪ/ — seat vs sit, heat vs hit: long-tense vs short-lax\n- /uː/ vs /ʊ/ — food vs foot, fool vs full\n- /e/ vs /æ/ — pet vs pat, beg vs bag: the second opens the jaw wider\n- /ɑː/ vs /ʌ/ — cart vs cut, calm vs come\n- /ɜː/ vs /ɔː/ — bird vs board, work vs walk\n\n## The consonant traps\n- Voiced vs voiceless pairs: /s/ vs /z/ (rice vs rise), /θ/ vs /ð/ (thought vs though)\n- Final consonants: "picks" ends voiceless /s/, "pigs" ends voiced /z/ — spelling lies, sound tells\n\n## The four oral question types\n1. Same sound: does "ball" begin with the same sound as "bore"? (both /b/)\n2. Rhyme: "though" rhymes with "go" — not with "cough" or "tough"\n3. Stress: which syllable carries it — REcord (noun) vs reCORD (verb)\n4. Emphatic stress: "The BOY wrote the letter" (not the girl) vs "The boy WROTE the letter" (didn't just read it)\n\n## Exam instincts\n- Test minimal pairs by saying them aloud in your head — lengthen and exaggerate\n- Rhyme depends on sound, never spelling: "done" rhymes with "gun", not "bone"\n- Noun–verb pairs almost always shift stress to the FIRST syllable as nouns`,
  },
  {
    slug: "ecological-pyramids", subject: "biology", topic: "ecology",
    title: "Ecological Pyramids", summary: "Why energy, numbers and biomass shrink up the food chain — and why the pyramid of energy can never invert.",
    read_min: 5,
    body: `Feed a habitat through a food chain and each link loses most of what it receives. Pyramids make that loss visible.\n\n## The 10% law\nRoughly a tenth of the energy at one trophic level reaches the next: the rest is lost to respiration, heat, and the parts never eaten.\n\n- 100,000 J in grass → 10,000 J in grasshopper → 1,000 J in lizard → 100 J in hawk\n- This is why food chains rarely exceed 4–5 links: the energy runs out\n\n## Three pyramids\n- Energy: always upright, ALWAYS — it can never invert because energy flows one way and degrades\n- Numbers: usually upright, but inverts for parasites (many fleas on one dog) or a single big tree\n- Biomass: usually upright, inverts briefly in open water when a standing crop of fast-turnover algae supports a heavier consumer load\n\n## Exam checks\n- Producers (autotrophs) anchor the base — everything above them depends on captured sunlight\n- Decomposers sit outside the classic pyramid but close every nutrient loop\n- Shorter chains waste less: eating plants directly ("food short chains") feeds more people — the grain-vs-meat argument\n\n## The one-line answer\n"When asked why pyramids narrow": energy is lost at each transfer as heat through respiration — only ~10% passes on.`,
  },
];

/** The three new sims rows (slug, topic, kind, title, blurb). */
export const newSims = [
  {
    slug: "punnett-square", topic: "genetics", kind: "punnett",
    title: "Punnett Square",
    blurb: "Dial each parent's genotype and watch the four boxes redraw — dominance, carriers, and the trait's odds in one glance.",
  },
  {
    slug: "market-equilibrium", topic: "policy", kind: "demand",
    title: "Market Equilibrium",
    blurb: "Shift demand, supply, and a per-unit tax; watch price, quantity and the surplus triangles redraw live.",
  },
  {
    slug: "snells-law", topic: "light-optics", kind: "snell",
    title: "Refraction & Snell's Law",
    blurb: "Change the angle and the two refractive indices; find the bending, the critical angle, and total internal reflection.",
  },
];
