/**
 * Mathematics top-up — 36 questions across the eight topics.
 */
const e = (topic, stem, opts, ans, expl, f = false, d = 2) => ({ topic, stem, opts, ans, expl, f, d, steps: null });

export const singles = [
  /* ---- number & surds ---- */
  e("number-surds", "Simplify √50 + √18", ["4√2", "8√2", "2√17", "6√2"], "B", "√50 = 5√2 and √18 = 3√2; sum = 8√2.", true),
  e("number-surds", "Rationalise 1/(1 + √2)", ["√2 − 1", "1 − √2", "1 + √2", "(1+√2)/2"], "A", "Multiply by (1 − √2)/(1 − √2): denominator 1 − 2 = −1, giving −(1 − √2) = √2 − 1."),
  e("number-surds", "If √x = 2√3, then x equals", ["6", "12", "24", "36"], "B", "x = (2√3)² = 4 × 3 = 12."),
  e("number-surds", "Convert 0.272727… to a fraction", ["27/100", "3/11", "27/99", "1/3"], "B", "Repeating block 27 → 27/99 = 3/11. Note 27/99 simplifies, the unsimplified form isn't the answer."),

  /* ---- quadratics ---- */
  e("quadratics", "The roots of x² − 5x + 6 = 0 are", ["1 and 6", "2 and 3", "−2 and −3", "5 and 6"], "B", "Factor: (x − 2)(x − 3); sum 5, product 6.", true),
  e("quadratics", "The discriminant of 2x² + 3x − 2 = 0 is", ["25", "17", "9", "−7"], "A", "b² − 4ac = 9 + 16 = 25 — two distinct real roots."),
  e("quadratics", "For what value of k does x² + kx + 9 = 0 have equal roots?", ["±3", "±6", "±9", "0"], "B", "Equal roots ⇒ discriminant zero: k² = 36."),
  e("quadratics", "Express 2x² − 8x + 3 in the form a(x − p)² + q", ["2(x − 2)² − 5", "2(x − 4)² + 3", "2(x − 2)² + 5", "(x − 2)² − 5"], "A", "2(x² − 4x) + 3 = 2[(x−2)² − 4] + 3 = 2(x−2)² − 5."),

  /* ---- indices & logs ---- */
  e("indices-logs", "Evaluate 27^(2/3)", ["9", "18", "6", "3"], "A", "Cube root of 27 is 3; 3² = 9.", true),
  e("indices-logs", "Solve 3^(2x) = 81", ["x = 2", "x = 3", "x = 4", "x = 8"], "A", "81 = 3⁴ = 3^(2x) → 2x = 4 → x = 2."),
  e("indices-logs", "If log₁₀ x = 3, then x is", ["30", "100", "1000", "3"], "C", "log₁₀ x = 3 means x = 10³ = 1000."),
  e("indices-logs", "log₁₀ 4 + log₁₀ 25 equals", ["log₁₀ 29", "2", "100", "log₁₀ 10"], "B", "Sum of logs of factors = log of product: log 100 = 2."),
  e("indices-logs", "Simplify (2x³) × (4x²) ", ["8x⁵", "6x⁵", "8x⁶", "6x⁶"], "A", "Coefficients multiply (2×4), indices add (3+2) → 8x⁵."),

  /* ---- progressions ---- */
  e("progressions", "The 10th term of the A.P. 3, 7, 11, … is", ["39", "43", "36", "40"], "A", "a = 3, d = 4: T₁₀ = 3 + 9×4 = 39.", true),
  e("progressions", "The sum of the first 20 terms of the A.P. 2, 5, 8, … is", ["590", "610", "570", "620"], "B", "Sₙ = n/2(2a + (n−1)d) = 10(4 + 57) = 610."),
  e("progressions", "The 5th term of the G.P. 3, 6, 12, … is", ["24", "48", "96", "36"], "B", "r = 2: 3 × 2⁴ = 48."),
  e("progressions", "The sum to infinity of the G.P. 8 + 4 + 2 + … is", ["16", "12", "24", "does not exist"], "A", "|r| = ½ < 1: S∞ = 8/(1 − ½) = 16."),
  e("progressions", "Three consecutive terms of an A.P. have sum 21 and product 231. The middle term is", ["5", "7", "9", "11"], "B", "Let terms be (a−d), a, (a+d): 3a = 21 → a = 7."),

  /* ---- trigonometry ---- */
  e("trigonometry", "The value of sin 30° × cos 60° is", ["1/4", "1/2", "3/4", "√3/4"], "A", "½ × ½ = ¼.", true),
  e("trigonometry", "If sin θ = 3/5 and θ is acute, then tan θ equals", ["4/5", "3/4", "4/3", "5/4"], "B", "3-4-5 triangle: cos = 4/5, tan = 3/4."),
  e("trigonometry", "The angle of elevation of the top of a tower 20 m tall from a point 20 m away (level ground) is", ["30°", "45°", "60°", "90°"], "B", "tan θ = 20/20 = 1 → 45°."),
  e("trigonometry", "Simplify sin²θ + cos²θ", ["1", "2", "0", "tan²θ"], "A", "The Pythagorean identity — always 1."),
  e("trigonometry", "In triangle ABC, a = 8, b = 6 and angle C = 60°. Area =", ["12√3", "24", "12", "20.8"], "A", "Area = ½ab sin C = ½ × 8 × 6 × sin 60° = 24 × (√3/2) = 12√3."),

  /* ---- statistics ---- */
  e("statistics", "The mean of 2, 4, 6, 8, 10 is", ["5", "6", "7", "8"], "B", "Sum 30 over 5 values = 6.", true),
  e("statistics", "The median of 3, 7, 2, 9, 5 is", ["5", "7", "3", "9"], "A", "Ordered: 2, 3, 5, 7, 9 — the middle value is 5."),
  e("statistics", "The mode of the data set 2, 3, 3, 5, 7, 3, 8 is", ["3", "5", "7", "no mode"], "A", "3 appears three times — the most frequent."),
  e("statistics", "If every value in a data set is increased by 5, the mean", ["increases by 5", "is unchanged", "increases by 25", "increases by 5n"], "A", "Shifting every value shifts the mean by the same amount; spread is unaffected."),
  e("statistics", "The range of 11, 3, 8, 15, 6 is", ["15", "12", "18", "6"], "B", "Range = max − min = 15 − 3 = 12."),

  /* ---- geometry ---- */
  e("geometry", "The interior angles of a regular hexagon sum to", ["540°", "720°", "900°", "1080°"], "B", "(n − 2) × 180° = 4 × 180° = 720°.", true),
  e("geometry", "Each interior angle of a regular hexagon is", ["60°", "120°", "108°", "135°"], "B", "720° ÷ 6 = 120°."),
  e("geometry", "The area of a circle of radius 7 cm (π = 22/7) is", ["44 cm²", "154 cm²", "49 cm²", "22 cm²"], "B", "πr² = 22/7 × 49 = 154 cm²."),
  e("geometry", "Two angles are complementary. If one is 35°, the other is", ["145°", "55°", "65°", "125°"], "B", "Complementary angles sum to 90°."),

  /* ---- calculus ---- */
  e("calculus", "The derivative of 3x² is", ["3x", "6x", "6x²", "3"], "B", "Power rule: d/dx(axⁿ) = anxⁿ⁻¹ → 6x.", true),
  e("calculus", "The gradient of y = x³ at x = 2 is", ["6", "8", "12", "4"], "C", "y′ = 3x² = 3 × 4 = 12."),
  e("calculus", "∫4x dx equals", ["4x² + C", "2x² + C", "x⁴ + C", "4x + C"], "B", "∫ax dx = ax²/2 → 2x² + C."),
  e("calculus", "The maximum point of y = −x² + 4x occurs at x =", ["2", "−2", "4", "1"], "A", "y′ = −2x + 4 = 0 → x = 2 (y″ = −2 < 0, a maximum)."),
];
