/**
 * Chemistry top-up — the subject sat at 38 questions. Five per thin topic
 * across all nine topics.
 */
const e = (topic, stem, opts, ans, expl, f = false, d = 2) => ({ topic, stem, opts, ans, expl, f, d, steps: null });

export const singles = [
  /* ---- separation ---- */
  e("separation", "A mixture of sand and common salt is best separated by", ["filtration only", "dissolving in water, filtration, then evaporation", "sublimation", "magnetic separation"], "B", "Salt dissolves, sand does not — filter the solution, then evaporate to recover the salt.", true),
  e("separation", "Separating two miscible liquids with close boiling points requires", ["simple distillation", "fractional distillation", "decantation", "evaporation"], "B", "The fractionating column provides repeated condensations to split close boiling points."),
  e("separation", "Iodine can be recovered from a mixture with sand by", ["filtration", "sublimation", "winnowing", "decantation"], "B", "Iodine sublimes on heating and crystallises back on the cold surface."),
  e("separation", "The separating funnel is used to separate", ["miscible liquids", "immiscible liquids", "solids from solids", "gases"], "B", "Oil and water form layers; the tap lets the denser layer run off first."),
  e("separation", "A solute is recovered from a solution more gently by", ["evaporation to dryness", "crystallisation", "distilling the solute", "decanting"], "B", "Crystallisation avoids heat damage and gives pure, well-formed crystals."),

  /* ---- atomic structure ---- */
  e("atomic-structure", "The number of neutrons in ²³Na (Z = 11) is", ["11", "12", "23", "34"], "B", "N = A − Z = 23 − 11 = 12.", true),
  e("atomic-structure", "Isotopes of an element differ in their", ["proton number", "number of neutrons", "electronic configuration", "chemical properties"], "B", "Same protons, different neutrons — chemistry is set by electrons, so it barely changes."),
  e("atomic-structure", "The maximum number of electrons in the M shell (n = 3) is", ["8", "18", "2", "32"], "B", "2n² = 2 × 9 = 18, though the octet discussion applies to valence behaviour."),
  e("atomic-structure", "An atom is electrically neutral because", ["protons and neutrons cancel", "it has equal numbers of protons and electrons", "electrons have no charge", "neutrons balance everything"], "B", "Equal + and − charges: neutrality is bookkeeping, not physics."),
  e("atomic-structure", "The sub-atomic particle with negligible mass is the", ["proton", "neutron", "electron", "nucleon"], "C", "The electron's mass is ~1/1836 of a proton's — negligible in atomic-mass terms."),

  /* ---- periodicity & bonding ---- */
  e("periodicity-bonding", "Elements in the same group of the periodic table have the same", ["atomic mass", "number of outer (valence) electrons", "number of shells", "density"], "B", "Valence electrons set the chemistry — that's why group members behave alike.", true),
  e("periodicity-bonding", "Across a period from left to right, atomic radius", ["increases", "decreases", "stays constant", "doubles"], "B", "Nuclear charge grows while shells stay the same, pulling electrons closer."),
  e("periodicity-bonding", "The bond formed when magnesium reacts with oxygen is", ["covalent", "ionic", "metallic", "hydrogen"], "B", "A metal transfers electrons to a non-metal: Mg²⁺ and O²⁻ — ionic."),
  e("periodicity-bonding", "Which compound has a giant covalent structure?", ["sodium chloride", "diamond", "water", "ammonia"], "B", "Diamond is one lattice of carbon atoms covalently bonded throughout — hence its hardness."),
  e("periodicity-bonding", "The most electronegative element is", ["oxygen", "fluorine", "chlorine", "nitrogen"], "B", "Fluorine tops the scale — it pulls electron density hardest."),

  /* ---- stoichiometry ---- */
  e("stoichiometry", "The molar mass of CaCO₃ (Ca = 40, C = 12, O = 16) is", ["80 g/mol", "100 g/mol", "120 g/mol", "48 g/mol"], "B", "40 + 12 + (3 × 16) = 100 g/mol.", true),
  e("stoichiometry", "How many moles are in 9.8 g of H₂SO₄ (M = 98 g/mol)?", ["0.1 mol", "0.2 mol", "1 mol", "0.5 mol"], "A", "n = m/M = 9.8/98 = 0.1 mol."),
  e("stoichiometry", "In the reaction 2H₂ + O₂ → 2H₂O, 4 g of hydrogen (M = 2) burns in excess oxygen to give water with mass", ["36 g", "18 g", "72 g", "4 g"], "A", "2 mol H₂ → 2 mol H₂O: 2 mol × 18 g/mol = 36 g."),
  e("stoichiometry", "The volume of 0.25 mol of gas at s.t.p. (22.4 dm³/mol) is", ["5.6 dm³", "11.2 dm³", "22.4 dm³", "2.24 dm³"], "A", "0.25 × 22.4 = 5.6 dm³."),
  e("stoichiometry", "Avogadro's number of particles is closest to", ["6.02 × 10²³", "6.02 × 10⁻²³", "3.0 × 10⁸", "1.6 × 10⁻¹⁹"], "A", "One mole of anything carries 6.02 × 10²³ particles."),

  /* ---- acids & bases ---- */
  e("acids-bases", "The pH of a 0.01 mol/dm³ strong acid solution (fully ionised) is", ["1", "2", "12", "7"], "B", "[H⁺] = 10⁻² → pH = 2.", true),
  e("acids-bases", "A solution with pH 9 is", ["strongly acidic", "weakly basic", "neutral", "strongly basic"], "B", "Above 7 means basic; 9 is mildly alkaline."),
  e("acids-bases", "Which pair reacts to give a salt and water only?", ["acid + metal", "acid + alkali", "acid + carbonate", "acid + sulphur dioxide"], "B", "Neutralisation: H⁺ + OH⁻ → H₂O leaves the salt behind."),
  e("acids-bases", "A base that is soluble in water is called", ["an oxide", "an alkali", "a salt", "an anhydride"], "B", "All alkalis are bases, but only soluble ones earn the name."),
  e("acids-bases", "Methyl orange in a basic solution turns", ["red", "yellow", "pink", "colourless"], "B", "Methyl orange is red below pH ~3 and yellow above ~4.4 — basic means yellow."),

  /* ---- redox & electrolysis ---- */
  e("redox-electrochem", "Oxidation is defined as", ["gain of electrons", "loss of electrons", "gain of protons", "loss of neutrons"], "B", "OIL RIG: Oxidation Is Loss, Reduction Is Gain — of electrons.", true),
  e("redox-electrochem", "In Zn + CuSO₄ → ZnSO₄ + Cu, the species oxidised is", ["Cu²⁺", "Zn", "SO₄²⁻", "Cu"], "B", "Zn loses electrons to become Zn²⁺ — the reducing agent that is itself oxidised."),
  e("redox-electrochem", "During the electrolysis of molten NaCl, the cathode reaction is", ["2Cl⁻ → Cl₂ + 2e⁻", "Na⁺ + e⁻ → Na", "Na → Na⁺ + e⁻", "H₂O → H⁺ + OH⁻"], "B", "Reduction happens at the cathode: molten Na⁺ gains an electron to become sodium metal."),
  e("redox-electrochem", "To deposit 1 mole of silver (Ag⁺ + e⁻ → Ag) requires a charge of", ["96,500 C", "48,250 C", "193,000 C", "1,600 C"], "A", "One mole of electrons = 1 faraday = 96,500 C for a 1-electron change."),
  e("redox-electrochem", "The oxidation number of sulphur in H₂SO₄ is", ["+4", "+6", "−2", "+2"], "B", "2(+1) + S + 4(−2) = 0 → S = +6."),

  /* ---- rates & equilibrium ---- */
  e("rates-equilibrium", "Increasing temperature increases reaction rate mainly because", ["particles get bigger", "more particles possess the activation energy and collide more often", "the activation energy rises", "concentration falls"], "B", "The distribution shifts: more successful collisions per second.", true),
  e("rates-equilibrium", "A catalyst speeds up a reaction by", ["raising the temperature", "providing a lower-energy pathway", "increasing concentration", "changing the products"], "B", "Same start and end, lower activation energy — equilibrium is reached faster, not shifted."),
  e("rates-equilibrium", "For the equilibrium N₂ + 3H₂ ⇌ 2NH₃, increasing the pressure shifts the position", ["to the left", "to the right (fewer gas molecules)", "no change", "depends on catalyst"], "B", "Le Chatelier: 4 moles of gas → 2 moles, so pressure favours the ammonia side."),
  e("rates-equilibrium", "Increasing the concentration of a reactant increases rate because", ["activation energy drops", "collisions become more frequent", "particles move faster", "the mixture heats"], "B", "More particles per volume means more collisions per second."),
  e("rates-equilibrium", "At equilibrium for a reversible reaction, the", ["forward reaction stops", "rate forward equals rate backward", "concentrations are equal", "reaction becomes exothermic"], "B", "Dynamic equilibrium: both directions continue at matching rates."),

  /* ---- metals & non-metals ---- */
  e("metals-nonmetals", "Which metal is stored under kerosene to prevent oxidation?", ["copper", "sodium", "zinc", "lead"], "B", "Sodium attacks water and air so violently that oil storage is the safe default.", true),
  e("metals-nonmetals", "Iron rusts fastest in the presence of", ["dry air", "air and water", "pure water only", "oil"], "B", "Both oxygen and moisture are needed — salt accelerates it further."),
  e("metals-nonmetals", "The ore of aluminium is", ["haematite", "bauxite", "galena", "cassiterite"], "B", "Bauxite is Al₂O₃·2H₂O, purified before electrolysis in molten cryolite."),
  e("metals-nonmetals", "Which non-metal is a good conductor of electricity?", ["sulphur", "graphite (carbon)", "phosphorus", "iodine"], "B", "Graphite conducts along its delocalised electron layers — the exception among non-metals."),
  e("metals-nonmetals", "Aluminium resists corrosion because", ["it is unreactive", "it forms a protective oxide layer", "it is a poor conductor", "it is heavy"], "B", "The thin Al₂O₃ skin seals the metal from air — passivation."),

  /* ---- organic ---- */
  e("organic", "The general molecular formula of the alkanes is", ["CnH2n", "CnH2n+2", "CnH2n−2", "CnHn"], "B", "Saturated chain hydrocarbons: methane CH₄, ethane C₂H₆ …", true),
  e("organic", "The reaction CH₄ + Cl₂ → CH₃Cl + HCl is an example of", ["addition", "substitution", "polymerisation", "oxidation"], "B", "A hydrogen is replaced by chlorine — hallmark of saturated compounds."),
  e("organic", "Ethene decolourises bromine water because it undergoes", ["substitution", "addition across the double bond", "combustion", "polymerisation"], "B", "The C=C double bond opens and takes bromine on — saturation test."),
  e("organic", "Ethanol can be prepared in the laboratory by fermenting", ["starch solution with yeast then distilling", "ethene with water only", "ethane with steam", "oil with sodium"], "A", "Zymase converts glucose to ethanol and CO₂; distillation collects the spirit."),
  e("organic", "The IUPAC name of CH₃CH₂COOH is", ["ethanoic acid", "propanoic acid", "propanal", "propanol"], "B", "Three carbons including the carboxyl carbon → propanoic acid."),
];
