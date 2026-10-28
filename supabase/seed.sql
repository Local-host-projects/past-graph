-- Past Graph — catalog seed (run after schema.sql)
-- Sources: official JAMB syllabus structure, reconstructed UTME-style questions,
-- timestamped Khan Academy / Organic Chemistry Tutor / Tyler DeWitt / Amoeba Sisters videos,
-- and JAMB brochure subject-combination data (JambKit 2025 guide).

-- ------------------------------------------------------------------ subjects
insert into public.subjects (slug, name, blurb, color) values
('physics','Physics','Motion, electricity, waves and the questions that repeat every few years.','#0071e3'),
('chemistry','Chemistry','From separation techniques to organic mechanisms, distilled into exam patterns.','#34c759'),
('biology','Biology','Cells, systems, genetics and ecology — the most predictable JAMB science.','#30b0c7'),
('mathematics','Mathematics','Algebra, geometry, calculus and the arithmetic traps that eat marks.','#5e5ce6'),
('english','English Language','Lexis, structure, comprehension and oral forms — every candidate sits it.','#ff9500');

-- ------------------------------------------------------------------ topics
insert into public.topics (slug, subject_slug, name, blurb) values
('measurement','physics','Measurement & Units','SI units, dimensions, vernier callipers, errors.'),
('kinematics','physics','Kinematics & Projectiles','Motion in a straight line, graphs, projectiles.'),
('dynamics','physics','Forces & Newton''s Laws','Friction, momentum, collisions, circular motion.'),
('work-energy','physics','Work, Energy & Power','Conservation, machines, efficiency.'),
('fluids-heat','physics','Fluids & Heat','Archimedes, gas laws, expansion, latent heat.'),
('waves-sound','physics','Waves & Sound','Wave equation, strings, pipes, Doppler, resonance.'),
('light-optics','physics','Light & Optics','Reflection, refraction, mirrors, lenses, instruments.'),
('electricity','physics','Electricity','Charge, fields, current, resistance, cells, circuits.'),
('magnetism','physics','Magnetism & Electronics','Fields, induction, transformers, semiconductors.'),
('modern-physics','physics','Modern Physics','Photoelectric effect, atomic models, radioactivity.'),
('separation','chemistry','Separation Techniques','Filtration, distillation, chromatography, purity.'),
('atomic-structure','chemistry','Atomic Structure','Subatomic particles, isotopes, electron configuration.'),
('periodicity-bonding','chemistry','Periodicity & Bonding','Groups, trends, ionic/covalent/metallic bonding.'),
('stoichiometry','chemistry','Stoichiometry & Gas Laws','Moles, equations, limiting reagents, gas laws.'),
('acids-bases','chemistry','Acids, Bases & Salts','pH, neutralisation, hydrolysis, solubility.'),
('redox-electrochem','chemistry','Redox & Electrochemistry','Oxidation numbers, electrolysis, cells.'),
('rates-equilibrium','chemistry','Rates & Equilibrium','Collision theory, Le Chatelier, catalysts.'),
('metals-nonmetals','chemistry','Metals & Non-metals','Extraction, reactivity, properties, uses.'),
('organic','chemistry','Organic Chemistry','Hydrocarbons, alkanols, isomerism, polymers.'),
('cell-structure','biology','Cell Structure','Organelles, plant vs animal, microscopy.'),
('cellular-processes','biology','Cellular Processes','Photosynthesis, respiration, enzymes, transport.'),
('ecology','biology','Ecology','Food chains, nutrient cycles, populations.'),
('genetics','biology','Genetics & Heredity','Mendelian ratios, DNA, variation, blood groups.'),
('evolution','biology','Evolution & Adaptation','Natural selection, evidence, speciation.'),
('systems','biology','Nutrition, Circulation & Respiration','Digestion, blood, gas exchange.'),
('reproduction','biology','Reproduction & Growth','Flowers, gametes, development, hormones.'),
('excretion-nerve','biology','Excretion & Coordination','Kidneys, nerves, hormones, homeostasis.'),
('number-surds','mathematics','Number & Surds','Fractions, indices, surds, standard form.'),
('quadratics','mathematics','Quadratics & Polynomials','Factorising, formula, roots, graphs.'),
('indices-logs','mathematics','Indices & Logarithms','Laws, equations, change of base.'),
('progressions','mathematics','Sequences & Series','AP, GP, sums, applications.'),
('trigonometry','mathematics','Trigonometry','Ratios, identities, sine/cosine rules.'),
('calculus','mathematics','Differentiation & Integration','Limits, gradients, areas under curves.'),
('statistics','mathematics','Statistics & Probability','Mean, median, spread, basic probability.'),
('geometry','mathematics','Geometry & Mensuration','Angles, circles, areas, volumes.'),
('lexis-structure','english','Lexis & Structure','Concord, tenses, prepositions, word classes.'),
('comprehension','english','Comprehension','Main idea, inference, tone, vocabulary in context.'),
('oral-forms','english','Oral Forms','Vowels, stress, intonation, rhymes.'),
('antonyms-synonyms','english','Antonyms & Synonyms','Opposites, near-equivalents, register.'),
('novel','english','Prescribed Novel','Sweet Sixteen (2019–2021) and The Life Changer (2022–2025).');

