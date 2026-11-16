/**
 * Biology top-up — 40 questions, weighted toward the thin topics
 * (genetics with punnett practice, evolution, excretion-nerve, reproduction).
 */
const e = (topic, stem, opts, ans, expl, f = false, d = 2) => ({ topic, stem, opts, ans, expl, f, d, steps: null });

export const singles = [
  /* ---- genetics (companion to the new punnett sim) ---- */
  e("genetics", "In a cross Tt × Tt (T = tall dominant), the expected ratio of tall to short offspring is", ["1:1", "3:1", "1:2:1", "9:3:3:1"], "B", "TT, Tt, Tt, tt — three tall to one short. The 1:2:1 is the genotype ratio beneath it.", true),
  e("genetics", "A cross between a homozygous dominant and a homozygous recessive parent gives offspring that are", ["all homozygous dominant", "all heterozygous", "half recessive", "a 3:1 mixture"], "B", "Every child receives one dominant and one recessive allele — all carriers of the F₁."),
  e("genetics", "The physical appearance produced by a genotype is the", ["phenotype", "genome", "allele", "karyotype"], "A", "Genotype is the recipe; phenotype is what you actually see."),
  e("genetics", "Sex determination in humans: the father's gamete decides the child's sex because", ["mothers carry XY", "the father contributes either an X or a Y chromosome", "eggs carry Y chromosomes", "the mother's chromosomes are identical"], "B", "All eggs are X; sperm are X or Y — XX female, XY male."),
  e("genetics", "Two carriers of a recessive disorder (Aa × Aa) have what chance of an affected child?", ["0%", "25%", "50%", "75%"], "B", "Only aa is affected: one of four combinations.", true),
  e("genetics", "Incomplete dominance is best shown by", ["a 3:1 ratio of tall to short", "red × white snapdragons giving pink offspring", "blood groups A, B, AB, O", "colour blindness"], "B", "The heterozygote shows a blended phenotype — neither allele is fully dominant."),
  e("genetics", "Co-dominance in human blood groups is seen in genotype", ["IAi", "IAIB", "ii", "IBIB"], "B", "AB blood expresses both A and B antigens equally — neither masks the other."),
  e("genetics", "Test cross of a dominant-phenotype unknown with a homozygous recessive gives all dominant offspring. The unknown was", ["heterozygous", "homozygous dominant", "homozygous recessive", "a mutant"], "B", "Any heterozygote would give half recessives — all-dominant means pure bred."),

  /* ---- evolution ---- */
  e("evolution", "Natural selection acts directly on", ["genotypes", "phenotypes", "organelles", "species as wholes"], "B", "Selection sees and favours observable traits; the underlying alleles ride along.", true),
  e("evolution", "Darwin's finches on the Galápagos illustrate", ["convergent evolution", "adaptive radiation from a common ancestor", "genetic drift only", "artificial selection"], "B", "One lineage spread into beak shapes matching each island's food source."),
  e("evolution", "Structures homologous in different species indicate", ["common ancestry", "random creation", "convergent evolution", "recent mutation"], "A", "Same bone plan, different functions — inherited from a shared forebear."),
  e("evolution", "The evolution of resistant bacteria after antibiotic use is an example of", ["natural selection", "genetic drift", "speciation", "artificial selection"], "A", "The drug applies selection pressure; only resistant cells survive to reproduce."),
  e("evolution", "Mutations supply evolution with", ["selection pressure", "new genetic variation", "fitness", "speciation directly"], "B", "Without mutation and recombination there would be nothing for selection to choose from."),
  e("evolution", "Industrial melanism in peppered moths demonstrated selection by", ["predation pressure matching colour to environment", "food availability", "climate alone", "genetic drift"], "A", "Dark moths survived on soot-darkened trees — camouflage is a survival trait."),

  /* ---- excretion & nervous coordination ---- */
  e("excretion-nerve", "The functional unit of the kidney is the", ["neuron", "nephron", "alveolus", "villus"], "B", "About a million nephrons filter, reabsorb and secrete to make urine.", true),
  e("excretion-nerve", "Which substance is normally NOT found in urine?", ["urea", "salts", "glucose", "water"], "C", "Healthy kidneys reabsorb all the glucose — sugar in urine signals diabetes."),
  e("excretion-nerve", "Ultrafiltration in the nephron occurs in the", ["loop of Henlé", "Bowman's capsule (glomerulus)", "collecting duct", "ureter"], "B", "Blood pressure squeezes water and small solutes out of the glomerulus into the capsule."),
  e("excretion-nerve", "The gap between two adjacent neurons is the", ["axon", "synapse", "dendrite", "myelin sheath"], "B", "Neurotransmitters cross the synaptic cleft to pass the signal on."),
  e("excretion-nerve", "The part of the brain controlling balance and posture is the", ["cerebrum", "cerebellum", "medulla", "hypothalamus"], "B", "The cerebellum fine-tunes movement and keeps you upright."),
  e("excretion-nerve", "Reflex actions are processed in the", ["cerebral cortex", "spinal cord", "cerebellum", "retina"], "B", "Spinal reflex arcs bypass the brain for speed — you pull back before you consciously feel it."),

  /* ---- cellular processes ---- */
  e("cellular-processes", "Aerobic respiration releases energy from glucose and produces", ["lactic acid", "CO₂ and water", "alcohol", "oxygen"], "B", "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy — the complete burn.", true),
  e("cellular-processes", "Photosynthesis mainly takes place in the", ["mitochondria", "chloroplasts", "nucleus", "ribosomes"], "B", "Chlorophyll in the chloroplast traps the light energy."),
  e("cellular-processes", "Enzymes are described as specific because", ["they work at any temperature", "each catalyses one type of reaction due to its active-site shape", "they are proteins only", "they denature easily"], "B", "Lock-and-key: substrate shape must fit the active site."),
  e("cellular-processes", "Anaerobic respiration in yeast produces", ["lactic acid", "ethanol and CO₂", "only CO₂", "water and oxygen"], "B", "Fermentation — the basis of brewing; oxygen is absent."),
  e("cellular-processes", "Osmosis is the movement of water", ["from low to high solute concentration through a semi-permeable membrane", "from high to low water potential", "against a gradient using energy", "of solute particles"], "A", "Water moves toward the more concentrated solution — no energy needed."),
  e("cellular-processes", "Diffusion rate increases when", ["temperature falls", "the gradient is steeper and particles are smaller", "the membrane thickens", "the path lengthens"], "B", "Steep gradient, short distance, warm conditions — all speed diffusion."),

  /* ---- reproduction ---- */
  e("reproduction", "In flowering plants, the male gametes are contained in the", ["ovule", "pollen grain", "stigma", "sepal"], "B", "Pollen carries the sperm nuclei to the stigma.", true),
  e("reproduction", "Fertilisation in humans normally occurs in the", ["uterus", "oviduct (fallopian tube)", "ovary", "vagina"], "B", "Sperm meets the egg in the oviduct before implantation in the uterus."),
  e("reproduction", "The placenta functions to", ["protect the fetus physically only", "exchange nutrients, gases and wastes between mother and fetus", "produce eggs", "store urine"], "B", "Two circulations meet close but never mix — exchange happens across the barrier."),
  e("reproduction", "Which structure in the flower receives pollen?", ["anther", "stigma", "ovary", "filament"], "B", "The sticky stigma at the top of the style catches pollen."),
  e("reproduction", "Menstruation is triggered by", ["fertilisation", "falling levels of progesterone and oestrogen", "rising testosterone", "implantation"], "B", "Without implantation the corpus luteum dies, hormones fall, and the lining sheds."),

  /* ---- systems ---- */
  e("systems", "Bile is produced by the liver and stored in the", ["pancreas", "gall bladder", "stomach", "duodenum wall"], "B", "It emulsifies fats into droplets for lipase to attack.", true),
  e("systems", "Which blood vessel carries oxygenated blood from the lungs to the heart?", ["pulmonary artery", "pulmonary vein", "aorta", "vena cava"], "B", "The pulmonary vein is the exception — veins here carry oxygen-rich blood."),
  e("systems", "Digestion of starch begins in the", ["stomach", "mouth", "small intestine", "large intestine"], "B", "Salivary amylase starts breaking starch while chewing."),
  e("systems", "The wall of the left ventricle is thicker than the right because it", ["stores more blood", "pumps blood around the whole body at higher pressure", "receives more blood", "is older"], "B", "Systemic circulation needs the pressure; the right ventricle only reaches the lungs."),
  e("systems", "Villi in the small intestine increase", ["digestion speed only", "surface area for absorption", "enzyme production", "blood pH"], "B", "Folded surfaces plus microvilli give a huge absorptive area."),

  /* ---- cell structure & ecology ---- */
  e("cell-structure", "Which organelle releases most of the cell's energy as ATP?", ["ribosome", "mitochondrion", "nucleus", "vacuole"], "B", "The powerhouse: aerobic respiration completes here.", true),
  e("cell-structure", "Plant cells differ from animal cells in possessing", ["nucleus and membrane", "cell wall, chloroplasts and a large vacuole", "mitochondria", "ribosomes"], "B", "Those three give shape, photosynthesis and turgor."),
  e("ecology", "In a food chain, energy transfer between trophic levels is roughly", ["100%", "50%", "10%", "1%"], "C", "Most energy is lost to respiration and heat — hence short chains.", true),
  e("ecology", "The organisms that break down dead matter and recycle nutrients are", ["producers", "primary consumers", "decomposers", "predators"], "C", "Bacteria and fungi close the nutrient loop back to the soil."),
];
