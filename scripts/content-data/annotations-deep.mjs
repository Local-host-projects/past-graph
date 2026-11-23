/**
 * Transcript-timed annotations for the long videos.
 *
 * Every timestamp below was read off the fetched captions
 * (scripts/transcripts/<yid>.txt), so the note lands where the presenter
 * actually says it — not at a fraction of the duration. Videos here replace
 * their old three-note placeholder set entirely.
 *
 * Shape: { t: startSeconds, end?: seconds, title, body, kind?: "note"|"sim"|"article", sim?, article? }
 * Defaults: kind "note", window 45 s.
 */
export const DEEP = {
  /* ---------------------------------------------------------------- calculus */
  WUvTyaaNkzM: [
    {
      t: 14, end: 72, title: "The promise of the series",
      body: "Grant's goal is not the rules but where they come from: you should finish feeling you could have invented calculus yourself. Watch for the moment a hard question becomes a picture.",
    },
    {
      t: 136, end: 178, title: "Respect the symmetry",
      body: "Slicing the circle into concentric rings works because it follows the shape's own symmetry. When a method feels natural, ask which symmetry it is exploiting — that instinct is reusable.",
    },
    {
      t: 180, end: 222, title: "A ring is a rectangle",
      body: "Unroll one ring and it is roughly a rectangle: length 2πr, thickness dr. The approximation is not a cheat — it gets better as dr shrinks, which is the entire point.",
    },
    {
      t: 351, end: 400, title: "The sum becomes an area",
      body: "Stack those rectangles under the line y = 2πr and the sum is just a triangle: ½ · 3 · 6π = 9π = πr². Summing small pieces turned a hard area into a shape you already know.",
    },
    {
      t: 438, end: 492, title: "dr does two jobs",
      body: "dr is both the height factor in each term 2πr·dr and the spacing between the r values. That double duty is why the sum can be redrawn as rectangles under a curve — the most transferable idea in the video.",
    },
    {
      t: 524, end: 566, title: "The same trick elsewhere",
      body: "Velocity × dt summed over time is distance, exactly as 2πr × dr summed over radius is area. Whenever a problem is 'many small pieces', look for the graph hiding underneath.",
    },
    {
      t: 612, end: 660, title: "A(x), the mystery function",
      body: "Fix the left endpoint and let the right one move: the area becomes a function A(x). Integral questions are area questions, and most 'find the area' paper items are this in disguise.",
    },
    {
      t: 698, end: 750, title: "The sliver gives the slope",
      body: "Nudge x by dx and the extra area is a strip of height x² and width dx, so dA/dx ≈ x². You have just found the derivative without ever knowing A — that is the reverse-engineering move.",
    },
    {
      t: 868, end: 906, title: "Derivative as sensitivity",
      body: "dA/dx measures how strongly the area answers a nudge to x. Technically it is the value that ratio approaches as dx → 0 — a limit, not a fraction of real numbers.",
    },
    {
      t: 912, end: 958, title: "The fundamental theorem",
      body: "The derivative of the area function gives back the curve that defined it. That two-way street is the fundamental theorem of calculus, and it is why integration can be done by anti-differentiation.",
    },
    {
      t: 962, end: 1004, kind: "article", article: "fundamental-theorem-explained",
      title: "The theorem written down",
      body: "Same two-way street, with the notation and the worked steps the paper expects. Short read if the video's pictures need a written anchor.",
    },
  ],

  "9vKqVkMQHKk": [
    {
      t: 15, end: 58, title: "\"Instantaneous rate of change\" is an oxymoron",
      body: "Change happens between two points in time; a single instant leaves no room for it. The derivative exists precisely to make that phrase mean something rigorous.",
    },
    {
      t: 96, end: 138, title: "One car, two graphs",
      body: "Distance s(t) climbs 0 → 100 m in 10 s; velocity is the bump that rises and falls inside it. The two curves are linked, and the video's job is the exact link.",
    },
    {
      t: 181, end: 224, title: "A snapshot has no speed",
      body: "Show a photo of a car and nobody can tell you its speed. Computing velocity needs two times — yet the velocity function takes one. Hold on to that discomfort; it is the real content.",
    },
    {
      t: 265, end: 306, title: "How a speedometer cheats",
      body: "It measures the distance covered between 3.00 s and 3.01 s, then divides. The paradox is side-stepped physically with a very small interval, and that is the seed of the definition.",
    },
    {
      t: 383, end: 426, title: "ds/dt is a slope between two points",
      body: "A small step right (dt) and the resulting rise (ds) give rise-over-run on s(t). Nothing special about t = 3 — repeat at every t and you have a velocity function.",
    },
    {
      t: 469, end: 510, title: "Pure math: take the limit",
      body: "The derivative is not ds/dt for one chosen dt; it is what that ratio approaches as dt → 0. Visually the secant through two points settles onto the tangent at one point.",
    },
    {
      t: 512, end: 566, title: "Not infinitely small, and not dt = 0",
      body: "dt stays finitely small and non-zero; it only approaches zero. Calling the result 'the best constant approximation for the rate of change around a point' is the honest reading.",
    },
    {
      t: 570, end: 610, kind: "article", article: "why-derivatives-are-local",
      title: "Why the derivative is local",
      body: "The written version of that 'best constant approximation' idea, plus where the tangent-slope shortcut is safe to use in exam working.",
    },
    {
      t: 638, end: 690, title: "The algebra collapses",
      body: "For s = t³ at t = 2, expand (2 + dt)³: the 8s cancel, every surviving term carries dt, and the bottom dt kills them. What remains is 3·2² = 12 — the tangent slope.",
    },
    {
      t: 783, end: 824, title: "The pattern is 3t²",
      body: "Nothing special about t = 2: the derivative of t³ is 3t². The messy ratio became a clean formula only because we asked what it approaches, not what it equals.",
    },
    {
      t: 885, end: 940, title: "Is the car moving at t = 0?",
      body: "v(0) = 0 yet the car plainly departs. Over 0 → 0.1 s it moves 0.001 m, an average of 0.01 m/s — small, and shrinking toward 0. The derivative is an approximation, not a statement of stillness.",
    },
  ],

  rfG8ce4nNh0: [
    {
      t: 52, end: 96, title: "Blind, with only a speedometer",
      body: "You cannot see out of the window; you can only read v(t) = t(8 − t). The task is to reconstruct distance travelled — the exact dual of chapter 2's problem.",
    },
    {
      t: 135, end: 176, title: "The question in reverse",
      body: "If differentiating distance gives velocity, then distance must be a function whose derivative is v(t). That is all an antiderivative is — no new machinery yet.",
    },
    {
      t: 180, end: 222, title: "Constant speed is just geometry",
      body: "At constant velocity, distance = v × t, and on a v–t plot that product is a rectangle. The units do the persuading: (m/s) × s = m, so area really is distance.",
    },
    {
      t: 264, end: 306, title: "Pretend the speed is constant",
      body: "Chop 0–8 s into 0.25 s slices and hold velocity fixed at the left-edge value: 7 m/s × 0.25 s = 1.75 m, one thin rectangle. Under-counting slightly is fine — refinement fixes it.",
    },
    {
      t: 389, end: 440, title: "Σ becomes ∫",
      body: "The sum of v(t)·dt looks like a Riemann sum, but dt is both a factor and the spacing. So the symbol means the limit as dt → 0, and that limit is the area under the curve.",
    },
    {
      t: 599, end: 640, title: "Area as a function of the upper bound",
      body: "Let the right edge be a variable T. The area from 0 to T is the distance travelled by time T — a function s(T) built out of an integral.",
    },
    {
      t: 639, end: 684, title: "The sliver proves the theorem",
      body: "Nudge T by dT and the area grows by a sliver of height v(T) and width dT, so ds/dT = v(T). This works for any area-under-a-graph function, not just velocity.",
    },
    {
      t: 685, end: 740, title: "Work it out",
      body: "Expand v = 8t − t². Since d(4t²)/dt = 8t and d(−t³/3)/dt = −t², the antiderivative is 4t² − t³/3 + C. Derivatives of constants vanish, so C is free.",
    },
    {
      t: 811, end: 852, title: "The constant is pinned by the lower bound",
      body: "Distance from 0 to 0 must be 0, so subtract F(lower). Here F(0) = 0, so nothing is subtracted — but for a general interval you always do F(b) − F(a).",
    },
    {
      t: 853, end: 896, title: "Eight seconds, 85.33 m",
      body: "F(8) − F(0) = 256 − 170.67 ≈ 85.33 m. For 1 → 7 s you subtract F(1) instead; any constant C cancels in the subtraction.",
    },
    {
      t: 898, end: 940, title: "The fundamental theorem of calculus",
      body: "∫ₐᵇ f(x)dx = F(b) − F(a) where F′ = f. A continuum of inputs collapses to two evaluations — that is the whole theorem.",
    },
    {
      t: 1063, end: 1108, title: "Below the axis counts negative",
      body: "When v is negative the car reverses, so those rectangles subtract. Integrals measure signed area, not raw area — an exam favourite when the curve crosses the axis.",
    },
  ],

  dHjWVlfNraM: [
    {
      t: 1, end: 40, title: "Kinematics without forces",
      body: "This is the description of motion alone — no forces, no causes. Mostly along x, with the same tools reused along y when projectiles appear.",
    },
    {
      t: 42, end: 84, title: "Scalar vs vector",
      body: "Mass is 2 kg, never '2 kg east' — direction is meaningless for it. Whether a quantity can take a direction is the whole test.",
    },
    {
      t: 84, end: 124, title: "Distance vs displacement",
      body: "15 m is distance; 15 m east is displacement. Formally displacement is Δx = x_final − x_initial, so it carries a sign and distance never does.",
    },
    {
      t: 126, end: 168, title: "Speed vs velocity",
      body: "20 m/s is speed, 30 m/s north is velocity. Every 'average velocity' question is really asking for displacement ÷ time, direction included.",
    },
    {
      t: 288, end: 340, title: "Worked: 13 m east, then 4 m west",
      body: "Distance adds magnitudes: 13 + 4 = 17 m. Displacement adds signs: +13 − 4 = +9 m, i.e. 9 m east of the start. One trip, two different answers, both correct.",
    },
    {
      t: 320, end: 360, kind: "article", article: "projectile-two-stories",
      title: "Why the axes split later",
      body: "The x-axis habits here become the horizontal story of a projectile; the vertical story just adds gravity. Short read before the 2-D video.",
    },
    {
      t: 507, end: 560, title: "Same trip, two averages",
      body: "100 m east then 150 m west in 5 s: average speed = 250/5 = 50 m/s, average velocity = −50/5 = −10 m/s. They differ precisely because direction changed.",
    },
    {
      t: 953, end: 996, title: "When the two averages agree",
      body: "Only for one-direction motion. With constant velocity, instantaneous and average are equal; the moment acceleration enters, they are not.",
    },
    {
      t: 994, end: 1032, title: "The constant-speed formula",
      body: "d = vt, where d is distance if v is speed and displacement if v is velocity. Constant speed means no v̄ needed — there is nothing to average.",
    },
    {
      t: 1035, end: 1120, title: "The constant-acceleration set",
      body: "v̄ = (u + v)/2, d = ½(u + v)t, v = u + at, v² = u² + 2ad, d = ut + ½at². Write all five on one line; most paper items are a single substitution into one of them.",
    },
    {
      t: 1368, end: 1430, title: "Worked: fix the units first",
      body: "40 m/s with a distance in miles and an answer in hours: convert 40 m/s → 89.5 mph (÷1000, ÷1.609, ×60, ×60), then t = 200/89.5 ≈ 2.23 h. Units are the first move, not the last.",
    },
    {
      t: 1703, end: 1780, title: "Worked: a negative velocity, honestly",
      body: "From 50 miles east to 90 miles west: Δx = −90 − 50 = −140 miles, so v̄ = −28 mph. The sign is information — west — not an error.",
    },
  ],

  S0_qX4VJhMQ: [
    {
      t: 12, end: 56, title: "Why formula fluency matters",
      body: "Real models are built from polynomials, trig and exponentials, so fluency with abstract derivatives is what lets you talk about concrete rates. The risk is that it degrades into memorised rules.",
    },
    {
      t: 135, end: 178, title: "The square picture",
      body: "For f = x², growing x by dx adds two bars of area x·dx each plus a corner of dx². The corner is negligible for tiny dx, leaving dF ≈ 2x·dx — the derivative is 2x.",
    },
    {
      t: 224, end: 266, title: "A cube for x³",
      body: "Growing a cube adds three thin slabs of volume x²·dx; edge slivers are O(dx²) and vanish. Hence d(x³)/dx = 3x², which is exactly the algebra from the previous video seen as geometry.",
    },
    {
      t: 438, end: 480, title: "The power rule",
      body: "d/dx xⁿ = n·xⁿ⁻¹: the exponent hops down in front and leaves one less behind. Check the two cases you can see: 2x for x², 3x² for x³.",
    },
    {
      t: 482, end: 524, title: "Why n works for every power",
      body: "Write (x + dx)ⁿ as n brackets; choosing a single dx from any one of them gives n terms of xⁿ⁻¹·dx. Everything else carries dx² or higher and dies in the limit.",
    },
    {
      t: 612, end: 664, title: "1/x as a puddle of area 1",
      body: "If width is x and area stays 1, height must be 1/x. Widen by dx and the height must drop so the strip gained on the right equals the strip lost on top — that balance is the derivative.",
    },
    {
      t: 779, end: 826, title: "Sine from a walk round the circle",
      body: "sin θ is the height after walking arc length θ on the unit circle. The graph's slope starts positive, dies at the peak, goes negative — the shape of cosine.",
    },
    {
      t: 901, end: 948, title: "The similar triangle does it",
      body: "Nudge θ by dθ: the height change d(sin θ) and the step dθ form a tiny triangle similar to the big one. Their ratio is adjacent/hypotenuse = cos θ, so the derivative of sine is cosine exactly.",
    },
  ],

  /* ------------------------------------------------------------- electricity */
  oI_X2cMHNe0: [
    {
      t: 163, end: 206, title: "Two very different speeds",
      body: "Electrons in a filament move randomly at about 10⁶ m/s, yet their drift along the wire is under 0.1 mm/s. Nothing about a circuit is fast because electrons are fast — the field is what travels quickly.",
    },
    {
      t: 204, end: 246, title: "The electron carries energy only briefly",
      body: "A collision dumps kinetic energy into the lattice and the wire heats. But that energy did not travel from the battery inside the electron; on a freshly closed circuit the electron has never been near the battery.",
    },
    {
      t: 244, end: 288, title: "The field re-accelerates it",
      body: "After every collision the electric field gives the electron its kinetic energy back. So the electron delivers the energy to the lattice, but the field is where that energy came from. This distinction is the whole video.",
    },
    {
      t: 285, end: 328, title: "Electrons do not shove each other along",
      body: "Inside a conductor the electron sea and the positive ion cores cancel: net charge density is zero. Every mutual repulsion between electrons is offset by an ion, so they cannot push each other through the wire.",
    },
    {
      t: 326, end: 408, title: "Where the field actually comes from",
      body: "Not just the battery. Charges spread along the wire surface build the field inside. Test it: move the bulb close to the battery and it does not brighten — a battery-only field would make it brighter.",
    },
    {
      t: 407, end: 450, title: "Charges rearrange at the speed of light",
      body: "Setting up the surface charges needs only a sub-atomic shift of the electron sea, so the rearrangement is effectively instant. The limiting speed for the whole circuit is therefore light itself, not electron motion.",
    },
    {
      t: 448, end: 490, title: "Shepherd, dogs, sheep",
      body: "Ben Watson's analogy: the battery is the shepherd, the surface charges are the sheepdogs relaying the orders, and the mobile electrons are the sheep. The sheep never decide where to go.",
    },
    {
      t: 489, end: 530, title: "Why the resistor has the strongest field",
      body: "Same current through a narrower cross-section means a higher drift velocity, and drift is proportional to field. So the field peaks inside the resistor, built by the steepest surface-charge gradient there.",
    },
    {
      t: 653, end: 700, title: "1 m ÷ c, and why the bulb lights",
      body: "Closing the switch lets the two surface-charge regions neutralise, the field inside stops being zero, and that change radiates at c. One metre away gives about 3.3 ns — the units are seconds, hence 1 m ÷ c.",
    },
    {
      t: 817, end: 860, title: "The disconnected wire settles the causality argument",
      body: "A wire sitting below the circuit, touching nothing, responds almost identically at first. Current in the load is driven by the field it sits in, not by knowing that a circuit somewhere is complete.",
    },
    {
      t: 901, end: 945, kind: "sim", sim: "ohms-law",
      title: "Ohm's law is a shortcut for all that",
      body: "V = IR is the lumped summary of surface charges, their fields, and countless collisions. Move the voltage and watch the current answer — then remember what the symbol is hiding.",
    },
    {
      t: 944, end: 990, kind: "article", article: "electric-fields-and-potential",
      title: "The circuit diagram was lying",
      body: "The two long wires interact through the space between them, and a plain diagram has no element for that. Written version of fields, potential difference and why the wires are not the whole story.",
    },
    {
      t: 1110, end: 1155, title: "4 V, 4 mA, 14 mW",
      body: "Measured on a fast scope: about 4–5 V appears across a 1 kΩ resistor within nanoseconds, so roughly 4 mA and 14 mW before the signal has gone round the loop. Real power, not leakage.",
    },
    {
      t: 1273, end: 1320, kind: "article", article: "terminal-voltage",
      title: "The fields are the main actors",
      body: "Voltage and current are convenient bookkeeping; the energy lives in the fields around the conductors. Read how that view explains terminal voltage and internal resistance on paper questions.",
    },
  ],

  /* ----------------------------------------------------------- stoichiometry */
  "7Cfq0ilw7ps": [
    {
      t: 5, end: 48, title: "Three shapes of stoichiometry question",
      body: "Moles A → moles B is one fraction (mole ratio). Moles A → grams B is two. Grams A → grams B is three. Count the unit changes before you write anything — that tells you how many steps the work needs.",
    },
    {
      t: 83, end: 126, title: "Balance before you calculate",
      body: "SO₂ + O₂ → SO₃ is not balanced: 4 oxygens in, 3 out. Doubling the SO₃ gives 2SO₂ + O₂ → 2SO₃ with 6 on each side. Every ratio you use afterwards comes straight from these coefficients, so a wrong equation poisons the whole answer.",
    },
    {
      t: 167, end: 210, title: "The mole ratio is just the coefficients",
      body: "2SO₂ to 2SO₃ is a 2:2 ratio, so 3.4 mol of SO₂ gives 3.4 mol of SO₃. Put the given substance's moles on the bottom so the unit cancels and only the wanted substance is left.",
    },
    {
      t: 257, end: 300, title: "One fraction, one answer",
      body: "4.7 mol SO₂ with a 2:1 ratio to O₂ gives 4.7 ÷ 2 = 2.35 mol of oxygen. Same method, different ratio — the ratio is the only thing that changes between these items.",
    },
    {
      t: 343, end: 386, title: "Change one thing at a time",
      body: "Moles of A → moles of B changes the substance and keeps the unit. Then moles → grams changes the unit and keeps the substance. Two small, checkable moves beat one long chain you cannot debug.",
    },
    {
      t: 385, end: 430, title: "Balancing propane",
      body: "C₃H₈ + 5O₂ → 3CO₂ + 4H₂O: three carbons need 3CO₂, eight hydrogens need 4H₂O, and that leaves 10 oxygens, so 5O₂. Balance C, then H, then O — the order that always closes the loop.",
    },
    {
      t: 468, end: 512, title: "Molar mass is the gram bridge",
      body: "CO₂ is 12.01 + 2(16) = 44.01 g/mol, and the unit g/mol is the whole trick: multiply moles by g/mol and the moles cancel. Learn to read M as an exchange rate, not a number to memorise.",
    },
    {
      t: 556, end: 600, kind: "article", article: "mole-bridge",
      title: "If the gram ↔ mole step wobbles",
      body: "The written version of that bridge, with the unit-cancelling laid out. Worth five minutes before the gram-to-gram problems below, where it is the first and last step.",
    },
    {
      t: 511, end: 556, title: "Chain the fractions",
      body: "2.8 mol C₃H₈ × (3 mol CO₂ / 1 mol C₃H₈) × (44.01 g / 1 mol) ≈ 369.5 g. Write the units above and below the line; the answer's unit is the receipt that the chain was built the right way up.",
    },
    {
      t: 723, end: 772, title: "Reverse it: grams → moles",
      body: "25 g of propane, M = 44.09 g/mol, so 25 ÷ 44.09 ≈ 0.556 mol. Then the 1:4 ratio to water gives about 2.27 mol H₂O. Notice the order flipped — grams to moles now comes first.",
    },
    {
      t: 893, end: 942, title: "Starting from the product",
      body: "38 g H₂O ÷ 18.016 g/mol ≈ 2.11 mol water, then × 3/4 gives 1.58 mol CO₂. Ratios work in either direction; just keep the substance you are leaving on the bottom.",
    },
    {
      t: 1017, end: 1064, title: "Get the formula right first",
      body: "Aluminium is Al³⁺, chloride Cl⁻, so criss-cross gives AlCl₃. Then balance: 2Al + 3Cl₂ → 2AlCl₃. A wrong formula changes the molar mass and every ratio after it.",
    },
    {
      t: 1101, end: 1150, title: "Gram → gram is exactly three steps",
      body: "Grams A → moles A (divide by M_A) → moles B (mole ratio) → grams B (multiply by M_B). Only one of those three steps is chemistry; the other two are unit conversion.",
    },
    {
      t: 1310, end: 1356, title: "172.96 g, and why the 2s vanish",
      body: "35 g Al ÷ 26.98 = 1.297 mol, the 2:2 ratio leaves it unchanged, then × 133.33 g/mol ≈ 172.96 g AlCl₃. Equal coefficients mean the ratio is 1 — do not invent a factor of two.",
    },
    {
      t: 1352, end: 1400, title: "Last check: units must cancel",
      body: "42.8 g Al ÷ 26.98 × (3/2) × 70.9 ≈ 168.75 g Cl₂. If the units left standing are not grams of the substance asked for, the fraction is upside down — that check alone catches most exam slips.",
    },
  ],

  /* -------------------------------------------------------------- lexis/concord */
  "USeBA_VM-Ys": [
    {
      t: 56, end: 140, title: "Concord is subject–verb agreement",
      body: "One subject, one verb, and they must match in number: she writes / they write. The -s on a present-tense verb marks a singular subject, which is the opposite of the -s on a noun. That reversal is where most lost marks start.",
    },
    {
      t: 309, end: 350, title: "has / have and is / are",
      body: "He has, they have; the boy is, the boys are. These two pairs carry a large share of JAMB concord items, so make them automatic before worrying about the exotic rules.",
    },
    {
      t: 393, end: 436, title: "Third person singular takes -s",
      body: "He works, she teaches, it rains. The subject is one other person or thing, so the present-tense verb takes -s or -es. Never let a nearby plural pull the verb away from its own subject.",
    },
    {
      t: 566, end: 648, title: "Two subjects joined by 'and' go plural",
      body: "Ram and Shola are brothers: two singulars become one plural subject, so the verb must be plural. Reading it as 'Ram is...' fails because the second name is still sitting there unaccounted for.",
    },
    {
      t: 648, end: 690, title: "Bread and butter are on the table",
      body: "Here the two items are genuinely separate things, so the verb is plural. The rule is not the word 'and' — it is whether the two nouns still name two separate things.",
    },
    {
      t: 690, end: 772, title: "The exception: one idea, singular verb",
      body: "Bread and butter is my breakfast, because buttered bread is one food, one unit. Slow and steady wins the race, for the same reason. When the pair fuses into a single notion, the verb stays singular — a favourite trap.",
    },
    {
      t: 772, end: 940, title: "or / nor: the nearest subject decides",
      body: "Either the teacher or the students are responsible — 'students' sits next to the verb, so the verb is plural. Reverse the order and it becomes 'is'. This is proximity concord, and it appears in almost every past paper.",
    },
    {
      t: 940, end: 1028, title: "Neither ... nor works the same way",
      body: "Neither the students nor the teacher is available: the nearest subject is singular 'teacher', so the singular verb. Ignore the plural you passed on the way — only the last one counts.",
    },
    {
      t: 1028, end: 1108, title: "Notional concord: meaning over form",
      body: "A collective noun can be singular or plural depending on whether you mean the group as one body or its members as individuals. Ask which meaning the sentence is actually using before you choose the verb.",
    },
    {
      t: 1108, end: 1150, title: "The committee has / the committee have",
      body: "The committee has reached a decision — one unit acting. The committee have different opinions — the members disagreeing as individuals. Same noun, different verb, because the sense changed.",
    },
    {
      t: 1150, end: 1192, title: "Uncountables take a singular verb",
      body: "Information, furniture, equipment, advice have no plural form, so: the information is useful, the furniture was damaged. Writing 'informations are' is wrong twice over and examiners notice.",
    },
    {
      t: 1192, end: 1233, title: "Looks plural, means singular",
      body: "Mathematics is difficult, the news is good, economics is interesting. These end in -s but name one subject or one piece of news, so the verb is singular. Memorise the short list: mathematics, physics, economics, news, measles.",
    },
    {
      t: 1233, end: 1315, title: "Looks singular, means plural",
      body: "The police are investigating, the cattle are grazing. These are group words with no singular form in normal use, so they take a plural verb even though they look like one body.",
    },
    {
      t: 1315, end: 1379, title: "'There are' follows the real subject",
      body: "There are many problems in this plan: 'problems' is the subject, so 'are'. With 'there is a problem', the singular subject takes 'is'. The word 'there' is never the subject — look past it.",
    },
    {
      t: 1379, end: 1439, title: "Person and number",
      body: "I am, you are, he/she/it is, we/they are. First, second and third person, singular and plural — the table you should be able to write from memory before the exam hall.",
    },
    {
      t: 1439, end: 1495, kind: "article", article: "concord-find-subject",
      title: "Practise finding the subject first",
      body: "Most concord errors are subject-identification errors in disguise. This walkthrough drills the step that actually decides the answer: strip the phrase, find the head noun, then agree with it.",
    },
  ],

  /* --------------------------------------------------------------- quadratics */
  MHXO86wKeDY: [
    {
      t: 35, end: 80, title: "The most memorised formula in school",
      body: "Almost everyone can chant it, almost nobody expects to use it. Grant's aim is different: connect it to patterns you already own, so it stops being a spell and becomes a way of thinking.",
    },
    {
      t: 210, end: 262, title: "A trillion times, at Pixar",
      body: "Ray tracing asks whether a ray hits a sphere, and that question reduces to a quadratic. One engineer estimated Coco used the formula over a trillion times. 'You'll never use it' is not quite true.",
    },
    {
      t: 458, end: 542, title: "Factor 3,599 in your head",
      body: "Brute-force primes would take minutes. But 3,599 = 3,600 − 1 = 60² − 1², so it factors as 59 × 61. Same trick gives 35 = 5 × 7 and 143 = 11 × 13 — whenever a number sits one below a square.",
    },
    {
      t: 584, end: 628, title: "Cut the corner off a square",
      body: "Take x² and remove a 1×1 corner: the L-shape rearranges into a rectangle (x + 1) by (x − 1). The algebra x² − 1 = (x − 1)(x + 1) is that rearrangement, seen instead of memorised.",
    },
    {
      t: 628, end: 671, title: "Any square minus any square",
      body: "Remove a bigger corner, y by y, and the remainder folds into (x + y)(x − y). So x² − y² always factors — no guessing, no trial divisors. This is the engine behind everything that follows.",
    },
    {
      t: 671, end: 722, title: "Midpoint and distance",
      body: "Write any two numbers as m − d and m + d, where m is their average and d their spread. Their product is m² − d². Products and differences of squares are the same information in two costumes.",
    },
    {
      t: 839, end: 886, title: "Normalise first: divide by a",
      body: "ax² + bx + c and x² + (b/a)x + c/a have identical roots — scaling a function does not move where it crosses zero. Working with a leading coefficient of 1 is a convenience, not a different problem.",
    },
    {
      t: 963, end: 1053, title: "Read the coefficients, get the roots' sum and product",
      body: "(x − r)(x − s) expands to x² − (r + s)x + rs. So the x-coefficient is minus the sum of the roots, and the constant is their product. Two facts, no formula — and they work for any quadratic once normalised.",
    },
    {
      t: 1053, end: 1100, kind: "article", article: "factor-first",
      title: "Guess-and-check is the easy direction",
      body: "x² − 7x + 12 works because 3 and 4 add to 7 and multiply to 12. That luck runs out fast. The written walkthrough of the systematic method, for when the numbers are not friendly.",
    },
    {
      t: 1136, end: 1182, title: "Mean and spread solve the guessing game",
      body: "We know the sum and the product of the roots; we want the roots. Write the product as m² − d², where m is half the sum. Then d² = m² − p, and the roots are m ± d. No trial and error anywhere.",
    },
    {
      t: 1180, end: 1272, title: "x² + 6x + 7 in your head",
      body: "m = −b/2 = −3, and d² = m² − c = 9 − 7 = 2, so the roots are −3 ± √2. Check: they sum to −6 and multiply to 7. Two lines, and the answer is already exact.",
    },
    {
      t: 1272, end: 1332, title: "The whole formula: m ± √(m² − p)",
      body: "Find the midpoint m = −b′/2, then the square of the spread from m² − p. The roots are m plus or minus that square root. Everything else in the classic formula is this, written the long way.",
    },
    {
      t: 1528, end: 1600, title: "When d² comes out negative",
      body: "3x² − 4x + 5 normalises to m = 2/3 and d² = 4/9 − 5/3 = −11/9. Nothing is broken: a negative d² means the parabola never meets the x-axis, so the roots are complex. The algebra tells you before the graph does.",
    },
    {
      t: 1728, end: 1792, title: "Complex roots are a right triangle",
      body: "x² − 6x + 10 gives 3 ± i. On the complex plane the two roots are symmetric about 3, and their magnitude is √(3² + 1²) = √10 — and √10 is also √(product of roots). Pythagoras and quadratics are the same picture.",
    },
    {
      t: 2094, end: 2162, title: "Why the classic formula looks so ugly",
      body: "Derive it without renaming anything and you carry b/2a and c/a through every line, then factor 4a² out of a radical. Grant's point: the mess is un-refactored code. Name the midpoint and the spread and it tidies itself.",
    },
    {
      t: 2581, end: 2650, title: "Easy direction, hard direction",
      body: "Roots → coefficients is trivial expansion; coefficients → roots is the hard direction, and the midpoint/spread step makes it easy. That pattern — same information, different representation, one direction cheap — recurs all over maths.",
    },
  ],

  /* --------------------------------------------------------------- projectiles */
  "8NLzuURxFwY": [
    {
      t: 1, end: 42, title: "Only two kinds of motion",
      body: "Constant speed gives d = vt. Constant acceleration gives the four standard equations, including v = u + at and v² = u² + 2ad. Projectiles are not a third kind — they are these two, one per axis.",
    },
    {
      t: 81, end: 124, title: "d = ut + ½at², and what d really is",
      body: "d is displacement, final position minus initial, so it carries a sign. It equals distance only while the object never reverses. In projectile work you apply it separately in x and in y.",
    },
    {
      t: 122, end: 164, title: "Three trajectories, one method",
      body: "Horizontal launch from a cliff, launch from the ground at an angle, and launch from a cliff at an angle. The equations differ, but the method never does: resolve, then treat each axis with its own acceleration.",
    },
    {
      t: 162, end: 204, title: "Off a cliff: H = ½gt²",
      body: "Horizontally launched means the initial vertical velocity is zero, so the ½at² term stands alone. Height depends only on time — the horizontal speed does not change how long the fall takes.",
    },
    {
      t: 203, end: 246, title: "Why vy = 0 at the top",
      body: "At the highest point the object is still moving forward but no longer rising, so the vertical component is momentarily zero. That single fact generates the time-to-top, max-height and symmetry results.",
    },
    {
      t: 244, end: 286, title: "Range is just vx × t",
      body: "Horizontally there is no acceleration (ax = 0), so vx never changes and range = vx·t. Find the time from the vertical story, then spend it on the horizontal one.",
    },
    {
      t: 284, end: 330, title: "Speed and angle at impact",
      body: "Keep vx, compute vy = uy + at, then v = √(vx² + vy²) and θ = tan⁻¹(vy/vx). The ball is usually faster at the ground than it was at launch when it started above ground level.",
    },
    {
      t: 370, end: 414, title: "Launching at an angle",
      body: "Resolve the launch speed once: vx = v cos θ, vy = v sin θ. From then on the horizontal component is frozen and only the vertical component feels g.",
    },
    {
      t: 452, end: 498, title: "Time to the top",
      body: "Set vy = 0 in vy = uy − gt: t = v sin θ / g. Every 'time to maximum height' question is this one substitution, so learn it as a result rather than re-deriving it under pressure.",
    },
    {
      t: 536, end: 580, title: "Symmetry doubles the time",
      body: "Rising and falling back to the same level take equal times, so total flight is 2v sin θ / g. Sample speeds are symmetric too: the speed at landing equals the launch speed for a level surface.",
    },
    {
      t: 660, end: 704, title: "Maximum height",
      body: "Use v² = u² + 2ad vertically with v = 0: H = v² sin²θ / 2g. Note sin²θ, not sin 2θ — mixing the two formulae is one of the most common projectile errors.",
    },
    {
      t: 783, end: 826, title: "Range and the double-angle identity",
      body: "R = v cos θ × (2v sin θ / g), and 2 sin θ cos θ = sin 2θ, so R = v² sin 2θ / g. Maximum range comes at 45°, and complementary angles give equal ranges.",
    },
    {
      t: 824, end: 908, title: "The cliff launch breaks the symmetry",
      body: "Launching upward from a height is not symmetric: the ball rises above the cliff and then falls past it. The level-ground range formula does not apply — use vx × total time instead.",
    },
    {
      t: 1073, end: 1158, title: "Avoid the quadratic: split the flight",
      body: "Time up to the peak is v sin θ / g. Then find the peak height above the ground, h + v²sin²θ/2g, and fall from rest: t = √(2y_max/g). Add the two times instead of solving 4.9t² + … = 0.",
    },
    {
      t: 1242, end: 1288, title: "Range from a cliff",
      body: "R = v cos θ × (total time). Do not use v²sin 2θ/g here — it returns the range between two points at the same height, which is a much shorter distance than the true range.",
    },
    {
      t: 1323, end: 1364, title: "Final speed at the ground",
      body: "vx is unchanged, so only vy needs updating: vy = v sin θ − gt with the full flight time. Then combine. A large negative vy is expected, not a sign error.",
    },
    {
      t: 1411, end: 1454, title: "How to state the landing angle",
      body: "tan θ = |vy| / vx gives the reference angle between 0° and 90°. Say '60° below the horizontal', or 300° measured from the positive x-axis. Use positive values inside tan⁻¹ and describe the direction in words.",
    },
    {
      t: 1498, end: 1549, kind: "sim", sim: "projectile-motion",
      title: "Aim it yourself",
      body: "Drag the cannon and watch the horizontal and vertical stories run on the same clock. The sim makes the independence of the axes visible — change the angle and see which quantity moves.",
    },
  ],

  /* ------------------------------------------------------- transmission lines */
  "2Vrhk5OjBP8": [
    {
      t: 24, end: 70, title: "The thought experiment, built for real",
      body: "A battery, a switch and a bulb, with roughly a kilometre of wire looped out each side. If power had to travel the whole loop, the bulb should wait for the round trip. AlphaPhoenix set out to time it.",
    },
    {
      t: 152, end: 196, title: "Why an electronic switch",
      body: "A mechanical switch bounces as its contacts slam together, and that noise would swamp a faint transient on a kilometre of wire. A transistor gives a clean 20–30 ns edge instead.",
    },
    {
      t: 194, end: 240, title: "One resistor, two probes",
      body: "A bulb is essentially a resistor, so a 1 kΩ resistor stands in for it. Measuring the voltage across it gives the current through it at every instant — no need to guess when the filament 'looks' on.",
    },
    {
      t: 278, end: 322, title: "What this apparatus can and cannot see",
      body: "Light crossing the 1 m gap takes about 0.5 ns, far below the switch's own rise time. But the round trip down 500 m of wire and back takes 1.5–2 µs, which is easy for the scope. So the experiment measures the loop, not the gap.",
    },
    {
      t: 320, end: 364, title: "The result: on a little, then on fully",
      body: "A small current appears almost at once; the bulb reaches full brightness 1.6 µs later. Multiply by c and you get about 480 m — matching the 500 m of wire. The delay is the loop, exactly as transmission-line theory predicts.",
    },
    {
      t: 444, end: 486, title: "The white trace is current, not voltage",
      body: "The scope plots volts, but this trace is the drop across the 1 kΩ resistor, so I = V/R converts it to current. That is what makes the two-stage shape readable: a small step, then a big one.",
    },
    {
      t: 484, end: 530, kind: "sim", sim: "ohms-law",
      title: "V = IR, in real time",
      body: "The whole trace rests on that one relation. Change the voltage and resistance in the sim and watch current answer — then remember that here the total current is limited by the line until the reflection returns.",
    },
    {
      t: 526, end: 570, title: "Two currents, one order of magnitude apart",
      body: "About 200 µA flows immediately, then 1.7 mA at steady state — roughly eight times more. The early current is real (around 10¹⁵ electrons per second) but far too small to light an incandescent bulb properly.",
    },
    {
      t: 609, end: 652, title: "Two waves, not one",
      body: "The main wave travels out from the switch. A second wave starts at the bulb almost immediately and travels back to meet it. The bulb only goes fully on when the first wave completes its journey, but it is nudged from the start.",
    },
    {
      t: 650, end: 696, title: "The wires behave as a capacitor",
      body: "The two long conductors sit at different potentials with space between them, so charge can build on their surfaces. For the first microseconds that capacitance lets current flow across the gap without waiting for the far ends.",
    },
    {
      t: 733, end: 778, title: "Chain in a tube, corrected",
      body: "Model electrons as links in a chain and the wire as the tube. The correction that matters: each electron's influence is much wider than the wire, so it also interacts with the other conductor. That is why the two sides are coupled.",
    },
    {
      t: 858, end: 942, title: "Charge imbalance reaches across the gap",
      body: "Where the wavefront passes, one spot has surplus electrons and the other a deficit. Their fields extend across the gap and push electrons through the bulb before the far end of the wire knows anything happened. No information travels faster than light — the field simply arrives first.",
    },
    {
      t: 1062, end: 1106, title: "Cut the wire: the first microsecond is identical",
      body: "With the far ends disconnected, the trace still shows the same initial blip, then decays. For 1.6 µs the circuit is bound by relativity to look exactly like the connected one — it cannot yet know the wire ends exist.",
    },
    {
      t: 1103, end: 1148, title: "Then the circuit learns",
      body: "After the round trip the difference appears: the near-side current dies as electrons pile up with nowhere to go. The bulb never reaches full brightness because no steady current can flow through a broken loop.",
    },
    {
      t: 1185, end: 1232, title: "The slosh needs inductance as well",
      body: "The white trace briefly reverses, meaning current flows backwards. Energy rings between the capacitance (stores charge) and the inductance (gives current inertia). That is why the trace oscillates instead of settling cleanly.",
    },
    {
      t: 1268, end: 1310, kind: "article", article: "electric-fields-and-potential",
      title: "Why the field arrives before the current",
      body: "The written account of surface charge, field and potential difference that makes this experiment unsurprising. Read it if the two-wave picture still feels like a trick.",
    },
  ],

  /* ---------------------------------------------------------------- 12 tenses */
  "n-11FijFAmM": [
    {
      t: 6, end: 60, title: "One video, twelve tenses",
      body: "Four present, four past, four future, each lesson self-contained inside this 2.5-hour compilation. Use the timeline to jump to the tense you are revising rather than watching straight through.",
    },
    {
      t: 112, end: 170, title: "Present simple: base verb, -s for he/she/it",
      body: "I eat, she plays. Negatives and questions borrow do/does and the main verb returns to base: she does not play, does she play? The -s belongs to the subject, not to the tense.",
    },
    {
      t: 393, end: 450, title: "The emphatic do",
      body: "I do apologize; you do look well. A positive present-simple sentence with 'do' added is emphasis, not a question. English has no other way to stress a verb this directly.",
    },
    {
      t: 493, end: 550, title: "State verbs and the meaning test",
      body: "Know, love and understand describe states, so they stay in the simple present. Verbs like think split: 'I think it's a bad idea' is a state, 'I'm thinking about it' is a process. Meaning decides the tense, not the verb alone.",
    },
    {
      t: 857, end: 912, title: "The present that tells stories",
      body: "Narratives and live commentary use present simple for the main events and present continuous for background: 'The dog is sitting in the park when a man approaches.' Headlines do the same — 'Volcano erupts in Iceland' for something already past.",
    },
    {
      t: 1201, end: 1260, title: "Present continuous: be + -ing",
      body: "She is hunting, they are crying. Watch the spelling: stop → stopping, come → coming, lie → lying. Use it for actions exactly now, around now, or future plans with a future word like tomorrow.",
    },
    {
      t: 1664, end: 1720, title: "Verbs that resist the -ing form",
      body: "Agree, believe, know and prefer normally stay simple: 'I agree', never 'I am agreeing'. With always or constantly, though, the continuous returns to show a habit so frequent it defines the person: 'She is always changing her mind.'",
    },
    {
      t: 2072, end: 2130, title: "Present perfect: have/has + past participle",
      body: "I have written, she has taught. Three uses: experience ('I have run a marathon'), change ('Sarah has moved'), and situations still continuing ('I have lived here for three years'). Contractions can mislead — 'it's eaten' may mean 'it has eaten' or 'it is eaten'.",
    },
    {
      t: 2480, end: 2536, title: "for vs since",
      body: "For a period — for two months, for five years. Since a starting point — since 9:00, since 2018. If the answer to 'how long?' is a duration, use for; if it is a date or clock time, use since.",
    },
    {
      t: 3195, end: 3250, title: "Present perfect continuous: have been + -ing",
      body: "I have been studying English for two years. The action began in the past and is still running, and the tense foregrounds duration rather than result. 'How long have you been…?' almost always expects this form.",
    },
    {
      t: 3828, end: 3885, title: "Past simple: finished, with the time known",
      body: "I visited my parents last month; the manager left at noon. Negatives and questions use did plus the base verb: I didn't talk, did you talk? Was/were handle the verb to be separately. If the event is closed and the time is stated or understood, this is the tense.",
    },
    {
      t: 4416, end: 4472, title: "Past continuous: was/were + -ing",
      body: "It paints the scene rather than reporting the event: 'I was running through the park when a deer walked out.' The continuous action is the backdrop; the simple past cuts across it.",
    },
    {
      t: 5133, end: 5192, title: "Past perfect: had + past participle",
      body: "The past in the past. I had exercised before class, so I was tired — both events are past, but the exercise happened first. Use it whenever you need to order two past events explicitly.",
    },
    {
      t: 5308, end: 5366, title: "Reported speech lives in the past perfect",
      body: "He told us that he had failed the exam. After said, told, thought or wondered, a past action shifts back one step. Direct speech 'The manager has left' becomes 'The manager had left'.",
    },
    {
      t: 5928, end: 5988, title: "Past perfect continuous: had been + -ing",
      body: "She had been working there for five years before she resigned. It measures how long an action had already been running at a past reference point — the duration version of the past perfect.",
    },
    {
      t: 6652, end: 6710, title: "The future is built from modals, not endings",
      body: "English does not add -ed or -s to make a future. It puts a modal before the base verb: will, may, might. That is why all four future tenses look like verb phrases rather than inflected verbs.",
    },
    {
      t: 6948, end: 7006, title: "Future continuous: will be + -ing",
      body: "At 8 p.m. I will be studying. It places you inside an action already in progress at a future moment — the future mirror of the past continuous.",
    },
    {
      t: 7445, end: 7503, title: "Future perfect: will have + past participle",
      body: "By next June I will have finished school. The action is complete before a stated future deadline. If the sentence contains 'by' plus a future time, this is usually the tense being tested.",
    },
    {
      t: 8031, end: 8090, title: "Future perfect continuous: will have been + -ing",
      body: "I will have been studying for half an hour when my friends arrive. It states how long an action will already have been running at a future point — the least common of the twelve, and the one exams use to separate candidates.",
    },
    {
      t: 8350, end: 8420, kind: "article", article: "tense-system-deep-map",
      title: "The whole system on one page",
      body: "Twelve tenses is four times three: simple, continuous, perfect, perfect continuous, each in present, past and future. The article lays the grid out with the form and one job per cell, so revision stops being a list.",
    },
  ],

  /* ------------------------------------------------------------ percent yield */
  w1njGAkc8og: [
    {
      t: 1, end: 42, title: "The question, stated plainly",
      body: "45.2 g of iron reacts with excess oxygen and 58.1 g of Fe₃O₄ is collected. Two different numbers — one is what chemistry allows, the other is what the experiment delivered. Keep them apart from the first line.",
    },
    {
      t: 41, end: 82, title: "Balance before anything else",
      body: "3Fe + 2O₂ → Fe₃O₄. Three iron atoms and four oxygen atoms on each side. Every ratio in the rest of the problem is read off these coefficients, so a wrong equation cannot be rescued later.",
    },
    {
      t: 80, end: 122, title: "Theoretical yield is a maximum",
      body: "It always refers to the product and is the most you could possibly obtain if the reaction ran perfectly. You cannot collect more than it; a bigger actual yield means an arithmetic error somewhere.",
    },
    {
      t: 120, end: 168, kind: "article", article: "mole-bridge",
      title: "The three-step gram-to-gram bridge",
      body: "Grams of Fe → moles of Fe → moles of Fe₃O₄ → grams of Fe₃O₄. Only the middle step is chemistry; the outer two are unit conversion. The article if that bridge still needs tightening.",
    },
    {
      t: 166, end: 212, title: "Molar masses: 55.85 and 231.55",
      body: "Fe is 55.85 g/mol; Fe₃O₄ is 3(55.85) + 4(16) = 231.55 g/mol. Write the units as g/mol every time — they are what tells you whether to multiply or divide.",
    },
    {
      t: 250, end: 292, title: "45.2 g Fe gives 62.5 g Fe₃O₄",
      body: "45.2 ÷ 55.85 = 0.809 mol Fe; the 3:1 ratio gives 0.2697 mol Fe₃O₄; × 231.55 = 62.5 g. That 62.5 g is the theoretical yield, and it is the denominator of everything that follows.",
    },
    {
      t: 291, end: 334, title: "Percent yield = actual ÷ theoretical × 100",
      body: "58.1 ÷ 62.5 × 100 ≈ 93%. The reaction was 93% efficient. Note the actual yield is always the smaller number and must be the same substance as the theoretical yield.",
    },
    {
      t: 372, end: 416, title: "Working backwards from an efficiency",
      body: "If the process is 75% efficient, actual = 62.5 × 0.75 = 46.9 g. 'Efficient' and 'percent yield' are the same quantity — the exam may phrase it either way.",
    },
    {
      t: 492, end: 538, title: "Vanadium(V) oxide: get the formula first",
      body: "The Roman numeral V means vanadium is +5 and oxide is −2, so V₂O₅. Balance 6V + 5O₃ → 3V₂O₅: fifteen oxygens on each side. Formula errors propagate into every molar mass afterwards.",
    },
    {
      t: 576, end: 622, title: "Two reactants given: test both",
      body: "When neither reactant is labelled excess, convert each one separately into grams of product. The smaller answer is the true theoretical yield, and the reactant that produced it is limiting.",
    },
    {
      t: 831, end: 878, title: "Vanadium limits, ozone is in excess",
      body: "V could give 89.26 g; O₃ could give 113.7 g. The lower figure wins, so vanadium is limiting. Do not average them or take the larger — the slowest reagent sets the ceiling.",
    },
    {
      t: 875, end: 920, title: "65 g collected out of 89.26 g",
      body: "65 ÷ 89.26 × 100 ≈ 72.8%. Same formula as before, but now the denominator came from a limiting-reactant calculation rather than being handed to you.",
    },
    {
      t: 916, end: 962, title: "90% efficient means multiply by 0.90",
      body: "89.26 × 0.90 = 80.33 g. The percentage is always applied to the theoretical yield, never to the actual yield you were given.",
    },
    {
      t: 996, end: 1018, title: "The one sentence to remember",
      body: "Theoretical yield is what the balanced equation permits; actual yield is what the flask delivered; percent yield is the ratio. '90% efficient' is just percent yield written in a different costume.",
    },
  ],

  /* ------------------------------------------------------------- dutch wealth */
  Ot4qdCs54ZE: [
    {
      t: 41, end: 82, title: "The most unequal place on earth",
      body: "The Netherlands has universal healthcare, strong pensions and famously high taxes — and, on World Bank wealth-inequality figures, it is the only country more unequal than the world taken as a whole. Both facts are true at once, which is the puzzle.",
    },
    {
      t: 82, end: 124, title: "The policy being exported",
      body: "Nordic-style taxes and transfers are proposed elsewhere as the cure for wealth inequality. The Dutch case is the natural test: if the policies worked, this is what success should look like. It does not look like that.",
    },
    {
      t: 164, end: 206, title: "Gini in three people and three dollars",
      body: "Three people share three dollars a year. One dollar each gives a Gini of 0; one person taking all three gives 1. Every real economy sits between those bounds, so the number is a position, not a moral verdict.",
    },
    {
      t: 206, end: 247, title: "The y = x line",
      body: "Plot cumulative share of people against cumulative share of income. Perfect equality is the 45° diagonal: the first person has 1, the first two have 2, all three have 3. Any bowing below the diagonal is inequality.",
    },
    {
      t: 247, end: 288, title: "One number, two different questions",
      body: "The same coefficient is computed for income and for wealth, and the two answers diverge sharply. Headlines quote income inequality because it is easier to measure and easier to blame on a CEO's salary.",
    },
    {
      t: 288, end: 329, title: "Income is the tap, wealth is the tank",
      body: "People who earn more can save more, and savings compound. If incomes were levelled, the flow into the tank would shrink — so equalising income should, in theory, starve wealth inequality at the source.",
    },
    {
      t: 329, end: 370, title: "Sweden is more unequal than the US",
      body: "Sweden, Denmark, Finland and Norway score very low on income inequality and very high on wealth inequality. Sweden's wealth Gini exceeds that of the United States, Brazil and India — the theory above has failed.",
    },
    {
      t: 370, end: 411, title: "Net worth has no floor at zero",
      body: "After-tax income cannot go below zero; net worth can. A graduate with large student loans, no house and no car has negative wealth, and no income table will ever show it.",
    },
    {
      t: 411, end: 452, title: "Borrowing more than the house is worth",
      body: "Most banks demand a deposit so the borrower has skin in the game. The Dutch national mortgage guarantee removes that: the government reimburses the lender's shortfall, so loans can cover 100% of the price or more.",
    },
    {
      t: 452, end: 493, kind: "article", article: "market-intervention",
      title: "Interest you can deduct from tax",
      body: "Earn €100,000, pay €40,000 of mortgage interest, and you are taxed on €60,000. That is a subsidy to borrowing dressed as a tax rule — the same wedge between price paid and price received that the article works through.",
    },
    {
      t: 493, end: 534, title: "110% of the value, minus €30,000",
      body: "A couple buys a €300,000 home and borrows €330,000. Instantly their net worth is −€30,000, yet they live comfortably. The metric records a peasant; the household records a normal young family.",
    },
    {
      t: 534, end: 575, title: "Credit is a ladder and a distortion",
      body: "Access to responsible credit is one of the strongest determinants of social mobility. It also inflates wealth-inequality measures beyond anything policy can reach — the Trump 'poorer than a homeless man' joke makes the accounting point.",
    },
    {
      t: 575, end: 616, title: "Four hundred years without a reset",
      body: "The Netherlands is where economists locate recognisably modern capitalism: stock markets, limited liability, speculative assets, all by the 1600s. Europe's wars and coups never wiped out the accumulated fortunes the way revolutions elsewhere did.",
    },
    {
      t: 656, end: 698, title: "The Heineken name is younger than the money",
      body: "Charlene de Carvalho is the country's wealthiest person. Her great-grandfather did not found Heineken; he persuaded his already-wealthy parents to buy a brewery and put the family name on it. The capital came from the Dutch East India Company era.",
    },
    {
      t: 698, end: 739, title: "No income since Napoleon",
      body: "This family has not earned a salary in two centuries, so an income tax — however steep — cannot touch it. Taxes on flows cannot reach a stock that compounds quietly in the background.",
    },
    {
      t: 739, end: 780, title: "10% for a century beats 100% for a decade",
      body: "$10,000 doubling for ten years reaches $10.24M. The same $10,000 at an ordinary 10% for a hundred years reaches $137.8M plus change. Time in the market dominates the rate of return — and dynasties have time.",
    },
    {
      t: 820, end: 861, title: "Primogeniture, kept quiet",
      body: "Dynastic fortunes survive by not being split: one trained heir keeps the assets intact while siblings live comfortably on allowances. The Giving Pledge touches the visible Forbes list; hundreds of families below the radar do the compounding.",
    },
    {
      t: 861, end: 902, title: "Inequality is not the same as misery",
      body: "The bottom 10% in the Netherlands are better off than the top 10% in a far more equal Ethiopia. What matters is whether systems let people rise and whether average comfort is protected — not the coefficient by itself.",
    },
  ],

  /* ----------------------------------------------------------- least action */
  "Q10_srZ-pbs": [
    {
      t: 2, end: 43, title: "One rule under everything",
      body: "Mechanics, electromagnetism, quantum theory, general relativity: all of it can be rewritten as a statement that a single quantity is stationary along the path taken. That is a strange claim, and the video spends half an hour earning it.",
    },
    {
      t: 43, end: 85, title: "The fastest ramp is not the shortest",
      body: "Slide a mass from A to B. The straight line is shortest, but bending the start downward buys speed early, and speed beats distance. The brachistochrone problem is to find the shape that balances the two.",
    },
    {
      t: 85, end: 127, title: "Galileo guessed a circle",
      body: "Galileo showed an arc of a circle beats any polygon, but could not prove it optimal. In June 1696 Johann Bernoulli threw the problem open to the world's mathematicians — largely to prove he was the best of them.",
    },
    {
      t: 127, end: 168, title: "Newton finishes it by 4 a.m.",
      body: "Newton, then Warden of the Mint, came home to the challenge, stayed up, and solved it overnight — work that took Bernoulli two weeks. He published anonymously; Bernoulli: 'I recognise the lion by his claw.'",
    },
    {
      t: 168, end: 209, title: "Bernoulli's better idea",
      body: "Bernoulli's own solution borrowed from optics. Fermat had argued that light minimises travel time, so Bernoulli imagined the sliding mass as a ray crossing ever-thinner layers of ever-faster medium. Mechanics became refraction.",
    },
    {
      t: 209, end: 250, title: "Hero's shortest path",
      body: "Hero of Alexandria noticed light takes the shortest path in a single medium, which explains why the angle of incidence equals the angle of reflection. Every other route to the mirror is longer.",
    },
    {
      t: 250, end: 291, kind: "article", article: "snells-law-in-one-page",
      title: "Refraction breaks the shortest path",
      body: "At a boundary light bends, so distance is clearly not what is minimised: a straight line through the water would be shorter. The ratio sin θ₁ / sin θ₂ is constant, but nobody knew why until Fermat.",
    },
    {
      t: 291, end: 332, title: "Fermat minimises time, not distance",
      body: "Light travels slower in water, so the quickest route bends toward the faster medium. Fermat could not initially solve the optimisation — every possible crossing point would have to be checked — and set it aside for five years.",
    },
    {
      t: 332, end: 373, title: "Snell's law falls out of least time",
      body: "When Fermat did solve it, the constant n turned out to be the ratio of light speeds in the two media, and Snell's law appeared as the minimising path. He called it the happiest calculation of his life.",
    },
    {
      t: 373, end: 414, title: "Nature as an optimiser",
      body: "This was the first demonstration that nature obeys an optimisation principle — that light does the best possible thing. That idea, not the algebra, is what Bernoulli carried into mechanics.",
    },
    {
      t: 458, end: 540, title: "Speed must grow like √y",
      body: "A falling mass converts potential energy to kinetic, so v² ∝ y, the distance fallen. In the optical model the speed of light must therefore increase as the square root of depth — an odd medium, but it matches gravity.",
    },
    {
      t: 540, end: 623, title: "Snell at every layer, then a cycloid",
      body: "Apply Snell at each interface: the outgoing angle of one layer is the incoming angle of the next, so sin θ / √y is the same everywhere. Bernoulli recognised that condition as the equation of a cycloid — the fastest descent, and also tautochronous: release from any height and you arrive together.",
    },
    {
      t: 623, end: 664, title: "Two fields, one problem",
      body: "Bernoulli boasted that he had solved an optical and a mechanical problem at a single stroke. He did not yet know that this was a special case of something much larger.",
    },
    {
      t: 663, end: 744, title: "Maupertuis invents action",
      body: "Forty years later Maupertuis asked why nature should care about time at all, and proposed a deeper quantity: action = mass × velocity × distance. A 5 kg ball rolling 6 m at 3 m/s has 90 units; split the trip into two legs and you simply add them. The path taken is the one with least total action.",
    },
    {
      t: 747, end: 829, title: "Ridiculed, and partly fairly",
      body: "Samuel König accused Maupertuis of plagiarism from Leibniz and wrote a 32-page pamphlet mocking him. The deeper problem: Maupertuis had picked the quantity out of thin air and offered no proof that nature should minimise it.",
    },
    {
      t: 829, end: 913, title: "Euler defends it, then sharpens it",
      body: "Euler replaced the discrete sum with an integral so action could be computed along a continuously curving path, and used it to derive orbits. He also found two conditions Maupertuis had missed: energy must be conserved, and equal across the paths being compared.",
    },
    {
      t: 955, end: 1037, title: "Lagrange, nineteen years old",
      body: "Lagrange shared a refinement of Euler's method in 1754; Euler replied that it raised the theory to the summit of perfection. Five years later, a year after Maupertuis died, Lagrange produced the general proof.",
    },
    {
      t: 1037, end: 1121, title: "Minima by the same trick as calculus",
      body: "At a minimum, a tiny step either way barely changes the value, because the first-order term vanishes. For paths: perturb the true path by η(t), and the change in action is zero to first order. Second order may be positive, so it behaves like a parabola.",
    },
    {
      t: 1121, end: 1203, title: "The trial path and the true path",
      body: "Write the action of the true path y(t) and of a nudged path q(t) = y + η. Subtract, expand, and keep only terms linear in η. The statement that this difference vanishes to first order is the compact form of least action.",
    },
    {
      t: 1203, end: 1326, title: "From mv·ds to ∫(T − V)dt",
      body: "Rewrite Maupertuis's integral: mv ds becomes mv² dt, which is twice the kinetic energy. Using T + V = E and holding the travel time fixed, the E·δt term drops out and what remains is the variation of ∫(T − V)dt being zero.",
    },
    {
      t: 1326, end: 1408, title: "Hamilton gets the name",
      body: "In 1834 William Rowan Hamilton wrote the principle in exactly that form, with L = T − V. So the modern statement is Hamilton's principle even though the idea is Maupertuis's — terminology rewards the final notation.",
    },
    {
      t: 1408, end: 1491, title: "Throw a ball straight up",
      body: "Fix the start, the end and the flight time. Infinitely many curves connect them — higher, lower, wiggly. Only one is physical, and the claim is that it makes ∫(T − V)dt stationary. Expand the trial path in η and require the first-order change to vanish.",
    },
    {
      t: 1491, end: 1573, title: "Integration by parts ends the argument",
      body: "Integrate by parts and the boundary terms vanish because the endpoints are fixed. What is left is an integral of something times η(t) over the whole interval, which must be zero for every η — so that something must itself be zero everywhere.",
    },
    {
      t: 1573, end: 1657, title: "That something is F = ma",
      body: "−dV/dy is force and d²y/dt² is acceleration, so the surviving condition is m a = F. Least action is not a rival to Newton's second law; it is the same law obtained by a different route. Fermat's least time becomes a special case.",
    },
    {
      t: 1656, end: 1738, title: "Why physicists actually use it",
      body: "Write T − V, plug it into the Euler–Lagrange equation, and the equation of motion comes out. No resolving forces or guessing directions. In a double pendulum the lower bob sits in a moving frame, so forces are a mess; energies are scalars and add simply.",
    },
    {
      t: 1738, end: 1821, title: "'Least' is a slight misnomer",
      body: "Setting a derivative to zero finds stationary points, not necessarily minima. The honest name is the principle of stationary action: usually a minimum, sometimes a saddle or maximum, always a point where first-order changes vanish. It also works in polar coordinates, where vector mechanics gets ugly.",
    },
    {
      t: 1821, end: 1866, title: "Action is where quantum mechanics starts",
      body: "Around 1900 the ultraviolet catastrophe was resolved by quantising action, not energy or force — Planck's constant has units of action. The classical principle points directly at the quantum one.",
    },
  ],

  /* --------------------------------------------------------- periodic table */
  kqe9tEcZkno: [
    {
      t: 2, end: 43, title: "150 years, 118 elements",
      body: "2019 was the International Year of the Periodic Table: 150 years since Mendeleev's 1869 publication. The table exists to turn 118 unrelated elements into an ordered system you can reason with.",
    },
    {
      t: 43, end: 85, title: "Mendeleev's groups ran sideways",
      body: "The 1869 table is in Russian, and its families of similar elements run in horizontal rows. He revised the layout later; the vertical-column version is the one everyone now recognises.",
    },
    {
      t: 85, end: 126, title: "One system, many shapes",
      body: "A pre-1869 version wraps around a cylinder; Cambridge built a huge version on a lawn so that order appears only from one viewpoint. A periodic table is defined by its order and grouping, not by its silhouette.",
    },
    {
      t: 246, end: 287, title: "Chemistry needs only three particles",
      body: "Protons in the nucleus, neutrons adding mass, electrons outside. A neutral atom has equal protons and electrons; physicists can smash further into quarks, but chemistry never needs to.",
    },
    {
      t: 287, end: 328, title: "The proton count is the identity card",
      body: "Hydrogen is element one because it has exactly one proton; helium is two. Neutrons change the mass and the isotope, not the chemical identity.",
    },
    {
      t: 328, end: 411, title: "Order is necessary but not sufficient",
      body: "Li 3, Be 4, B 5, C 6, N 7, O 8, F 9, Ne 10: each step adds one proton and one electron. But the 1869 insight was that the columns must also gather elements with matching chemistry.",
    },
    {
      t: 411, end: 452, kind: "article", article: "periodic-group-first",
      title: "Read it by group, not by row",
      body: "The row tells you the size and the proton count; the column tells you the chemistry. This article drills the habit of asking 'which group?' before counting electrons.",
    },
    {
      t: 452, end: 534, title: "One outer electron explains group 1",
      body: "Li, Na, K, Rb and Cs all have a single electron in the outermost shell, and it is easy to lose. That shared loss produces the shared reactions — and why francium, the heaviest, is omitted: its nucleus tears itself apart, emitting an alpha particle that is a helium nucleus.",
    },
    {
      t: 536, end: 618, title: "Count the outer electrons across the block",
      body: "Group 2 carries two, group 13 three, group 14 four, group 15 five, 16 six, 17 halogens seven, 18 noble gases eight. This count — not the row — is the periodic table's main variable.",
    },
    {
      t: 618, end: 700, title: "The halogens will attack almost anything",
      body: "Fluorine was in Mendeleev's table before anyone had isolated it; Davy nearly killed himself trying, and others succeeded fatally. Chlorine is a green-yellow gas, bromine a stinking brown liquid, iodine a violet solid.",
    },
    {
      t: 743, end: 826, title: "Weak bonds, violet cloud",
      body: "Nitrogen triiodide holds N–I bonds so weak that a touch rearranges them into extremely strong N≡N, releasing the energy as a sharp crack. The visible product is iodine vapour — the purple cloud.",
    },
    {
      t: 871, end: 912, title: "Halogen means salt maker",
      body: "Iodine's brown solution is the household disinfectant. The group name comes from the ease with which these elements form salts: sodium plus chlorine gives sodium chloride, ordinary table salt.",
    },
    {
      t: 912, end: 994, title: "The group Mendeleev could not have",
      body: "Every noble gas was discovered after his table, and he dismissed the solar helium suggestion. Argon is the third most abundant gas in air at about 1%, yet chemists missed it for a century because it does nothing.",
    },
    {
      t: 994, end: 1078, title: "Inert because they are complete",
      body: "Helium and neon form no compounds at all; krypton, xenon and radon only with the most aggressive elements. All are gases, and they exist as lone atoms rather than bonded molecules.",
    },
    {
      t: 1159, end: 1240, title: "Equal volumes, equal particles",
      body: "Same volume, pressure and temperature means the same number of particles, whatever the gas. So the helium, neon and xenon balloons hold similar atom counts even though the xenon one is heavy enough to sink the balloon.",
    },
    {
      t: 1286, end: 1328, title: "Transition metals, and two rows in exile",
      body: "The dark blue block holds titanium, iron, copper, gold and mercury. The lanthanides and actinides belong in the main body but are footnoted to the bottom purely so the table fits on a page.",
    },
    {
      t: 1370, end: 1533, title: "The candle test for two balloons",
      body: "Hydrogen travels as H₂ molecules; helium as single atoms. A lit splint extinguishes in helium because it is inert, but pops in hydrogen as H₂ + O₂ makes water — one proton of difference, completely different behaviour.",
    },
    {
      t: 1533, end: 1615, title: "Lavoisier's list contained light",
      body: "His 1789 list of elements includes light and caloric as substances, because they seemed to be released by reactions. He did name hydrogen 'water maker', from the water it forms with oxygen.",
    },
    {
      t: 1653, end: 1776, title: "Burning iron gains mass",
      body: "Heated iron wool reacts with oxygen and gets heavier by the mass of oxygen it takes up — no iron is lost. The early dip is hot air becoming less dense, not matter disappearing.",
    },
    {
      t: 1908, end: 2059, title: "The book that made Faraday",
      body: "Jane Marcet's Conversations on Chemistry went through many editions and inspired a bookbinder's apprentice named Michael Faraday. Her 1806 list still counts potash and soda as elements, because nobody could decompose them.",
    },
    {
      t: 2132, end: 2298, title: "Quicklime and the living rock",
      body: "Calcium oxide poured with water hisses into steam and crumbles into calcium hydroxide. 'Quick' is old English for alive, as in quicksilver — nobody could break lime down further, so it counted as a simple substance.",
    },
    {
      t: 2298, end: 2382, title: "Davy pulls out the metals, Marcet sorts by oxygen",
      body: "Electrolysis of soda gave sodium, and of lime gave calcium, so the next editions listed new elements. With the list growing, Marcet classified substances by how they react with oxygen — the same idea Mendeleev later formalised.",
    },
    {
      t: 2382, end: 2555, title: "Mendeleev prints the oxide formulae",
      body: "His vertical groups carry generalised oxide formulae: E₂O for group 1, EO for group 2, E₂O₃, EO₂ and so on. Lithium burning in oxygen gives Li₂O, exactly the H₂O pattern, and the oxide dissolves to an alkali.",
    },
    {
      t: 2638, end: 2720, title: "Sodium skitters and flames",
      body: "A small piece fizzes across the surface and sometimes ignites; Davy doubted anything this soft and light could be a metal. Every group 1 element except hydrogen reacts with water the same way, giving an alkaline hydroxide and hydrogen gas.",
    },
    {
      t: 2852, end: 2935, title: "The bang is Coulombic, not hydrogen",
      body: "A bigger piece in the armoured tank explodes, and textbooks still blame the hydrogen. High-speed imaging shows the real cause: the metal loses electrons, becomes highly positive, and like charges blow the molten blob apart.",
    },
    {
      t: 2976, end: 3057, title: "Magnesium: white light, 1:1 oxide",
      body: "Group 2 gives MgO rather than Mg₂O, so moving one column changes the formula. Magnesium sinks and barely reacts with cold water, while calcium below it bubbles hydrogen immediately.",
    },
    {
      t: 3230, end: 3437, title: "The gaps were the genius",
      body: "Mendeleev left holes and predicted the missing elements' masses and oxide formulae; that is why his table is celebrated rather than the first one. Eka-boron — Sanskrit for 'one below boron' — became scandium, with predicted weight 44 against an actual 45 and the predicted E₂O₃ confirmed.",
    },
    {
      t: 3437, end: 3521, title: "Aluminium's oxide armour",
      body: "Aluminium foil does not burst into flame because a thin Al₂O₃ layer seals the metal. Same E₂O₃ formula as scandium oxide, so the group pattern holds even when the reaction is invisible.",
    },
    {
      t: 3521, end: 3603, title: "Thermite: steal the oxygen",
      body: "Aluminium powder plus iron oxide reacts violently, leaving aluminium oxide and molten iron. The reaction is hot enough to weld railway track in places where you cannot bring a furnace.",
    },
    {
      t: 3681, end: 3972, title: "Carbon, phosphorus, sulphur: acids appear",
      body: "Charcoal in oxygen gives CO₂, a weak acid in water. Phosphorus ('light bringer') gives P₄O₁₀ and phosphoric acid, sulphur ('brimstone') burns blue and gives SO₂/SO₃, and the oxide trend keeps climbing toward the dangerous group 7 and 8 oxides.",
    },
    {
      t: 4021, end: 4189, title: "Why metals hold together",
      body: "Outer electrons sit between neighbouring nuclei and glue them. Lithium contributes one per atom, beryllium two, boron three, carbon four — so the bonds strengthen across the row.",
    },
    {
      t: 4189, end: 4311, title: "Diamond is the sweet spot",
      body: "Four bonds per carbon give the highest melting point of any element, with tungsten the only rival; the rigid lattice also makes diamond the hardest substance and the best heat conductor, slicing ice with body heat.",
    },
    {
      t: 4437, end: 4518, title: "Antibonding explains the noble gases",
      body: "Past carbon the extra electrons go outside the nuclei and pull atoms apart, so N, O and F bond more weakly. Neon has equal bonding and antibonding electrons, net zero — hence lone atoms, and the same pattern repeats in every row.",
    },
    {
      t: 4604, end: 4690, title: "The potassium mirror",
      body: "Heat potassium in an evacuated flask and atoms boil off and condense as a silvery coating. Group 1 bonds are weak enough that gentle heating separates the atoms — the mirror darkens as oxygen leaks in.",
    },
    {
      t: 4816, end: 4900, title: "Density is mass plus packing",
      body: "Osmium and iridium are the densest because heavy atoms sit close together; past tungsten the packing loosens and density falls. Tungsten and gold end up almost identical, which is the next problem.",
    },
    {
      t: 5021, end: 5062, title: "Why faked gold bars pass",
      body: "A tungsten core has the same density as gold, so weight and X-rays cannot expose it — only cutting into the bar can. The lecture closes with one more hydrogen balloon, the most abundant element in the universe.",
    },
  ],
};