-- ------------------------------------------------------------------ sims
insert into public.sims (slug, topic_slug, title, blurb, kind) values
('projectile-motion','kinematics','Projectile motion','Set launch speed, angle and gravity. Watch range, apex and flight time re-plot instantly.','projectile'),
('wave-motion','waves-sound','Wave motion','Amplitude and frequency, live. See why period is the reciprocal of frequency.','wave'),
('ohms-law','electricity','Ohm''s law & brightness','Change voltage and resistance — current and lamp brightness respond together.','ohm');

-- ------------------------------------------------------------------ articles
insert into public.articles (slug, subject_slug, topic_slug, title, summary, body, read_min) values
('projectile-two-stories','physics','kinematics','Projectile motion is two separate stories',
 'Horizontal and vertical motion never talk to each other — that is exactly why projectile questions are solvable.',
 $b$A projectile is not one motion. It is two motions that happen to share a clock. Horizontally, nothing pushes the ball after launch, so velocity stays constant (if we ignore air resistance). Vertically, gravity acts the whole time, so velocity changes by 10 m/s every second, downward.

## Why splitting works
Because the horizontal and vertical components are independent, you can solve one direction without knowing the answer to the other. Time is the only variable they share. That single fact turns most projectile questions into two short calculations instead of one intimidating one.

At the top of the flight, the vertical velocity is zero — but the horizontal velocity is not. This is the misconception that costs the most marks: students mark the whole velocity as zero at maximum height. Only $v_y$ vanishes there.

## The three formulas worth memorising
- Time of flight: $T = 2u\sin\theta / g$ for level ground.
- Range: $R = u^2\sin 2\theta / g$, maximum at 45°.
- Maximum height: $H = u^2\sin^2\theta / 2g$.

Use the simulation beside this article. Set gravity to 10 and launch at 45°, then nudge the angle up and down by five degrees. The range changes asymmetrically around 45° — that symmetry is your fastest check in an exam.

## What JAMB actually tests
Usually the range or the time, wrapped in a story about a ball, a bullet or a stone. Occasionally they ask for the velocity at a point, in which case resolve into components and recombine with Pythagoras. Rarely — but memorably — they ask why the horizontal velocity is unchanged. The answer is always: no horizontal force.$b$, 5),
('terminal-voltage','physics','electricity','Why internal resistance eats your terminal voltage',
 'The e.m.f. is what the cell promises. The terminal p.d. is what you actually get. The difference is internal resistance.',
 $b$A cell has an electromotive force (e.m.f.), $E$. That is the energy per unit charge it can supply in principle. But every real cell also has internal resistance, $r$, and current flowing through it drops voltage you never get to use.

## The one equation
$V = E - Ir$. Terminal voltage equals e.m.f. minus the internal drop. With no current (open circuit), $V = E$. As current rises, terminal voltage falls.

This is why a torch dims when you add more bulbs in parallel: total resistance falls, current rises, the internal drop rises, and the terminal voltage sags. It is also why a dead battery can read near its rated voltage on a multimeter but collapse the moment it drives a load.

## Exam patterns
- Given $E$, $r$ and an external $R$: find current with $I = E/(R+r)$, then terminal voltage with $E - Ir$.
- Given terminal voltage and current: rearrange to find $r$.
- Graph questions: plotting $V$ against $I$ gives intercept $E$ and gradient $-r$.

## Check yourself
If $E = 12\,\text{V}$, $r = 0.5\,\Omega$ and $R = 5.5\,\Omega$, the current is $2\,\text{A}$ and the terminal voltage is $11\,\text{V}$. If you answered $12\,\text{V}$, you used the e.m.f. — the classic trap. Try the Ohm's law simulation and watch brightness track the *terminal* voltage, not the source.$b$, 4),
('mole-bridge','chemistry','stoichiometry','The mole is a bridge, not a mystery',
 'You cannot see moles and you never need to. You only need the bridge between grams, particles and litres.',
 $b$The mole is not a substance; it is a counting unit, like a dozen. One mole is $6.02 \times 10^{23}$ particles. That number exists so that atomic masses in grams become practically countable.

## The three planks of the bridge
- Mass ↔ mole: divide by molar mass to go in, multiply to come out.
- Particles ↔ mole: use Avogadro's constant.
- Gas volume ↔ mole: at s.t.p., one mole occupies $22.4\,\text{dm}^3$.

Every stoichiometry question is a walk across two of these planks, using the balanced equation as the timetable. The equation tells you the ratio of moles, never the ratio of grams.

## The limiting reagent trap
When amounts of two reactants are given, one runs out first. Convert both to moles, divide each by its coefficient in the balance, and the smaller number is the limiting reagent. Everything else is calculated from it. Students often skip this step and simply use the larger number because it "looks stronger".

## A worked pattern
How many grams of water form when 4 g of hydrogen burns in excess oxygen? $2H_2 + O_2 \rightarrow 2H_2O$. Hydrogen: $4/2 = 2$ mol. Ratio 2:2, so water is 2 mol. Water weighs $18\,\text{g/mol}$, so 36 g. Notice every step crossed one plank at a time.

## What earns marks
JAMB rarely awards the final number alone; the working lines carry the marks. Write the balanced equation, convert to moles, apply the ratio, then convert back. Rushing the balance is where most candidates lose the question before the arithmetic even starts.$b$, 5),
('periodic-group-first','chemistry','periodicity-bonding','Read the periodic table by group, not by row',
 'Periodic trends are group behaviour, not memorised lists. Learn the direction and you can derive the fact.',
 $b$Most students memorise isolated facts: sodium is reactive, chlorine is a gas, argon is inert. That approach collapses under exam pressure because there are too many facts. The periodic table is a set of gradients — learn the gradients and the facts regenerate.

## Four gradients that cover most questions
- Atomic radius decreases across a period and increases down a group.
- Ionisation energy increases across a period and decreases down a group.
- Electronegativity follows the same direction as ionisation energy.
- Metallic character does the opposite: it increases down and decreases across.

Everything follows from two ideas: nuclear charge pulls electrons inward, and extra shells push the outer electrons further out. When a question asks you to compare two elements, locate them relative to each other and apply both ideas.

## Bonding as a consequence
Ionic bonding is most likely where electronegativity difference is large: a metal from the left meeting a non-metal from the right. Covalent bonding sits in the middle. Giant covalent structures like diamond explain the extreme hardness and very high melting point that discrete molecules cannot.

## The noble-gas exception
Group 8 elements are unreactive not because they are "special" but because their outer shell is satisfied. Their ionisation energies are the highest in their periods. That single fact explains why they form so few compounds — and why examiners use them as the control case in trend questions.

## Practice move
When you meet an unfamiliar comparison, draw the two elements on a rough outline of the table and state the two competing effects out loud. If you can explain the direction, you will not need to remember the fact.$b$, 4),
('mitosis-bookkeeping','biology','cellular-processes','Mitosis vs meiosis: the chromosome bookkeeping',
 'Both divide a cell. Only one halves the chromosome number. Keep the bookkeeping straight and the rest follows.',
 $b$Mitosis and meiosis are often memorised as two lists of phases. That misses the point: they exist for different biological jobs, and the chromosome arithmetic explains both.

## The arithmetic
In mitosis, one diploid cell ($2n$) produces two diploid cells identical to the parent. Chromosomes replicate once, divide once. Growth, repair and asexual reproduction use this.

In meiosis, one diploid cell produces four haploid cells ($n$). Chromosomes replicate once but the nucleus divides twice. Gametes use this, so that fertilisation restores the diploid number.

## Where variation enters
Meiosis introduces variation in two places: crossing over during prophase I, and independent assortment of homologous chromosomes during metaphase I. These two events explain why siblings are not identical. Mitosis has neither, which is exactly why identical twins are possible.

## The classic exam question
"How many chromosomes are in the gamete of an organism with 46 chromosomes?" The answer is 23 — but the reasoning is what matters: meiosis halves the number. If the question instead asks about a cell after mitosis, the number stays 46.

## Mistakes to avoid
- Do not say meiosis produces two cells. It produces four.
- Do not confuse homologous chromosomes separating (meiosis I) with sister chromatids separating (meiosis II and mitosis).
- Do not claim crossing over happens in mitosis. It does not, in the normal case.

Draw the two processes side by side with the chromosome number written at every step. Once the numbers are visible, the phases stop being arbitrary labels.$b$, 5),
('concord-find-subject','english','lexis-structure','Concord: find the subject before you pick the verb',
 'Almost every concord error is a subject-identification error wearing a verb costume.',
 $b$Concord means agreement between subject and verb in number and person. Candidates lose marks here not because the rule is hard, but because the subject is buried in a long phrase.

## The core move
Before you choose the verb, draw a box around the subject. Everything between the subject and the verb is a distractor, even when it contains a plural noun.

- "The quality of the students' essays **is** improving." The subject is quality, not essays.
- "Each of the candidates **has** paid." Each is singular, whatever follows.

## The rules that recur most
- Two subjects joined by *and* take a plural verb — unless they form one idea ("bread and butter **is** enough").
- *Either… or* and *neither… nor* agree with the nearer subject.
- Collective nouns (team, government, family) take a singular verb when acting as one unit.
- Words like *each, everyone, nobody, neither* are singular.
- "A number of" takes plural; "the number of" takes singular.

## Why this is an English question and not a maths question
Examiners are testing whether you can see structure beneath meaning. A sentence can *mean* many students while its grammatical subject is singular. Grammar follows form, not reality.

## A 20-second exam routine
Underline the main verb, then find its subject by asking "who or what is doing this?" If a prepositional phrase sits between them, cross it out mentally and read the sentence again. Then check whether the subject is singular, plural, or a special case.

Practice with the concord video in the video index — it is timestamped to the exact rules you will meet in UTME sentences.$b$, 4),
('factor-first','mathematics','quadratics','Quadratics: factorise first, formula second',
 'The quadratic formula always works, which is exactly why it should be your second choice.',
 $b$Every quadratic $ax^2 + bx + c = 0$ can be solved with the formula $x = (-b \pm \sqrt{b^2 - 4ac})/2a$. That universality makes it tempting, but in an exam it is slower and more error-prone than factorising — and it hides useful information.

## What factorising gives you
If you can write $ax^2 + bx + c = (x-p)(x-q)$, then the roots are $p$ and $q$ immediately, and the vertex sits at the midpoint. You can sketch the curve without calculating coordinates. Factorising also reveals the discriminant's sign (the two brackets are real when the curve crosses the axis).

## When to use the formula
Use it when the coefficients are awkward, when the discriminant is not a perfect square, or when the question explicitly asks for surd answers. Use it when you cannot find factors quickly — not as a first reflex.

## Completing the square
This is the third route, and it is the one that answers "maximum or minimum value?" directly. Writing $x^2 + bx + c$ as $(x + b/2)^2 + (c - b^2/4)$ turns the quadratic into a statement about a square plus a constant. Since a square is never negative, the minimum is the constant — and the vertex is at $x = -b/2$.

## The three numbers worth checking
For $ax^2 + bx + c$: sum of roots $= -b/a$, product $= c/a$, discriminant $= b^2 - 4ac$. These three checks catch most arithmetic slips before they cost a mark.

## Exam strategy
Try to factorise for ten seconds. If nothing clean appears, switch to the formula and do not look back. The candidates who lose time are the ones who keep hunting for factors they will never find.$b$, 5);

-- ------------------------------------------------------------------ videos
insert into public.videos (subject_slug, topic_slug, youtube_id, title, channel, blurb) values
('physics','kinematics','txJP95lBv98','Projectile motion | AP Physics','Khan Academy','Why horizontal and vertical motion can be solved independently, with a worked launch.'),
('physics','kinematics','ZZ39o1rAZWY','Projectile at an angle','Khan Academy','Resolving an angled launch into components — the exact move JAMB expects.'),
('physics','kinematics','vo3bMkAf9RM','Plotting projectile displacement, acceleration and velocity','Khan Academy','The graph-reading version of projectile questions, frame by frame.'),
('physics','kinematics','dHjWVlfNraM','Kinematics In One Dimension','The Organic Chemistry Tutor','The full suvat toolkit with timed examples.'),
('physics','kinematics','8NLzuURxFwY','Introduction to Projectile Motion — Formulas and Equations','The Organic Chemistry Tutor','Formula-first walkthrough for speed under exam pressure.'),
('physics','electricity','lU8qZ0UyZUk','Electric charge and electric force','Khan Academy','Charges, Coulomb forces and field intuition.'),
('physics','electricity','D2Lh7Dlqn1o','Electric fields (part 1)','Khan Academy','Field strength as force per unit charge, with diagrams.'),
('physics','electricity','1IXsgu44pMs','Conservation of electric charge','Khan Academy','Why charge is neither created nor destroyed in a circuit.'),
('chemistry','stoichiometry','7Cfq0ilw7ps','Stoichiometry Basic Introduction','The Organic Chemistry Tutor','Mole-to-mole and gram-to-gram conversions, worked slowly.'),
('chemistry','stoichiometry','3zmeVamEsWI','Stoichiometry Mole to Mole Conversions','The Organic Chemistry Tutor','Reading molar ratios directly from a balanced equation.'),
('chemistry','stoichiometry','wI56mHUDJgQ','Introduction to Moles','Tyler DeWitt','What a mole actually is, without the formula fog.'),
('chemistry','stoichiometry','CMnkSb2YsXI','Converting Between Grams and Moles','Tyler DeWitt','The molar-mass bridge, both directions.'),
('chemistry','stoichiometry','w1njGAkc8og','How To Calculate Percent Yield','The Organic Chemistry Tutor','Theoretical vs actual yield — a recurring UTME calculation.'),
('biology','cell-structure','8IlzKri08kk','Introduction to Cells: The Grand Cell Tour','Amoeba Sisters','Organelle tour with plant and animal comparisons.'),
('biology','cell-structure','6mgkoqcm6Sg','Cell Organelles and Structures Review','Amoeba Sisters','A review game — pause and answer before they do.'),
('biology','cellular-processes','-dbRterutHY','Intro to Cell Signaling','Amoeba Sisters','Receptors and signalling, the modern-Biology extension.'),
('mathematics','quadratics','IWigvJcCAJ0','Introduction to the quadratic equation','Khan Academy','Where the formula comes from and what the roots mean.'),
('mathematics','quadratics','N30tN9158Kc','Solving a quadratic by factoring','Khan Academy','The fastest route when the numbers cooperate.'),
('mathematics','quadratics','iulx0z1lz8M','Example: using the quadratic formula','Khan Academy','A clean formula application, sign errors included as warnings.'),
('english','lexis-structure','USeBA_VM-Ys','Concord in English Language Explained (JAMB, NECO & WAEC)','Grammar Clinic','Concord rules written for Nigerian exam candidates.'),
('english','lexis-structure','27OIlnVNZqI','Concord — All you need to know','English with Innocent','Grammatical, notional and proximity concord in one sitting.'),
('english','lexis-structure','n-11FijFAmM','Master ALL 12 English Tenses in 2.5 Hours','English Grammar Course','Long-form tense coverage; use the timestamp chips to jump.');

-- ------------------------------------------------------------------ annotations (timestamp pop-ups)
insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 20, 140, 'Two stories, one clock', 'The horizontal and vertical motions are independent — that is why you can solve them separately. Try the cannon yourself.', 'sim', 'projectile-motion', null
from public.videos where youtube_id = 'txJP95lBv98';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 140, 320, 'The formula behind the arc', 'Range, apex and flight time: why the range peaks at 45°.', 'article', null, 'projectile-two-stories'
from public.videos where youtube_id = 'txJP95lBv98';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 60, 210, 'Play with the launch angle', 'Open the simulation and change the angle while the video is paused here. Watch the range respond.', 'sim', 'projectile-motion', null
from public.videos where youtube_id = 'ZZ39o1rAZWY';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 30, 240, 'Read the article first', 'The two-stories framing, in 400 words. Return here when you are done.', 'article', null, 'projectile-two-stories'
from public.videos where youtube_id = '8NLzuURxFwY';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 240, 480, 'A better way to see range', 'Drag the speed slider until the range matches the example in the video.', 'sim', 'projectile-motion', null
from public.videos where youtube_id = '8NLzuURxFwY';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 480, 600, 'The vy = 0 trap at the apex', 'At maximum height only the vertical velocity is zero. JAMB has tested this distinction repeatedly.', 'note', null, null
from public.videos where youtube_id = '8NLzuURxFwY';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 25, 200, 'v = u + at, in action', 'Every suvat equation is just constant acceleration in disguise.', 'note', null, null
from public.videos where youtube_id = 'dHjWVlfNraM';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 300, 540, 'Sign conventions', 'Choose a positive direction once, then keep it. Most kinematics errors are sign errors.', 'note', null, null
from public.videos where youtube_id = 'dHjWVlfNraM';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 60, 240, 'Why fields matter for circuits', 'Field strength is force per unit charge. Keep this picture; it explains why current flows.', 'note', null, null
from public.videos where youtube_id = 'lU8qZ0UyZUk';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 40, 260, 'Field lines never cross', 'Draw the field around two like charges before you watch the next minute.', 'note', null, null
from public.videos where youtube_id = 'D2Lh7Dlqn1o';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 240, 420, 'Charge is conserved', 'Not one coulomb appears or disappears in a closed circuit. That is the whole idea.', 'note', null, null
from public.videos where youtube_id = '1IXsgu44pMs';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 20, 200, 'The mole as a bridge', 'If the mole still feels abstract, read the bridge article before continuing.', 'article', null, 'mole-bridge'
from public.videos where youtube_id = '7Cfq0ilw7ps';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 200, 460, 'Balance first, convert second', 'Mark where he balances the equation — that is the step JAMB marks.', 'note', null, null
from public.videos where youtube_id = '7Cfq0ilw7ps';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 460, 660, 'Limiting reagent alert', 'When two amounts are given, the smaller ratio is the limit. Add this to your margin notes.', 'note', null, null
from public.videos where youtube_id = '7Cfq0ilw7ps';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 30, 180, 'Ratios come from the balance', 'The equation gives mole ratios, never mass ratios.', 'note', null, null
from public.videos where youtube_id = '3zmeVamEsWI';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 20, 200, 'A dozen, but for atoms', 'Tyler DeWitt''s concrete approach is the fastest cure for mole anxiety.', 'article', null, 'mole-bridge'
from public.videos where youtube_id = 'wI56mHUDJgQ';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 30, 240, 'The molar-mass bridge', 'Grams in, moles out — practice the direction until it is automatic.', 'note', null, null
from public.videos where youtube_id = 'CMnkSb2YsXI';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 60, 300, 'Yield questions, decoded', 'Theoretical yield comes from the limiting reagent; actual yield is measured.', 'note', null, null
from public.videos where youtube_id = 'w1njGAkc8og';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 25, 120, 'One cell, many jobs', 'Name three organelles before the video names them.', 'note', null, null
from public.videos where youtube_id = '8IlzKri08kk';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 120, 300, 'Plant vs animal, precisely', 'Cell wall and chloroplasts are the two structural checks JAMB asks for.', 'note', null, null
from public.videos where youtube_id = '8IlzKri08kk';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 300, 360, 'Where mitosis fits', 'The cell-cycle mention at the end connects to the bookkeeping article.', 'article', null, 'mitosis-bookkeeping'
from public.videos where youtube_id = '8IlzKri08kk';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 30, 200, 'Function follows structure', 'Match each organelle to its job while the review runs.', 'note', null, null
from public.videos where youtube_id = '6mgkoqcm6Sg';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 30, 180, 'Receptors are doors', 'Signalling needs a receptor, a message and a response — three marks in one sentence.', 'note', null, null
from public.videos where youtube_id = '-dbRterutHY';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 20, 200, 'Where the formula comes from', 'Completing the square is the origin story of the quadratic formula.', 'note', null, null
from public.videos where youtube_id = 'IWigvJcCAJ0';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 200, 480, 'Factorise before you formula', 'Ten seconds of factor-hunting saves two minutes of formula work.', 'article', null, 'factor-first'
from public.videos where youtube_id = 'IWigvJcCAJ0';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 30, 240, 'The 10-second factor check', 'If no clean pair appears, switch to the formula without regret.', 'article', null, 'factor-first'
from public.videos where youtube_id = 'N30tN9158Kc';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 30, 210, 'Sign errors at the substitution', 'Negative b is the most common slip in the formula. Write the bracket first.', 'note', null, null
from public.videos where youtube_id = 'iulx0z1lz8M';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 30, 180, 'Find the subject first', 'Box the subject before you pick the verb — the whole method in one move.', 'article', null, 'concord-find-subject'
from public.videos where youtube_id = 'USeBA_VM-Ys';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 180, 360, 'Prepositional phrases are traps', 'Cross out everything between subject and verb, then re-read.', 'note', null, null
from public.videos where youtube_id = 'USeBA_VM-Ys';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 40, 240, 'Three kinds of concord', 'Grammatical, notional and proximity — know which is being tested.', 'note', null, null
from public.videos where youtube_id = '27OIlnVNZqI';

insert into public.video_annotations (video_id, t_start, t_end, title, body, kind, sim_slug, article_slug)
select id, 30, 180, 'Tense is a timeline', 'Map each tense to a point or span on a timeline before memorising forms.', 'note', null, null
from public.videos where youtube_id = 'n-11FijFAmM';

-- ------------------------------------------------------------------ JAMB combinations (Pathfinder)
insert into public.jamb_combos (career, course, master_key, jamb_subjects, olevel_note, notes) values
('Medicine','Medicine & Surgery','Physics, Chemistry, Biology', array['Physics','Chemistry','Biology'], 'Five credits including English, Mathematics, Physics, Chemistry and Biology, ideally one sitting.', 'The strictest combination in the brochure: no substitutions accepted by most schools.'),
('Medicine','Nursing Science','Physics, Chemistry, Biology', array['Physics','Chemistry','Biology'], 'Credits in English, Mathematics, Physics, Chemistry and Biology.', 'Same science trio as Medicine; cut-off is lower but requirements are identical.'),
('Medicine','Pharmacy','Physics, Chemistry, Biology', array['Physics','Chemistry','Biology'], 'Credits in English, Mathematics, Physics, Chemistry and Biology.', 'Do not substitute Agricultural Science for Biology here.'),
('Medicine','Dentistry','Physics, Chemistry, Biology', array['Physics','Chemistry','Biology'], 'Credits in English, Mathematics, Physics, Chemistry and Biology.', ''),
('Medicine','Medical Laboratory Science','Physics, Chemistry, Biology', array['Physics','Chemistry','Biology'], 'Credits in English, Mathematics, Physics, Chemistry and Biology.', ''),
('Medicine','Physiotherapy','Physics, Chemistry, Biology', array['Physics','Chemistry','Biology'], 'Credits in English, Mathematics, Physics, Chemistry and Biology.', ''),
('Science','Biochemistry','Chemistry, Biology, plus Physics or Mathematics', array['Chemistry','Biology','Physics'], 'Credits in English, Mathematics, Chemistry, Biology and Physics.', 'Physics is the safer third subject unless the target school states otherwise.'),
('Science','Microbiology','Chemistry, Biology, plus Physics or Mathematics', array['Chemistry','Biology','Physics'], 'Credits in English, Mathematics, Chemistry, Biology and Physics.', ''),
('Science','Anatomy / Physiology','Physics, Chemistry, Biology', array['Physics','Chemistry','Biology'], 'Credits in English, Mathematics, Physics, Chemistry and Biology.', ''),
('Science','Agriculture / Agric Science','Chemistry, Biology (or Agric Science), plus Physics or Mathematics', array['Chemistry','Biology','Physics'], 'Credits in English, Mathematics, Chemistry, Biology/Agric Science and one other science.', 'Some schools accept Agric Science in place of Biology — confirm in IBASS.'),
('Engineering','All Engineering (Mechanical, Electrical, Civil, Petroleum)','Mathematics, Physics, Chemistry', array['Mathematics','Physics','Chemistry'], 'Credits in English, Mathematics, Physics, Chemistry and one other science.', 'The master key for the engineering faculty.'),
('Engineering','Computer Science','Mathematics, Physics, plus one science subject', array['Mathematics','Physics','Chemistry'], 'Credits in English, Mathematics, Physics and two other science subjects.', 'Chemistry is the usual third subject; some schools accept Biology or Economics.'),
('Engineering','Software Engineering / Cyber Security','Mathematics, Physics, plus one science subject', array['Mathematics','Physics','Chemistry'], 'Credits in English, Mathematics, Physics and one other science.', 'Newer programmes; confirm the third subject with the specific university.'),
('Built Environment','Architecture','Mathematics, Physics, plus Chemistry, Geography or Fine Art', array['Mathematics','Physics','Chemistry'], 'Credits in English, Mathematics, Physics and two relevant subjects.', 'Requirements genuinely vary by school — check IBASS before registering.'),
('Built Environment','Building / Quantity Surveying','Mathematics, Physics, plus Chemistry, Geography or Economics', array['Mathematics','Physics','Chemistry'], 'Credits in English, Mathematics, Physics and two relevant subjects.', ''),
('Science','Statistics','Mathematics, plus two of Physics, Chemistry, Economics', array['Mathematics','Physics','Economics'], 'Credits in English, Mathematics and three relevant subjects.', ''),
('Science','Industrial Chemistry','Chemistry, Mathematics, plus Physics or Biology', array['Chemistry','Mathematics','Physics'], 'Credits in English, Mathematics, Chemistry, Physics and Biology.', ''),
('Science','Geology / Geophysics','Physics, Chemistry, plus Mathematics or Biology', array['Physics','Chemistry','Mathematics'], 'Credits in English, Mathematics, Physics, Chemistry and Biology.', ''),
('Law','Law','Literature in English, plus two Arts or Social Science subjects', array['Literature in English','Government','Economics'], 'Five credits including English, Literature in English and Mathematics.', 'Literature is effectively non-negotiable at most institutions. Commercial subjects alone will not qualify you.'),
('Media','Mass Communication','Literature or Government, plus two Arts/Social Science subjects', array['Literature in English','Government','Economics'], 'Credits in English, Literature and three other subjects.', 'Literature strengthens the application; some schools accept Government in its place.'),
('Arts','English & Literary Studies','Literature in English, plus two Arts or Social Science subjects', array['Literature in English','Government','CRS/IRS'], 'Credits in English, Literature and three relevant Arts subjects.', ''),
('Social Science','Political Science','Government, plus two of Economics, History, Literature, CRS/IRS', array['Government','Economics','Literature in English'], 'Credits in English, Government and three relevant subjects.', ''),
('Social Science','International Relations','Government, plus two Arts or Social Science subjects', array['Government','Economics','Literature in English'], 'Credits in English, Government and three relevant subjects.', ''),
('Social Science','Sociology / Psychology','Any three Arts or Social Science subjects', array['Government','Economics','Literature in English'], 'Credits in English, Mathematics and three relevant subjects.', 'Psychology at some schools asks for Biology — confirm your target school.'),
('Arts','History & International Studies','History or Government, plus two Arts subjects', array['History','Government','Literature in English'], 'Credits in English, History/Government and three relevant subjects.', ''),
('Arts','Theatre Arts','Literature in English, plus two Arts subjects', array['Literature in English','Government','CRS/IRS'], 'Credits in English, Literature and three relevant subjects.', ''),
('Arts','Linguistics / Languages','Literature or the target language, plus two Arts subjects', array['Literature in English','Government','CRS/IRS'], 'Credits in English, Literature and three relevant subjects.', ''),
('Management','Accounting','Mathematics, Economics, plus one of Commerce, Government or another trade subject', array['Mathematics','Economics','Commerce'], 'Credits in English, Mathematics, Economics and two relevant subjects.', 'Mathematics and Economics together keep the whole business faculty open.'),
('Management','Economics','Mathematics, Economics, plus one Arts or Social Science subject', array['Mathematics','Economics','Government'], 'Credits in English, Mathematics, Economics and two relevant subjects.', ''),
('Management','Business Administration','Mathematics, Economics, plus one Arts or Social Science subject', array['Mathematics','Economics','Commerce'], 'Credits in English, Mathematics, Economics and two relevant subjects.', ''),
('Management','Banking & Finance','Mathematics, Economics, plus one relevant subject', array['Mathematics','Economics','Commerce'], 'Credits in English, Mathematics, Economics and two relevant subjects.', ''),
('Management','Marketing','Mathematics or Economics, plus two relevant subjects', array['Mathematics','Economics','Commerce'], 'Credits in English, Mathematics, Economics and two relevant subjects.', ''),
('Management','Public Administration','Government, plus two Arts/Social Science subjects', array['Government','Economics','Literature in English'], 'Credits in English, Government and three relevant subjects.', ''),
('Education','Education & Biology','Mirror the Biology combination', array['Biology','Chemistry','Physics'], 'Credits in English, Mathematics, Biology and two other science subjects.', 'Education courses mirror the teaching subject; check the exact pair at your school.');
